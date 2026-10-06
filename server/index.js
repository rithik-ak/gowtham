import 'dotenv/config'
import bcrypt from 'bcryptjs'
import cookieSession from 'cookie-session'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { randomBytes, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number(process.env.PORT) || 3001
const isProduction = process.env.NODE_ENV === 'production'
const directory = path.dirname(fileURLToPath(import.meta.url))
const dataPath = process.env.DATA_STORE_PATH ? path.resolve(process.env.DATA_STORE_PATH) : path.join(directory, 'data', 'store.json')
const dataDirectory = path.dirname(dataPath)
const sessionSecret = process.env.SESSION_SECRET
const categories = new Set(['Furniture', 'Electrical', 'Plumbing', 'Classroom', 'Other'])
const priorities = new Set(['Low', 'Medium', 'High', 'Critical'])
const statuses = new Set(['Pending', 'In Progress', 'Resolved'])
const years = new Set(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Other'])
const starterIssues = [
  { id: 'CC-2048', title: 'Water pooling beneath the sink', category: 'Plumbing', location: 'Science Hall · Room 218', description: 'There is a steady leak under the lab sink, and the cabinet floor is wet.', priority: 'High', status: 'In Progress', reportedAt: '2026-10-04T08:42:00.000Z', reporter: 'Campus member' },
  { id: 'CC-2047', title: 'Projector will not power on', category: 'Electrical', location: 'North Library · Seminar 3', description: 'The projector has stopped responding to both the wall switch and remote.', priority: 'Critical', status: 'Pending', reportedAt: '2026-10-04T07:18:00.000Z', reporter: 'Jordan Lee' },
  { id: 'CC-2046', title: 'Loose chair leg', category: 'Furniture', location: 'Arts Building · Studio 104', description: 'One of the chairs near the windows has a loose rear leg and feels unsafe.', priority: 'Medium', status: 'Pending', reportedAt: '2026-10-03T15:26:00.000Z', reporter: 'Avery Patel' },
  { id: 'CC-2045', title: 'Ceiling light flickering', category: 'Electrical', location: 'West Hall · Room 012', description: 'The light nearest the main entrance flickers continuously.', priority: 'Low', status: 'Resolved', reportedAt: '2026-10-03T11:05:00.000Z', reporter: 'Sam Rivera' },
  { id: 'CC-2044', title: 'Whiteboard track is jammed', category: 'Classroom', location: 'Engineering · Lecture 2', description: 'The sliding whiteboard catches halfway and needs its track checked.', priority: 'Low', status: 'In Progress', reportedAt: '2026-10-02T13:54:00.000Z', reporter: 'Noah Williams' },
  { id: 'CC-2043', title: 'Broken drawer handle', category: 'Furniture', location: 'Student Center · Help Desk', description: 'The top desk drawer handle has come off and is inside the drawer.', priority: 'Medium', status: 'Resolved', reportedAt: '2026-10-01T09:32:00.000Z', reporter: 'Riley Morgan' },
]

let store = { admins: [], adminRequests: [], students: [], issues: [], migratedRollNumbers: [], settings: { campusName: 'North Campus' } }
let saveQueue = Promise.resolve()
let adminPasswordHash = ''

function normalizeRollNumber(value) {
  return String(value ?? '').trim().toUpperCase()
}

function publicStudent(student) {
  return { name: student.name, year: student.year, department: student.department, rollNumber: student.rollNumber, createdAt: student.createdAt }
}

function currentUser(request) {
  return request.session?.user ?? null
}

function requireUser(request, response, next) {
  const user = currentUser(request)
  if (!user) return response.status(401).json({ error: 'Sign in to continue.' })
  if (user.role === 'student' && !store.students.some((student) => student.rollNumber === user.rollNumber)) {
    request.session = null
    return response.status(401).json({ error: 'This student account is no longer active. Sign in again.' })
  }
  next()
}

function requireAdmin(request, response, next) {
  const user = currentUser(request)
  if (!user) return response.status(401).json({ error: 'Sign in as an Admin to continue.' })
  if (user.role !== 'admin') return response.status(403).json({ error: 'Admin access is required.' })
  const active = user.username === process.env.ADMIN_USERNAME && Boolean(adminPasswordHash)
    || store.admins.some((admin) => admin.username === user.username)
  if (!active) {
    request.session = null
    return response.status(401).json({ error: 'This Admin account is no longer active. Sign in again.' })
  }
  next()
}

function validProfile(body) {
  const name = String(body?.name ?? '').trim()
  const department = String(body?.department ?? '').trim()
  const year = String(body?.year ?? '')
  const rollNumber = normalizeRollNumber(body?.rollNumber)
  return name.length > 0 && name.length <= 80 && department.length > 0 && department.length <= 80
    && years.has(year) && rollNumber.length > 0 && rollNumber.length <= 40
    ? { name, department, year, rollNumber }
    : null
}

function validAdminUsername(value) {
  return /^[a-zA-Z0-9._-]{3,40}$/.test(String(value ?? '').trim())
}

function validIssue(body, reporter, preserve = false) {
  const description = String(body?.description ?? '').trim()
  const location = String(body?.location ?? '').trim()
  const category = String(body?.category ?? '')
  const priority = body?.priority === 'Urgent' ? 'Critical' : String(body?.priority ?? '')
  const status = preserve && statuses.has(body?.status) ? body.status : 'Pending'
  const title = String(body?.title ?? '').trim() || description.split(/[.!?]/, 1)[0].slice(0, 80) || 'Maintenance issue'
  if (!description || description.length > 500 || !location || location.length > 100 || !categories.has(category) || !priorities.has(priority)) return null
  return {
    id: preserve && typeof body?.id === 'string' && body.id.length <= 80 ? body.id : `CC-${randomUUID().slice(0, 8).toUpperCase()}`,
    title: title.slice(0, 80), category, location, description, priority, status,
    photoUrl: body?.photoUrl || undefined,
    reportedAt: preserve && Number.isFinite(Date.parse(body?.reportedAt)) ? new Date(body.reportedAt).toISOString() : new Date().toISOString(),
    reporter,
  }
}

async function persistStore() {
  const snapshot = JSON.stringify(store, null, 2)
  saveQueue = saveQueue.then(async () => {
    await mkdir(dataDirectory, { recursive: true })
    const temporaryPath = `${dataPath}.tmp`
    await writeFile(temporaryPath, snapshot, 'utf8')
    await rename(temporaryPath, dataPath)
  })
  return saveQueue
}

async function loadStore() {
  await mkdir(dataDirectory, { recursive: true })
  try {
    const parsed = JSON.parse(await readFile(dataPath, 'utf8'))
    if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.issues)) {
      store = {
        admins: Array.isArray(parsed.admins) ? parsed.admins : [],
        adminRequests: Array.isArray(parsed.adminRequests) ? parsed.adminRequests : [],
        students: parsed.students,
        issues: parsed.issues,
        migratedRollNumbers: Array.isArray(parsed.migratedRollNumbers) ? parsed.migratedRollNumbers : [],
        settings: { campusName: String(parsed.settings?.campusName || 'North Campus').slice(0, 80) },
      }
      return
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read server data; starting from the default dataset.', error)
  }
  store.issues = starterIssues
  await persistStore()
}

app.disable('x-powered-by')
app.set('trust proxy', isProduction ? 1 : false)
app.use((request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Referrer-Policy', 'same-origin')
  next()
})
app.use(express.json({ limit: '10mb' }))
app.use(cookieSession({
  name: 'pec-campus-care-session',
  keys: [sessionSecret || randomBytes(32).toString('hex')],
  httpOnly: true,
  sameSite: 'strict',
  secure: isProduction,
  maxAge: 8 * 60 * 60 * 1000,
}))

const studentLoginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false })
const adminLoginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false })

app.get('/api/auth/session', (request, response) => {
  let user = currentUser(request)
  if (user?.role === 'student' && !store.students.some((student) => student.rollNumber === user.rollNumber)) {
    request.session = null
    user = null
  }
  response.json({ user })
})

app.post('/api/auth/role', (request, response) => {
  const role = request.body?.role
  if (role !== 'student' && role !== 'admin') return response.status(400).json({ error: 'Choose Student or Admin.' })
  request.session = { selectedRole: role }
  response.json({ role })
})

app.post('/api/auth/student/register', studentLoginLimit, async (request, response, next) => {
  try {
    const profile = validProfile(request.body)
    const password = String(request.body?.password ?? '')
    if (!profile || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) return response.status(400).json({ error: 'Enter valid profile details and a password between 8 and 72 bytes.' })
    if (store.students.some((student) => student.rollNumber === profile.rollNumber)) return response.status(409).json({ error: 'An account with this roll number already exists.' })
    const passwordHash = await bcrypt.hash(password, 12)
    if (store.students.some((entry) => entry.rollNumber === profile.rollNumber)) return response.status(409).json({ error: 'An account with this roll number already exists.' })
    const student = { ...profile, passwordHash, createdAt: new Date().toISOString() }
    store.students.push(student)
    await persistStore()
    request.session = { user: { role: 'student', ...publicStudent(student) } }
    response.status(201).json({ user: currentUser(request) })
  } catch (error) { next(error) }
})

app.post('/api/auth/student/login', studentLoginLimit, async (request, response, next) => {
  try {
    const rollNumber = normalizeRollNumber(request.body?.rollNumber)
    const password = String(request.body?.password ?? '')
    const student = store.students.find((entry) => entry.rollNumber === rollNumber)
    if (!student || Buffer.byteLength(password, 'utf8') > 72 || !await bcrypt.compare(password, student.passwordHash)) return response.status(401).json({ error: 'Roll number or password is incorrect.' })
    request.session = { user: { role: 'student', ...publicStudent(student) } }
    response.json({ user: currentUser(request) })
  } catch (error) { next(error) }
})

app.post('/api/auth/admin/login', adminLoginLimit, async (request, response, next) => {
  try {
    const username = String(request.body?.username ?? '').trim()
    const password = String(request.body?.password ?? '')
    const storedAdmin = store.admins.find((admin) => admin.username === username)
    const hasEnvironmentAdmin = Boolean(process.env.ADMIN_USERNAME && adminPasswordHash)
    if (!storedAdmin && !hasEnvironmentAdmin) return response.status(503).json({ error: 'Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in the server environment.' })
    const passwordValid = Buffer.byteLength(password, 'utf8') <= 72 && (storedAdmin
      ? await bcrypt.compare(password, storedAdmin.passwordHash)
      : username === process.env.ADMIN_USERNAME && await bcrypt.compare(password, adminPasswordHash))
    if (!passwordValid) return response.status(401).json({ error: 'Admin username or password is incorrect.' })
    request.session = { user: { role: 'admin', name: 'Administrator', username } }
    response.json({ user: currentUser(request) })
  } catch (error) { next(error) }
})

app.post('/api/auth/admin/requests', adminLoginLimit, async (request, response, next) => {
  try {
    const username = String(request.body?.username ?? '').trim()
    const password = String(request.body?.password ?? '')
    if (!validAdminUsername(username) || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      return response.status(400).json({ error: 'Use a 3-40 character username and a password between 12 and 72 bytes.' })
    }
    const usernameExists = () => username === process.env.ADMIN_USERNAME
      || store.admins.some((admin) => admin.username.toLowerCase() === username.toLowerCase())
      || store.adminRequests.some((pending) => pending.username.toLowerCase() === username.toLowerCase())
    if (usernameExists()) return response.status(409).json({ error: 'An Admin account or request with this username already exists.' })
    const passwordHash = await bcrypt.hash(password, 12)
    if (usernameExists()) return response.status(409).json({ error: 'An Admin account or request with this username already exists.' })
    const requestRecord = { username, passwordHash, createdAt: new Date().toISOString() }
    store.adminRequests.push(requestRecord)
    await persistStore()
    response.status(201).json({ request: { username, createdAt: requestRecord.createdAt } })
  } catch (error) { next(error) }
})

app.post('/api/auth/logout', (request, response) => {
  request.session = null
  response.clearCookie('pec-campus-care-session')
  response.json({ ok: true })
})

app.get('/api/issues', requireUser, (request, response) => {
  const user = currentUser(request)
  const issues = store.issues.map((issue) => user.role === 'admin' || issue.reporter === user.name ? issue : { ...issue, reporter: 'Campus member' })
  response.json({ issues, campusName: store.settings.campusName })
})

app.post('/api/issues', requireUser, async (request, response, next) => {
  try {
    const user = currentUser(request)
    const issue = validIssue(request.body, user.name)
    if (!issue) return response.status(400).json({ error: 'Enter a valid category, location, description, and priority.' })
    while (store.issues.some((entry) => entry.id === issue.id)) issue.id = `CC-${randomUUID().slice(0, 8).toUpperCase()}`
    store.issues.unshift(issue)
    await persistStore()
    response.status(201).json({ issue })
  } catch (error) { next(error) }
})

app.post('/api/issues/import-legacy', requireUser, async (request, response, next) => {
  try {
    const user = currentUser(request)
    const rollNumber = user.role === 'student' ? user.rollNumber : `ADMIN:${user.username}`
    if (store.migratedRollNumbers.includes(rollNumber)) return response.json({ imported: 0 })
    const source = Array.isArray(request.body?.issues) ? request.body.issues.slice(0, 1000) : []
    let imported = 0
    for (const oldIssue of source) {
      if (user.role === 'student' && oldIssue?.reporter !== user.name) continue
      const issue = validIssue(oldIssue, user.role === 'admin' ? String(oldIssue?.reporter ?? 'Campus member').slice(0, 80) : user.name, true)
      if (!issue || store.issues.some((entry) => entry.id === issue.id)) continue
      if (user.role === 'student') issue.status = 'Pending'
      store.issues.push(issue)
      imported += 1
    }
    store.migratedRollNumbers.push(rollNumber)
    await persistStore()
    response.json({ imported })
  } catch (error) { next(error) }
})

app.get('/api/admin/users', requireAdmin, (_request, response) => {
  response.json({
    users: store.students.map(publicStudent),
    admins: store.admins.map(({ username, createdAt }) => ({ username, createdAt })),
    adminRequests: store.adminRequests.map(({ username, createdAt }) => ({ username, createdAt })),
    environmentAdminUsername: process.env.ADMIN_USERNAME || null,
  })
})

app.post('/api/admin/admins', requireAdmin, async (request, response, next) => {
  try {
    const username = String(request.body?.username ?? '').trim()
    const password = String(request.body?.password ?? '')
    if (!validAdminUsername(username) || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      return response.status(400).json({ error: 'Use a 3-40 character username and a password between 12 and 72 bytes.' })
    }
    const usernameExists = () => username === process.env.ADMIN_USERNAME
      || store.admins.some((admin) => admin.username.toLowerCase() === username.toLowerCase())
      || store.adminRequests.some((pending) => pending.username.toLowerCase() === username.toLowerCase())
    if (usernameExists()) {
      return response.status(409).json({ error: 'An Admin account with this username already exists.' })
    }
    const passwordHash = await bcrypt.hash(password, 12)
    if (usernameExists()) {
      return response.status(409).json({ error: 'An Admin account with this username already exists.' })
    }
    const admin = { username, passwordHash, createdAt: new Date().toISOString() }
    store.admins.push(admin)
    await persistStore()
    response.status(201).json({ admin: { username: admin.username, createdAt: admin.createdAt } })
  } catch (error) { next(error) }
})

app.post('/api/admin/admin-requests/:username/approve', requireAdmin, async (request, response, next) => {
  try {
    const username = String(request.params.username ?? '').trim()
    const index = store.adminRequests.findIndex((pending) => pending.username.toLowerCase() === username.toLowerCase())
    if (index < 0) return response.status(404).json({ error: 'Admin account request not found.' })
    if (username === process.env.ADMIN_USERNAME || store.admins.some((admin) => admin.username.toLowerCase() === username.toLowerCase())) {
      return response.status(409).json({ error: 'An Admin account with this username already exists.' })
    }
    const [pending] = store.adminRequests.splice(index, 1)
    const admin = { username: pending.username, passwordHash: pending.passwordHash, createdAt: pending.createdAt }
    store.admins.push(admin)
    await persistStore()
    response.json({ admin: { username: admin.username, createdAt: admin.createdAt } })
  } catch (error) { next(error) }
})

app.delete('/api/admin/admin-requests/:username', requireAdmin, async (request, response, next) => {
  try {
    const username = String(request.params.username ?? '').trim()
    const index = store.adminRequests.findIndex((pending) => pending.username.toLowerCase() === username.toLowerCase())
    if (index < 0) return response.status(404).json({ error: 'Admin account request not found.' })
    store.adminRequests.splice(index, 1)
    await persistStore()
    response.json({ ok: true })
  } catch (error) { next(error) }
})

app.delete('/api/admin/admins/:username', requireAdmin, async (request, response, next) => {
  try {
    const username = String(request.params.username ?? '').trim()
    if (username === process.env.ADMIN_USERNAME) return response.status(400).json({ error: 'The environment-provisioned Admin cannot be deleted here.' })
    if (username === currentUser(request).username) return response.status(400).json({ error: 'Sign in as another Admin before deleting this account.' })
    const index = store.admins.findIndex((admin) => admin.username.toLowerCase() === username.toLowerCase())
    if (index < 0) return response.status(404).json({ error: 'Admin account not found.' })
    if (!process.env.ADMIN_USERNAME && store.admins.length === 1) return response.status(400).json({ error: 'The last Admin account cannot be deleted.' })
    store.admins.splice(index, 1)
    await persistStore()
    response.json({ ok: true })
  } catch (error) { next(error) }
})

app.delete('/api/admin/users/:rollNumber', requireAdmin, async (request, response, next) => {
  try {
    const rollNumber = normalizeRollNumber(request.params.rollNumber)
    const index = store.students.findIndex((student) => student.rollNumber === rollNumber)
    if (index < 0) return response.status(404).json({ error: 'Student account not found.' })
    store.students.splice(index, 1)
    store.migratedRollNumbers = store.migratedRollNumbers.filter((entry) => entry !== rollNumber)
    await persistStore()
    response.json({ ok: true })
  } catch (error) { next(error) }
})

app.patch('/api/admin/issues/:id', requireAdmin, async (request, response, next) => {
  try {
    const issue = store.issues.find((entry) => entry.id === request.params.id)
    if (!issue) return response.status(404).json({ error: 'Complaint not found.' })
    const allowed = ['title', 'description', 'location', 'category', 'priority', 'status', 'photoUrl']
    for (const key of allowed) {
      if (request.body?.[key] === undefined) continue
      const value = String(request.body[key]).trim()
      if (key === 'category' && !categories.has(value)) return response.status(400).json({ error: 'Invalid category.' })
      if (key === 'priority' && !priorities.has(value)) return response.status(400).json({ error: 'Invalid priority.' })
      if (key === 'status' && !statuses.has(value)) return response.status(400).json({ error: 'Invalid status.' })
      if (key === 'description' && (!value || value.length > 500)) return response.status(400).json({ error: 'Description must be between 1 and 500 characters.' })
      if (key === 'location' && (!value || value.length > 100)) return response.status(400).json({ error: 'Location must be between 1 and 100 characters.' })
      if (key === 'title' && (!value || value.length > 80)) return response.status(400).json({ error: 'Title must be between 1 and 80 characters.' })
      issue[key] = value
    }
    await persistStore()
    response.json({ issue })
  } catch (error) { next(error) }
})

app.delete('/api/admin/issues/:id', requireAdmin, async (request, response, next) => {
  try {
    const index = store.issues.findIndex((issue) => issue.id === request.params.id)
    if (index < 0) return response.status(404).json({ error: 'Complaint not found.' })
    store.issues.splice(index, 1)
    await persistStore()
    response.json({ ok: true })
  } catch (error) { next(error) }
})

app.get('/api/admin/settings', requireAdmin, (_request, response) => {
  response.json(store.settings)
})

app.patch('/api/admin/settings', requireAdmin, async (request, response, next) => {
  try {
    const campusName = String(request.body?.campusName ?? '').trim()
    if (!campusName || campusName.length > 80) return response.status(400).json({ error: 'Campus name must be between 1 and 80 characters.' })
    store.settings.campusName = campusName
    await persistStore()
    response.json(store.settings)
  } catch (error) { next(error) }
})

app.get('/api/admin/reports.csv', requireAdmin, (_request, response) => {
  const header = ['ID', 'Title', 'Category', 'Description', 'Location', 'Priority', 'Status', 'Reported at', 'Reporter']
  const rows = store.issues.map((issue) => [issue.id, issue.title, issue.category, issue.description, issue.location, issue.priority, issue.status, issue.reportedAt, issue.reporter])
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  response.type('text/csv').attachment('pec-campus-care-reports.csv').send(csv)
})

app.use('/api', (_request, response) => response.status(404).json({ error: 'API endpoint not found.' }))
app.use((error, _request, response, _next) => {
  console.error('API request failed:', error)
  response.status(500).json({ error: 'The request could not be completed.' })
})

if (isProduction) {
  app.use(express.static(path.resolve(directory, '../dist')))
  app.get('*', (_request, response) => response.sendFile(path.resolve(directory, '../dist/index.html')))
}

async function start() {
  if (isProduction && (!sessionSecret || sessionSecret.length < 32)) throw new Error('Set SESSION_SECRET to a random value of at least 32 characters in production.')
  if (process.env.ADMIN_PASSWORD) adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
  await loadStore()
  app.listen(port, () => console.log(`PEC CAMPUS CARE API listening on port ${port}`))
}

start().catch((error) => {
  console.error(error)
  process.exitCode = 1
})