import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowDownUp, ArrowLeft, ArrowUpRight, Bell, Building2, Check, CheckCircle2, ChevronDown, CircleAlert, ClipboardList, Clock3, Download, Droplets, Eye, EyeOff, Filter, GraduationCap, Lightbulb, LogOut, MapPin, Plus, Search, Settings, ShieldCheck, Sofa, Trash2, Users, Wrench, X, Sun, Moon } from 'lucide-react'

type Role = 'student' | 'admin'
type AuthMode = 'register' | 'login' | 'admin-request'
type AuthUser = (StudentProfile & { role: 'student' }) | { role: 'admin'; name: string; username: string }
type AdminAccount = { username: string; createdAt: string }
type AdminAccountRequest = { username: string; createdAt: string }

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])
  return (
    <button className="theme-toggle" onClick={() => setIsDark(!isDark)} aria-label="Toggle theme" title="Toggle theme">
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}

function RoleSelection({ onSelect, error }: { onSelect: (role: Role) => void; error?: string }) {
  return <main className="auth-page role-page">
    <header className="auth-topline"><a className="brand auth-brand" href="#account" aria-label="CAMPUS 360"><span className="brand-mark"><Wrench size={19} /></span><span className="brand-copy"><strong>CAMPUS <span>360</span></strong><small>FACILITIES DESK</small></span></a><div style={{display:'flex', gap:'12px', alignItems:'center'}}><ThemeToggle /><span className="auth-local-label"><i /> CAMPUS MAINTENANCE PORTAL</span></div></header>
    <div className="role-layout"><section className="role-intro"><div className="eyebrow">NORTH CAMPUS <span>·</span> MAINTENANCE</div><h1>Welcome to<br />campus care.</h1><p>Choose how you’d like to continue.</p></section>
      <section className="role-options" aria-label="Choose your role">
        {error && <p className="auth-error role-error" role="alert">{error}</p>}
        <button className="role-card role-admin-card" onClick={() => onSelect('admin')}><span className="role-icon"><ShieldCheck size={22} /></span><span className="role-card-copy"><strong>ADMIN</strong><small>Manage campus reports and student accounts</small></span><ArrowUpRight size={18} /></button>
        <button className="role-card role-student-card" onClick={() => onSelect('student')}><span className="role-icon"><GraduationCap size={23} /></span><span className="role-card-copy"><strong>STUDENT</strong><small>Report an issue and follow its progress</small></span><ArrowUpRight size={18} /></button>
        <p className="role-note">Your access and available actions depend on your role.</p>
      </section>
    </div>
    <footer className="auth-footer"><span>CAMPUS 360</span><span>Campus maintenance, kept in the loop.</span></footer>
  </main>
}

function AuthScreen({ role, mode, error, notice, onBack, onModeChange, onSubmit }: { role: Role; mode: AuthMode; error: string; notice: string; onBack: () => void; onModeChange: (mode: AuthMode) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const registering = role === 'student' && mode === 'register'
  const admin = role === 'admin'
  const requestingAdmin = admin && mode === 'admin-request'
  const [showPassword, setShowPassword] = useState(false)
  return <main className="auth-page">
    <header className="auth-topline"><a className="brand auth-brand" href="#account" aria-label="CAMPUS 360"><span className="brand-mark"><Wrench size={19} /></span><span className="brand-copy"><strong>CAMPUS <span>360</span></strong><small>FACILITIES DESK</small></span></a><div style={{display:'flex', gap:'12px', alignItems:'center'}}><ThemeToggle /><button className="auth-back" onClick={onBack}><ArrowLeft size={15} /> Change role</button></div></header>
    <div className="auth-layout">
      <section className="auth-intro"><div className="eyebrow">NORTH CAMPUS <span>·</span> MAINTENANCE</div><h1>Your campus,<br />cared for.</h1><p>One place to report maintenance issues and follow them through to resolution.</p><div className="auth-points"><span><i /> Reports linked to your student profile</span><span><i /> Updates saved on this device</span></div></section>
      <section className="auth-panel" aria-labelledby="auth-title"><div className="section-kicker">{requestingAdmin ? 'ADMIN ACCOUNT REQUEST' : admin ? 'ADMIN ACCESS' : registering ? 'GET STARTED' : 'STUDENT ACCESS'}</div><h2 id="auth-title">{requestingAdmin ? 'Request Admin account' : admin ? 'Admin login' : registering ? 'Create your account' : 'Welcome back'}</h2><p className="auth-subtitle">{requestingAdmin ? 'An existing Admin must approve your account before you can sign in.' : admin ? 'Sign in with your administrator credentials.' : registering ? 'Add your student details to get started.' : 'Sign in with your roll number and password.'}</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <form className="auth-form" onSubmit={onSubmit}>
          {registering && <>
            <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required maxLength={80} /></label>
            <div className="auth-form-row"><label>Study year<select name="year" defaultValue="" required><option value="" disabled>Select year</option>{studyYears.map((year) => <option key={year}>{year}</option>)}</select></label><label>Department<input name="department" placeholder="e.g. Computer Science" required maxLength={80} /></label></div>
          </>}
          <label>{admin ? 'Admin username' : 'Roll number'}<input name={admin ? 'username' : 'rollNumber'} autoComplete="username" placeholder={admin ? 'Administrator username' : 'Your college roll number'} required maxLength={40} /></label>
          <label>Password{admin && mode === 'login' ? <span className="password-input-wrap"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" required maxLength={72} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span> : <input name="password" type="password" autoComplete={registering || requestingAdmin ? 'new-password' : 'current-password'} placeholder={registering ? 'Create a password (8+ characters)' : requestingAdmin ? 'Choose a password (12+ characters)' : 'Your password'} required minLength={registering ? 8 : requestingAdmin ? 12 : undefined} maxLength={72} />}</label>
          {registering && <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Enter your password again" required minLength={8} maxLength={72} /></label>}
          <button className="button button-primary auth-submit" type="submit">{requestingAdmin ? 'Submit account request' : admin ? 'Admin sign in' : registering ? 'Create student account' : 'Student sign in'} <ArrowUpRight size={15} /></button>
        </form>
        {!admin && <p className="auth-switch">{registering ? 'Already have an account?' : 'New to CAMPUS 360?'} <button onClick={() => onModeChange(registering ? 'login' : 'register')}>{registering ? 'Sign in' : 'Create an account'}</button></p>}
        {admin && <p className="auth-switch">{requestingAdmin ? 'Already have an Admin account?' : 'Need an Admin account?'} <button onClick={() => onModeChange(requestingAdmin ? 'login' : 'admin-request')}>{requestingAdmin ? 'Sign in' : 'Request account'}</button></p>}
        <p className="auth-storage-note">{admin ? 'The first Admin account is provisioned by the server owner. Additional accounts are managed inside Admin.' : 'Your profile is stored on the campus server. Passwords are securely hashed.'}</p>
      </section>
    </div>
    <footer className="auth-footer"><span>CAMPUS 360</span><span>Campus maintenance, kept in the loop.</span></footer>
  </main>
}

type Category = 'Furniture' | 'Electrical' | 'Plumbing' | 'Classroom' | 'Other'
type Priority = 'Low' | 'Medium' | 'High' | 'Critical'
type Status = 'Pending' | 'In Progress' | 'Resolved'
type Issue = { id: string; title: string; category: Category; location: string; description: string; priority: Priority; status: Status; reportedAt: string; reporter: string; photoUrl?: string }
type StudentProfile = { name: string; year: string; department: string; rollNumber: string }
type StoredAccount = StudentProfile & { passwordSalt: string; passwordHash: string }

const STORAGE_KEY = 'campus-care-issues'
const ACCOUNTS_STORAGE_KEY = 'pec-campus-care-accounts'
const categories: Category[] = ['Furniture', 'Electrical', 'Plumbing', 'Classroom', 'Other']
const priorities: Priority[] = ['Low', 'Medium', 'High', 'Critical']
const statuses: Status[] = ['Pending', 'In Progress', 'Resolved']
const studyYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Other']
const starterIssues: Issue[] = [
  { id: 'CC-2048', title: 'Water pooling beneath the sink', category: 'Plumbing', location: 'Science Hall · Room 218', description: 'There is a steady leak under the lab sink, and the cabinet floor is wet.', priority: 'High', status: 'In Progress', reportedAt: '2026-10-04T08:42:00', reporter: 'Campus member' },
  { id: 'CC-2047', title: 'Projector will not power on', category: 'Electrical', location: 'North Library · Seminar 3', description: 'The projector has stopped responding to both the wall switch and remote.', priority: 'Critical', status: 'Pending', reportedAt: '2026-10-04T07:18:00', reporter: 'Jordan Lee' },
  { id: 'CC-2046', title: 'Loose chair leg', category: 'Furniture', location: 'Arts Building · Studio 104', description: 'One of the chairs near the windows has a loose rear leg and feels unsafe.', priority: 'Medium', status: 'Pending', reportedAt: '2026-10-03T15:26:00', reporter: 'Avery Patel' },
  { id: 'CC-2045', title: 'Ceiling light flickering', category: 'Electrical', location: 'West Hall · Room 012', description: 'The light nearest the main entrance flickers continuously.', priority: 'Low', status: 'Resolved', reportedAt: '2026-10-03T11:05:00', reporter: 'Sam Rivera' },
  { id: 'CC-2044', title: 'Whiteboard track is jammed', category: 'Classroom', location: 'Engineering · Lecture 2', description: 'The sliding whiteboard catches halfway and needs its track checked.', priority: 'Low', status: 'In Progress', reportedAt: '2026-10-02T13:54:00', reporter: 'Noah Williams' },
  { id: 'CC-2043', title: 'Broken drawer handle', category: 'Furniture', location: 'Student Center · Help Desk', description: 'The top desk drawer handle has come off and is inside the drawer.', priority: 'Medium', status: 'Resolved', reportedAt: '2026-10-01T09:32:00', reporter: 'Riley Morgan' },
]


function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function readIssues(): Issue[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === null) return starterIssues
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return starterIssues
    const seenIds = new Set<string>()
    return parsed.flatMap((value): Issue[] => {
      if (!value || typeof value !== 'object') return []
      const issue = value as Partial<Issue>
      const storedPriority = (value as Record<string, unknown>).priority
      const priority = storedPriority === 'Urgent' ? 'Critical' : storedPriority
      const description = typeof issue.description === 'string' ? issue.description.trim() : ''
      const reportedAt = typeof issue.reportedAt === 'string' && Number.isFinite(Date.parse(issue.reportedAt))
        ? new Date(issue.reportedAt).toISOString()
        : ''
      if (typeof issue.id !== 'string' || !issue.id.trim() || seenIds.has(issue.id)
        || typeof issue.location !== 'string' || !issue.location.trim() || !description || !reportedAt
        || !categories.includes(issue.category as Category) || !priorities.includes(priority as Priority)
        || !statuses.includes(issue.status as Status)) return []
      seenIds.add(issue.id)
      return [{
        id: issue.id,
        title: typeof issue.title === 'string' && issue.title.trim() ? issue.title.trim() : description.slice(0, 80),
        category: issue.category as Category,
        location: issue.location.trim(),
        description,
        priority: priority as Priority,
        status: issue.status as Status,
        reportedAt,
        reporter: typeof issue.reporter === 'string' && issue.reporter.trim() ? issue.reporter.trim() : 'Unknown',
        photoUrl: typeof issue.photoUrl === 'string' ? issue.photoUrl.trim() : undefined,
      }]
    })
  } catch { /* Use the sample queue when storage is unavailable or malformed. */ }
  return starterIssues
}

function normalizeRollNumber(rollNumber: string) {
  return rollNumber.trim().toUpperCase()
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
}

function readAccounts(): StoredAccount[] {
  try {
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((value): StoredAccount[] => {
      if (!value || typeof value !== 'object') return []
      const account = value as Partial<StoredAccount>
      if (typeof account.name !== 'string' || !account.name.trim()
        || typeof account.year !== 'string' || !account.year.trim()
        || typeof account.department !== 'string' || !account.department.trim()
        || typeof account.rollNumber !== 'string' || !account.rollNumber.trim()
        || typeof account.passwordSalt !== 'string' || !/^[\da-f]{32}$/i.test(account.passwordSalt)
        || typeof account.passwordHash !== 'string' || !/^[\da-f]{64}$/i.test(account.passwordHash)) return []
      return [{
        name: account.name.trim(),
        year: account.year.trim(),
        department: account.department.trim(),
        rollNumber: normalizeRollNumber(account.rollNumber),
        passwordSalt: account.passwordSalt,
        passwordHash: account.passwordHash,
      }]
    })
  } catch {
    return []
  }
}

function bytesToHex(bytes: ArrayBuffer | Uint8Array) {
  return Array.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, passwordSalt: string) {
  if (!crypto.subtle) throw new Error('Secure password hashing is unavailable in this browser.')
  const saltBytes = Uint8Array.from(passwordSalt.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 210_000, hash: 'SHA-256' }, key, 256)
  return bytesToHex(hash)
}

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  })
  const data: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'The request could not be completed.'
    throw new ApiError(message, response.status)
  }
  return data as T
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authStage, setAuthStage] = useState<'loading' | 'choose-role' | 'student-auth' | 'admin-auth'>('loading')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('register')
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [issues, setIssues] = useState<Issue[]>(readIssues)
  const [campusName, setCampusName] = useState('North Campus')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [locationFilter, setLocationFilter] = useState('All locations')
  const [sortNewest, setSortNewest] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [adminPanel, setAdminPanel] = useState<'users' | 'settings' | null>(null)
  const [adminUsers, setAdminUsers] = useState<StudentProfile[]>([])
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([])
  const [adminRequests, setAdminRequests] = useState<AdminAccountRequest[]>([])
  const [environmentAdminUsername, setEnvironmentAdminUsername] = useState<string | null>(null)
  const [adminPanelError, setAdminPanelError] = useState('')
  const [settingsName, setSettingsName] = useState('North Campus')
  const isAdmin = user?.role === 'admin'
  const profile = user?.role === 'student' ? user : user ? { name: user.name, username: user.username } : null

  useEffect(() => {
    let active = true
    apiRequest<{ user: AuthUser | null }>('/api/auth/session')
      .then(({ user: currentUser }) => {
        if (!active) return
        if (currentUser) {
          setUser(currentUser)
          setAuthStage('loading')
        } else {
          setAuthStage('choose-role')
        }
      })
      .catch(() => {
        if (!active) return
        setAuthError('The campus server is not available. Start the app with npm run dev and try again.')
        setAuthStage('choose-role')
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!user) return
    let active = true
    async function loadServerIssues() {
      try {
        const legacyIssues = readIssues()
        await apiRequest('/api/issues/import-legacy', { method: 'POST', body: JSON.stringify({ issues: legacyIssues }) })
        const data = await apiRequest<{ issues: Issue[]; campusName: string }>('/api/issues')
        if (!active) return
        setIssues(data.issues)
        setCampusName(data.campusName)
        setStorageAvailable(true)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.issues)) } catch { setStorageAvailable(false) }
      } catch (error) {
        if (!active) return
        setStorageAvailable(false)
        setToastMessage(error instanceof Error ? error.message : 'Could not load campus reports.')
      }
    }
    void loadServerIssues()
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(''), 4500)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const filteredIssues = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return issues
      .filter((issue) => statusFilter === 'All statuses' || issue.status === statusFilter)
      .filter((issue) => categoryFilter === 'All categories' || issue.category === categoryFilter)
      .filter((issue) => priorityFilter === 'All priorities' || issue.priority === priorityFilter)
      .filter((issue) => locationFilter === 'All locations' || issue.location === locationFilter)
      .filter((issue) => !needle || [issue.id, issue.category, issue.description, issue.location, issue.status, issue.priority, issue.title, issue.reporter].some((value) => value.toLowerCase().includes(needle)))
      .sort((a, b) => sortNewest ? Date.parse(b.reportedAt) - Date.parse(a.reportedAt) : Date.parse(a.reportedAt) - Date.parse(b.reportedAt))
  }, [categoryFilter, issues, locationFilter, priorityFilter, query, sortNewest, statusFilter])

  const resolvedCount = issues.filter((issue) => issue.status === 'Resolved').length
  const activeCount = issues.length - resolvedCount
  const pendingCount = issues.filter((issue) => issue.status === 'Pending').length
  const inProgressCount = issues.filter((issue) => issue.status === 'In Progress').length
  const criticalCount = issues.filter((issue) => issue.priority === 'High' || issue.priority === 'Critical').length
  const resolutionRate = issues.length ? Math.round(resolvedCount / issues.length * 100) : 0
  const categoryCounts = categories.map((category) => ({ category, count: issues.filter((issue) => issue.category === category).length }))
  const largestCategory = Math.max(...categoryCounts.map(({ count }) => count), 1)
  const locationOptions = [...new Set(issues.map((issue) => issue.location))].sort((a, b) => a.localeCompare(b))
  const selectedIssue = issues.find((issue) => issue.id === selectedIssueId) ?? null
  const attentionIssues = issues.filter((issue) => issue.status !== 'Resolved').slice(0, 3)

  async function addIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setFormError('')
    const data = new FormData(event.currentTarget)
    const location = String(data.get('location') ?? '').trim()
    const description = String(data.get('description') ?? '').trim()
    const title = String(data.get('title') ?? '').trim() || description.split(/[.!?]/, 1)[0].slice(0, 80) || 'Maintenance issue'
    const category = String(data.get('category')) as Category
    const priority = String(data.get('priority')) as Priority
    if (!location || !description || !categories.includes(category) || !priorities.includes(priority)) {
      setFormError('Complete each required field with a valid category and priority.')
      return
    }
    try {
      const { issue } = await apiRequest<{ issue: Issue }>('/api/issues', { method: 'POST', body: JSON.stringify({ title, location, description, category, priority }) })
      setIssues((current) => [issue, ...current])
      setFormOpen(false)
      clearFilters()
      setToastMessage(`Complaint ${issue.id} submitted successfully.`)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not submit this complaint.')
    }
  }

  async function updateIssue(id: string, field: 'status' | 'priority', value: Status | Priority) {
    if (!isAdmin) return
    try {
      const { issue } = await apiRequest<{ issue: Issue }>(`/api/admin/issues/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ [field]: value }) })
      setIssues((current) => current.map((entry) => entry.id === id ? issue : entry))
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Could not update this complaint.')
    }
  }

  async function saveEditedIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin || !editingIssueId) return
    const data = new FormData(event.currentTarget)
    const changes = Object.fromEntries(data.entries())
    try {
      const { issue } = await apiRequest<{ issue: Issue }>(`/api/admin/issues/${encodeURIComponent(editingIssueId)}`, { method: 'PATCH', body: JSON.stringify(changes) })
      setIssues((current) => current.map((entry) => entry.id === issue.id ? issue : entry))
      setEditingIssueId(null)
      setSelectedIssueId(issue.id)
      setToastMessage(`Complaint ${issue.id} updated.`)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not update this complaint.')
    }
  }

  async function deleteIssue(issue: Issue) {
    if (!isAdmin || !window.confirm(`Delete complaint ${issue.id}? This cannot be undone.`)) return
    try {
      await apiRequest(`/api/admin/issues/${encodeURIComponent(issue.id)}`, { method: 'DELETE' })
      setIssues((current) => current.filter((entry) => entry.id !== issue.id))
      setSelectedIssueId(null)
      setToastMessage(`Complaint ${issue.id} deleted.`)
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Could not delete this complaint.')
    }
  }

  async function openAdminPanel(panel: 'users' | 'settings') {
    if (!isAdmin) return
    setAdminPanelError('')
    setAdminPanel(panel)
    try {
      if (panel === 'users') {
        const { users, admins, adminRequests, environmentAdminUsername } = await apiRequest<{ users: StudentProfile[]; admins: AdminAccount[]; adminRequests: AdminAccountRequest[]; environmentAdminUsername: string | null }>('/api/admin/users')
        setAdminUsers(users)
        setAdminAccounts(admins)
        setAdminRequests(adminRequests)
        setEnvironmentAdminUsername(environmentAdminUsername)
      } else {
        const settings = await apiRequest<{ campusName: string }>('/api/admin/settings')
        setCampusName(settings.campusName)
        setSettingsName(settings.campusName)
      }
    } catch (error) {
      setAdminPanelError(error instanceof Error ? error.message : 'Could not load admin data.')
    }
  }

  async function deleteStudent(student: StudentProfile) {
    if (!isAdmin || !window.confirm(`Delete the student account for ${student.name} (${student.rollNumber})?`)) return
    try {
      await apiRequest(`/api/admin/users/${encodeURIComponent(student.rollNumber)}`, { method: 'DELETE' })
      setAdminUsers((current) => current.filter((entry) => entry.rollNumber !== student.rollNumber))
    } catch (error) {
      setAdminPanelError(error instanceof Error ? error.message : 'Could not delete this student account.')
    }
  }

  async function createAdminAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin) return
    setAdminPanelError('')
    const form = event.currentTarget
    const data = new FormData(form)
    const username = String(data.get('username') ?? '').trim()
    const password = String(data.get('password') ?? '')
    if (password.length < 12) {
      setAdminPanelError('Choose an Admin password with at least 12 characters.')
      return
    }
    try {
      const { admin } = await apiRequest<{ admin: AdminAccount }>('/api/admin/admins', { method: 'POST', body: JSON.stringify({ username, password }) })
      setAdminAccounts((current) => [...current, admin])
      form.reset()
      setToastMessage(`Admin account ${admin.username} created.`)
    } catch (error) {
      setAdminPanelError(error instanceof Error ? error.message : 'Could not create this Admin account.')
    }
  }

  async function deleteAdminAccount(admin: AdminAccount) {
    if (!isAdmin || !window.confirm(`Delete Admin account ${admin.username}?`)) return
    try {
      await apiRequest(`/api/admin/admins/${encodeURIComponent(admin.username)}`, { method: 'DELETE' })
      setAdminAccounts((current) => current.filter((entry) => entry.username !== admin.username))
    } catch (error) {
      setAdminPanelError(error instanceof Error ? error.message : 'Could not delete this Admin account.')
    }
  }

  async function approveAdminRequest(request: AdminAccountRequest) {
    if (!isAdmin) return
    try {
      const { admin } = await apiRequest<{ admin: AdminAccount }>(`/api/admin/admin-requests/${encodeURIComponent(request.username)}/approve`, { method: 'POST' })
      setAdminRequests((current) => current.filter((entry) => entry.username !== request.username))
      setAdminAccounts((current) => [...current, admin])
      setToastMessage(`Admin account ${admin.username} approved.`)
    } catch (error) {
      setAdminPanelError(error instanceof Error ? error.message : 'Could not approve this request.')
    }
  }

  async function rejectAdminRequest(request: AdminAccountRequest) {
    if (!isAdmin || !window.confirm(`Reject the Admin account request for ${request.username}?`)) return
    try {
      await apiRequest(`/api/admin/admin-requests/${encodeURIComponent(request.username)}`, { method: 'DELETE' })
      setAdminRequests((current) => current.filter((entry) => entry.username !== request.username))
    } catch (error) {
      setAdminPanelError(error instanceof Error ? error.message : 'Could not reject this request.')
    }
  }

  async function saveAdminSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin) return
    try {
      const settings = await apiRequest<{ campusName: string }>('/api/admin/settings', { method: 'PATCH', body: JSON.stringify({ campusName: settingsName }) })
      setCampusName(settings.campusName)
      setAdminPanel(null)
      setToastMessage('Campus settings saved.')
    } catch (error) {
      setAdminPanelError(error instanceof Error ? error.message : 'Could not save settings.')
    }
  }

  function exportReports() {
    if (isAdmin) window.location.assign('/api/admin/reports.csv')
  }

  function clearFilters() {
    setQuery('')
    setStatusFilter('All statuses')
    setCategoryFilter('All categories')
    setPriorityFilter('All priorities')
    setLocationFilter('All locations')
    setActiveNav('Overview')
  }

  function openReportForm() {
    setFormError('')
    setFormOpen(true)
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    setAuthNotice('')
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')

    try {
      if (selectedRole === 'admin') {
        const username = String(data.get('username') ?? '').trim()
        if (authMode === 'admin-request') {
          if (password.length < 12) {
            setAuthError('Choose a password with at least 12 characters.')
            return
          }
          await apiRequest('/api/auth/admin/requests', { method: 'POST', body: JSON.stringify({ username, password }) })
          setAuthMode('login')
          setAuthNotice('Your request was submitted. An existing Admin must approve it before you can sign in.')
          return
        }
        const result = await apiRequest<{ user: AuthUser }>('/api/auth/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) })
        setUser(result.user)
        return
      }

      const rollNumber = normalizeRollNumber(String(data.get('rollNumber') ?? ''))
      if (selectedRole !== 'student') throw new Error('Select a role to continue.')
      if (authMode === 'register') {
        const name = String(data.get('name') ?? '').trim()
        const year = String(data.get('year') ?? '')
        const department = String(data.get('department') ?? '').trim()
        const confirmPassword = String(data.get('confirmPassword') ?? '')
        if (!name || !department || !rollNumber || !studyYears.includes(year)) {
          setAuthError('Complete each profile field before continuing.')
          return
        }
        if (password.length < 8) {
          setAuthError('Choose a password with at least 8 characters.')
          return
        }
        if (password !== confirmPassword) {
          setAuthError('The passwords do not match.')
          return
        }
        const result = await apiRequest<{ user: AuthUser }>('/api/auth/student/register', { method: 'POST', body: JSON.stringify({ name, year, department, rollNumber, password }) })
        setUser(result.user)
        return
      }

      try {
        const result = await apiRequest<{ user: AuthUser }>('/api/auth/student/login', { method: 'POST', body: JSON.stringify({ rollNumber, password }) })
        setUser(result.user)
      } catch (loginError) {
        if (!(loginError instanceof ApiError) || loginError.status !== 401) throw loginError
        const legacy = readAccounts().find((account) => account.rollNumber === rollNumber)
        if (!legacy || await hashPassword(password, legacy.passwordSalt) !== legacy.passwordHash) throw loginError
        const legacyProfile = { name: legacy.name, year: legacy.year, department: legacy.department, rollNumber }
        try {
          const migrated = await apiRequest<{ user: AuthUser }>('/api/auth/student/register', { method: 'POST', body: JSON.stringify({ ...legacyProfile, password }) })
          setUser(migrated.user)
        } catch (migrationError) {
          if (!(migrationError instanceof ApiError) || migrationError.status !== 409) throw migrationError
          const signedIn = await apiRequest<{ user: AuthUser }>('/api/auth/student/login', { method: 'POST', body: JSON.stringify({ rollNumber, password }) })
          setUser(signedIn.user)
        }
        const remaining = readAccounts().filter((account) => account.rollNumber !== rollNumber)
        try { localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(remaining)) } catch { /* The server account remains authoritative. */ }
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication could not be completed.')
    }
  }

  function chooseRole(role: Role) {
    setSelectedRole(role)
    setAuthMode(role === 'student' ? readAccounts().length ? 'login' : 'register' : 'login')
    setAuthError('')
    setAuthNotice('')
    setAuthStage(role === 'student' ? 'student-auth' : 'admin-auth')
  }

  function backToRoleSelection() {
    setSelectedRole(null)
    setAuthError('')
    setAuthNotice('')
    setAuthStage('choose-role')
  }

  function changeAuthMode(mode: AuthMode) {
    setAuthError('')
    setAuthNotice('')
    setAuthMode(mode)
  }

  async function signOut() {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }) } catch { /* Clear local role state even if the server is unavailable. */ }
    setUser(null)
    setSelectedRole(null)
    setAuthMode('register')
    setAuthError('')
    setAuthStage('choose-role')
    setAdminPanel(null)
    clearFilters()
  }

  if (!user && authStage === 'loading') return <main className="auth-loading" aria-live="polite">Checking your campus session…</main>
  if (!user && authStage === 'choose-role') return <RoleSelection error={authError} onSelect={chooseRole} />
  if (!user && selectedRole) return <AuthScreen role={selectedRole} mode={authMode} error={authError} notice={authNotice} onBack={backToRoleSelection} onModeChange={changeAuthMode} onSubmit={handleAuthSubmit} />
  if (!user || !profile) return <RoleSelection error="Choose a role to continue." onSelect={chooseRole} />

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#overview" aria-label="CAMPUS 360 home" onClick={clearFilters}><span className="brand-mark"><Wrench size={19} /></span><span className="brand-copy"><strong>CAMPUS <span>360</span></strong><small>FACILITIES DESK</small></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="primary-nav" aria-label="Main navigation">
        <button className={`nav-item ${activeNav === 'Overview' ? 'selected' : ''}`} onClick={clearFilters}><ClipboardList size={18} /><span>Overview</span><span className="nav-count">{issues.length}</span></button>
        <button className={`nav-item ${activeNav === 'My reports' ? 'selected' : ''}`} onClick={() => { clearFilters(); setActiveNav('My reports'); if (user.role === 'student') setQuery(user.name) }}><Building2 size={18} /><span>My reports</span></button>
      </nav>
      <div className="sidebar-rule" /><div className="workspace-label queue-label">QUEUE STATUS</div>
      <button className={`queue-link ${statusFilter === 'Pending' ? 'queue-selected' : ''}`} aria-pressed={statusFilter === 'Pending'} onClick={() => { setActiveNav('Overview'); setStatusFilter(statusFilter === 'Pending' ? 'All statuses' : 'Pending') }}><i className="queue-dot pending-dot" /><span>Pending</span><span>{pendingCount}</span></button>
      <button className={`queue-link ${statusFilter === 'In Progress' ? 'queue-selected' : ''}`} aria-pressed={statusFilter === 'In Progress'} onClick={() => { setActiveNav('Overview'); setStatusFilter(statusFilter === 'In Progress' ? 'All statuses' : 'In Progress') }}><i className="queue-dot progress-dot" /><span>In progress</span><span>{inProgressCount}</span></button>
      <button className={`queue-link ${statusFilter === 'Resolved' ? 'queue-selected' : ''}`} aria-pressed={statusFilter === 'Resolved'} onClick={() => { setActiveNav('Overview'); setStatusFilter(statusFilter === 'Resolved' ? 'All statuses' : 'Resolved') }}><i className="queue-dot resolved-dot" /><span>Resolved</span><span>{resolvedCount}</span></button>
      <div className="sidebar-bottom">
        <button className="campus-card" aria-label={`Show all ${campusName} complaints`} onClick={clearFilters}><span className="campus-icon"><Building2 size={16} /></span><span><strong>{campusName}</strong><small>Facilities team</small></span><ChevronDown size={15} /></button>
        <div className="profile-row"><div className="avatar">{getInitials(user.name)}</div><span><strong>{user.name}</strong>{user.role === 'admin' ? <small className="role-profile-label">Administrator</small> : <><small>Student · {user.year} · {user.department}</small><small>{user.rollNumber}</small></>}</span><button className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={17} />{pendingCount > 0 && <i />}</button></div>
      </div>
      {notificationsOpen && <section className="notification-popover" aria-label="Notifications"><div className="notification-heading"><strong>Latest reports</strong><button className="icon-button" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div>{attentionIssues.length ? attentionIssues.map((issue) => <button className="notification-item" key={issue.id} onClick={() => { setSelectedIssueId(issue.id); setNotificationsOpen(false) }}><span className={`queue-dot ${issue.status === 'Pending' ? 'pending-dot' : 'progress-dot'}`} /><span><strong>{issue.title}</strong><small>{issue.id} · {issue.status}</small></span><ArrowUpRight size={14} /></button>) : <p className="notification-empty">No open reports need attention.</p>}</section>}
    </aside>

    <main className="main-content" id="overview">
      <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>{activeNav}</strong></div><div className="topbar-actions"><span className={`role-badge role-badge-${user.role}`}><i />{user.role === 'admin' ? 'Admin' : 'Student'}</span><div className="today-label"><i className="online-dot" /> Facilities team online <i className="today-divider" /> {new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</div>{isAdmin && <><button className="icon-button admin-action" aria-label="Manage students" title="Manage students" onClick={() => void openAdminPanel('users')}><Users size={16} /></button><button className="icon-button admin-action" aria-label="Campus settings" title="Campus settings" onClick={() => void openAdminPanel('settings')}><Settings size={16} /></button><button className="icon-button admin-action" aria-label="Export report" title="Export report" onClick={exportReports}><Download size={16} /></button></>}<ThemeToggle /><button className="icon-button signout-button" aria-label="Log out" title="Log out" onClick={signOut}><LogOut size={16} /></button></div></header>
      <div className="page-content">
        <section className="page-heading"><div><div className="eyebrow">{campusName.toUpperCase()} <span>·</span> MAINTENANCE</div><h1>Good morning, {user.name.split(/\s+/)[0]} <span className="wave-mark">↗</span></h1><p>Here’s what’s happening across campus today.</p></div><button className="button button-primary" onClick={openReportForm}><Plus size={17} /> Report an issue</button></section>
        <section className="stats-grid" aria-label="Issue statistics">
          <StatCard className="stat-open" title="Open reports" value={activeCount} caption="active" note={`${pendingCount} waiting for assignment`} icon={<ClipboardList size={17} />} marker="orange" />
          <StatCard className="stat-pending" title="Pending complaints" value={pendingCount} caption="pending" note="Awaiting facilities assignment" icon={<Clock3 size={17} />} marker="orange" />
          <StatCard className="stat-progress" title="Being worked on" value={inProgressCount} caption="in progress" note="Facilities team is on it" icon={<Clock3 size={17} />} marker="blue" />
          <StatCard className="stat-resolved" title="Resolved complaints" value={resolvedCount} caption="resolved" note="Completed maintenance reports" icon={<CheckCircle2 size={17} />} marker="green" />
          <StatCard className="stat-resolved" title="Resolution rate" value={resolutionRate} caption="%" note={`${resolvedCount} of ${issues.length} reports resolved`} icon={<CheckCircle2 size={17} />} marker="green" />
          <StatCard className="stat-critical" title="High / Critical" value={criticalCount} caption="priority" note="Needs priority attention" icon={<CircleAlert size={17} />} marker="orange" />
          <StatCard className="stat-total" title="All reports" value={issues.length} caption="this term" note={`Across ${categoryCounts.filter((item) => item.count).length} issue categories`} icon={<ArrowDownUp size={17} />} marker="charcoal" />
        </section>

        <section className="overview-grid">
          <article className="panel issue-panel">
            <div className="panel-heading"><div><div className="section-kicker">LIVE QUEUE</div><h2>Reported issues <span className="heading-count">{issues.length}</span></h2></div><button className="text-button" onClick={clearFilters}>View all <ArrowUpRight size={15} /></button></div>
            <div className="issue-toolbar" style={{ flexWrap: 'wrap' }}>
              <label className="search-box"><Search size={16} /><input aria-label="Search issues" placeholder="Search issues, location..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
              <label className="filter-select"><Filter size={15} /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={14} /></label>
              <label className="filter-select category-select" style={{ display: 'flex' }}><select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown size={14} /></label>
              <label className="filter-select priority-select"><select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select><ChevronDown size={14} /></label>
              <label className="filter-select location-select"><select aria-label="Filter by location" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}><option>All locations</option>{locationOptions.map((location) => <option key={location}>{location}</option>)}</select><ChevronDown size={14} /></label>
            </div>
            <div className="issue-list-head"><span>ISSUE</span><button onClick={() => setSortNewest((value) => !value)}>REPORTED <ArrowDownUp size={12} /></button><span>PRIORITY</span><span>STATUS</span></div>
            <div className="issue-list">{filteredIssues.map((issue) => <IssueRow key={issue.id} issue={issue} isAdmin={isAdmin} onUpdate={updateIssue} onDetails={() => setSelectedIssueId(issue.id)} onDelete={() => void deleteIssue(issue)} />)}{filteredIssues.length === 0 && <div className="empty-state"><Search size={22} /><strong>No matching issues</strong><span>Try a different search or clear your filters.</span><button className="text-button" onClick={clearFilters}>Clear filters</button></div>}</div>
            <div className="panel-footer"><span>Showing <strong>{filteredIssues.length}</strong> of <strong>{issues.length}</strong> issues</span><span className={`sync-label ${storageAvailable ? '' : 'storage-warning'}`}><i className="online-dot" /> {storageAvailable ? 'Updates saved automatically' : 'Browser storage unavailable'}</span></div>
          </article>

          <aside className="side-panels">
            <article className="panel category-panel"><div className="panel-heading compact-heading"><div><div className="section-kicker">ISSUE BREAKDOWN</div><h2>By category</h2></div><button className="icon-button subtle-icon" aria-label="Show all category reports" onClick={clearFilters}><ArrowUpRight size={16} /></button></div>
              <div className="category-chart" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', padding: '16px 8px 8px', marginTop: '4px', borderBottom: '1px solid var(--line)' }}>
                {categoryCounts.map(({ category, count }) => {
                  const resolvedCount = issues.filter((i) => i.category === category && i.status === 'Resolved').length;
                  const openCount = count - resolvedCount;
                  const resolvedPercent = largestCategory ? (resolvedCount / largestCategory) * 100 : 0;
                  const openPercent = largestCategory ? (openCount / largestCategory) * 100 : 0;
                  const isSelected = categoryFilter === category;
                  return (
                    <button 
                      key={category} 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', cursor: 'pointer', opacity: isSelected || categoryFilter === 'All categories' ? 1 : 0.4, flex: 1, padding: 0, transition: 'opacity 0.2s' }}
                      onClick={() => setCategoryFilter(categoryFilter === category ? 'All categories' : category)}
                      title={`${category}: ${resolvedCount} resolved, ${openCount} open`}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>{count}</span>
                      <div style={{ display: 'flex', gap: '4px', height: '70px', alignItems: 'flex-end' }}>
                        <div style={{ width: '10px', height: '100%', background: 'rgba(55, 199, 125, 0.1)', borderRadius: '3px', position: 'relative' }} title="Completed">
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${Math.max(resolvedCount > 0 ? 10 : 0, resolvedPercent)}%`, background: 'var(--green)', borderRadius: '3px', transition: 'height 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
                        </div>
                        <div style={{ width: '10px', height: '100%', background: 'rgba(218, 118, 91, 0.1)', borderRadius: '3px', position: 'relative' }} title="Not Completed">
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${Math.max(openCount > 0 ? 10 : 0, openPercent)}%`, background: 'var(--coral)', borderRadius: '3px', transition: 'height 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
                        </div>
                      </div>
                      <span className={`category-symbol category-${category.toLowerCase()}`} style={{ width: '28px', height: '28px', padding: 0, marginTop: '2px', display: 'grid', placeItems: 'center', borderRadius: '6px' }}>
                        {categoryIcon(category)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="chart-foot" style={{ marginTop: '12px' }}><i className="chart-legend" style={{ background: 'var(--green)' }} /> Completed <i className="chart-legend" style={{ background: 'var(--coral)', marginLeft: '8px' }} /> Open <span className="chart-total">{issues.length} total</span></div>
            </article>
            <article className="tip-panel"><span className="tip-icon"><Lightbulb size={17} /></span><div><span className="section-kicker">QUICK NOTE</span><p>Critical issues are sent to the facilities team first. Add a clear location to help them find the problem faster.</p></div></article>
            <article className="resolution-panel">
              <div className="resolution-heading">
                <div><span className="section-kicker">THIS TERM</span><h2>Resolved so far</h2></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '8px' }}>
                <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
                  <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="42" cy="42" r="34" fill="none" stroke="rgba(55, 199, 125, 0.15)" strokeWidth="8" />
                    <circle cx="42" cy="42" r="34" fill="none" stroke="var(--green)" strokeWidth="8" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={(2 * Math.PI * 34) * (1 - ((issues.length ? Math.round(resolvedCount / issues.length * 100) : 0) / 100))} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>{resolutionRate}%</span>
                  </div>
                </div>
                <div>
                  <div className="resolution-number" style={{ margin: 0, fontSize: '36px' }}>{resolvedCount}<span style={{ fontSize: '20px' }}>/{issues.length}</span></div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', fontWeight: 500 }}>Issues completed</div>
                </div>
              </div>
            </article>
          </aside>
        </section>
        <footer className="page-footer"><span><i className="footer-mark"><Wrench size={12} /></i> CAMPUS 360 <i>·</i> Facilities, made easier.</span><button onClick={openReportForm}>Need something fixed? <strong>Report it <ArrowUpRight size={13} /></strong></button></footer>
      </div>
    </main>

    {formOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false) }}>
      <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header"><div><span className="section-kicker">CAMPUS MAINTENANCE</span><h2 id="modal-title">Report an issue</h2><p>Give the facilities team a few details to get started.</p></div><button className="icon-button close-button" aria-label="Close report form" onClick={() => setFormOpen(false)}><X size={19} /></button></div>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <form className="report-form" onSubmit={addIssue}>
          <label>Issue title<input name="title" placeholder="Optional: add a short issue title" maxLength={80} /></label>
          <div className="form-row"><label>Category<select name="category" defaultValue="Furniture" required>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Priority<select name="priority" defaultValue="Medium" required>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label></div>
          <label>Location<span className="input-with-icon"><MapPin size={16} /><input name="location" placeholder="Building and room number" required maxLength={100} /></span></label>
          <label>Description<textarea name="description" placeholder="What happened? Include anything that could help the team." required rows={4} maxLength={500} /></label>
          <label>Upload Photo (Optional)<div style={{ position: 'relative', overflow: 'hidden' }}><div className="button button-secondary" style={{ width: '100%', textAlign: 'center', pointerEvents: 'none' }}>Upload from Camera or Gallery</div><input name="photoUrl" type="file" accept="image/*" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer', width: '100%' }} /></div></label>
          <div className="form-actions"><span><CircleAlert size={14} /> New reports start as Pending</span><button className="button button-primary" type="submit"><Plus size={16} /> Submit report</button></div>
        </form>
      </section>
    </div>}
    {selectedIssue && !editingIssueId && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedIssueId(null) }}>
      <section className="report-modal details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <div className="modal-header"><div><span className="section-kicker">COMPLAINT {selectedIssue.id}</span><h2 id="details-title">{selectedIssue.title}</h2><p>{selectedIssue.category} · Reported by {selectedIssue.reporter}</p></div><button className="icon-button close-button" aria-label="Close complaint details" onClick={() => setSelectedIssueId(null)}><X size={19} /></button></div>
        <dl className="detail-grid"><div><dt>Location</dt><dd>{selectedIssue.location}</dd></div><div><dt>Priority</dt><dd>{selectedIssue.priority}</dd></div><div><dt>Status</dt><dd>{selectedIssue.status}</dd></div><div><dt>Reported</dt><dd><time dateTime={selectedIssue.reportedAt}>{formatReportedAt(selectedIssue.reportedAt)}</time></dd></div><div className="detail-description"><dt>Description</dt><dd>{selectedIssue.description}</dd></div>
        {selectedIssue.photoUrl && <div className="detail-description"><dt>Attached Photo</dt><dd><img src={selectedIssue.photoUrl} alt="Attached issue" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px', border: '1px solid var(--border)' }} /></dd></div>}</dl>
        {isAdmin && <div className="admin-modal-actions"><button className="button button-secondary" onClick={() => { setEditingIssueId(selectedIssue.id); setFormError('') }}><Settings size={15} /> Edit complaint</button><button className="button button-danger" onClick={() => void deleteIssue(selectedIssue)}><Trash2 size={15} /> Delete</button></div>}
      </section>
    </div>}
    {isAdmin && editingIssueId && issues.some((issue) => issue.id === editingIssueId) && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingIssueId(null) }}>
      <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title"><div className="modal-header"><div><span className="section-kicker">ADMIN EDIT</span><h2 id="edit-title">Edit complaint</h2></div><button className="icon-button close-button" aria-label="Close edit complaint" onClick={() => setEditingIssueId(null)}><X size={19} /></button></div>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <form className="report-form" onSubmit={saveEditedIssue}>{(() => { const issue = issues.find((entry) => entry.id === editingIssueId)!; return <>
          <label>Issue title<input name="title" defaultValue={issue.title} required maxLength={80} /></label>
          <div className="form-row"><label>Category<select name="category" defaultValue={issue.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Priority<select name="priority" defaultValue={issue.priority}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label></div>
          <div className="form-row"><label>Status<select name="status" defaultValue={issue.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label>Location<input name="location" defaultValue={issue.location} required maxLength={100} /></label></div>
          <label>Description<textarea name="description" defaultValue={issue.description} required rows={4} maxLength={500} /></label>
          <label>Upload New Photo (Optional)<div style={{ position: 'relative', overflow: 'hidden' }}><div className="button button-secondary" style={{ width: '100%', textAlign: 'center', pointerEvents: 'none' }}>Upload from Camera or Gallery</div><input name="photoUrl" type="file" accept="image/*" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer', width: '100%' }} /></div></label>
        </> })()}<div className="form-actions"><span>Changes are saved to the server</span><button className="button button-primary" type="submit"><Check size={15} /> Save changes</button></div></form>
      </section>
    </div>}
    {isAdmin && adminPanel && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAdminPanel(null) }}>
      <section className="report-modal admin-panel-modal" role="dialog" aria-modal="true" aria-labelledby="admin-panel-title"><div className="modal-header"><div><span className="section-kicker">ADMINISTRATION</span><h2 id="admin-panel-title">{adminPanel === 'users' ? 'Student accounts' : 'Campus settings'}</h2><p>{adminPanel === 'users' ? 'Manage registered student profiles.' : 'Update the campus name shown across the dashboard.'}</p></div><button className="icon-button close-button" aria-label="Close admin panel" onClick={() => setAdminPanel(null)}><X size={19} /></button></div>
        {adminPanelError && <p className="form-error" role="alert">{adminPanelError}</p>}
        {adminPanel === 'users' ? <div className="admin-management-list">
          <section><div className="admin-section-heading"><strong>Students</strong><span>{adminUsers.length}</span></div><div className="admin-user-list">{adminUsers.map((student) => <div className="admin-user-row" key={student.rollNumber}><span className="avatar">{getInitials(student.name)}</span><span><strong>{student.name}</strong><small>{student.rollNumber} · {student.year} · {student.department}</small></span><button className="icon-button user-delete-button" aria-label={`Delete account for ${student.rollNumber}`} onClick={() => void deleteStudent(student)}><Trash2 size={15} /></button></div>)}{adminUsers.length === 0 && <p className="admin-empty">No student accounts have registered yet.</p>}</div></section>
          <section><div className="admin-section-heading"><strong>Pending Admin requests</strong><span>{adminRequests.length}</span></div><div className="admin-user-list">{adminRequests.map((request) => <div className="admin-user-row" key={request.username}><span className="avatar admin-avatar"><ShieldCheck size={15} /></span><span><strong>{request.username}</strong><small>Awaiting approval · {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(request.createdAt))}</small></span><button className="icon-button request-approve-button" aria-label={`Approve Admin request ${request.username}`} title="Approve request" onClick={() => void approveAdminRequest(request)}><Check size={15} /></button><button className="icon-button user-delete-button" aria-label={`Reject Admin request ${request.username}`} title="Reject request" onClick={() => void rejectAdminRequest(request)}><X size={15} /></button></div>)}{adminRequests.length === 0 && <p className="admin-empty">No Admin account requests are pending.</p>}</div></section>
          <section><div className="admin-section-heading"><strong>Admin accounts</strong><span>{adminAccounts.length + (environmentAdminUsername ? 1 : 0)}</span></div><div className="admin-user-list">{environmentAdminUsername && <div className="admin-user-row"><span className="avatar admin-avatar"><ShieldCheck size={15} /></span><span><strong>{environmentAdminUsername}</strong><small>Environment-provisioned Admin</small></span></div>}{adminAccounts.map((admin) => <div className="admin-user-row" key={admin.username}><span className="avatar admin-avatar"><ShieldCheck size={15} /></span><span><strong>{admin.username}</strong><small>Admin account</small></span><button className="icon-button user-delete-button" aria-label={`Delete Admin account ${admin.username}`} onClick={() => void deleteAdminAccount(admin)}><Trash2 size={15} /></button></div>)}{adminAccounts.length === 0 && !environmentAdminUsername && <p className="admin-empty">No additional Admin accounts exist.</p>}</div>
            <form className="admin-create-form" onSubmit={createAdminAccount}><div className="admin-section-heading"><strong>Create Admin account</strong></div><label>Username<input name="username" autoComplete="off" minLength={3} maxLength={40} pattern="[A-Za-z0-9._-]+" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required /></label><button className="button button-primary" type="submit"><Plus size={15} /> Create Admin</button></form>
          </section>
        </div> : <form className="report-form" onSubmit={saveAdminSettings}><label>Campus name<input value={settingsName} onChange={(event) => setSettingsName(event.target.value)} maxLength={80} required /></label><div className="form-actions"><span>Setting is stored on the server</span><button className="button button-primary" type="submit"><Check size={15} /> Save settings</button></div></form>}
      </section>
    </div>}
    {toastMessage && <div className="toast-message" role="status"><CheckCircle2 size={17} /><span>{toastMessage}</span><button className="icon-button" aria-label="Dismiss confirmation" onClick={() => setToastMessage('')}><X size={15} /></button></div>}
  </div>
}

function StatCard({ className, title, value, caption, note, icon, marker }: { className: string; title: string; value: number; caption: string; note: string; icon: ReactNode; marker: string }) {
  return <article className={`stat-card ${className}`}><div className="stat-top"><span>{title}</span><span className="stat-icon">{icon}</span></div><div className="stat-number">{value}<span className="stat-caption">{caption}</span></div><div className="stat-foot"><i className={`mini-indicator ${marker}`} />{note}</div></article>
}

function IssueRow({ issue, isAdmin, onUpdate, onDetails, onDelete }: { issue: Issue; isAdmin: boolean; onUpdate: (id: string, field: 'status' | 'priority', value: Status | Priority) => void; onDetails: () => void; onDelete: () => void }) {
  return <article className="issue-row">
    <div className="issue-main"><span className={`issue-category-icon category-${issue.category.toLowerCase()}`}>{categoryIcon(issue.category)}</span><div className="issue-title-wrap">
      <div className="issue-title-line"><button className="issue-title-button" onClick={onDetails}>{issue.title}</button><span className="issue-id">{issue.id}</span><span className="issue-category-tag">{issue.category}</span>{issue.photoUrl && <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--green)', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(52, 211, 153, 0.2)' }}><ImageIcon size={12} /> Photo</span>}{isAdmin && <button className="issue-delete-button" aria-label={`Delete ${issue.id}`} title="Delete complaint" onClick={onDelete}><Trash2 size={13} /></button>}</div>
      <p className="issue-description">{issue.description}</p><div className="issue-location"><MapPin size={12} />{issue.location}</div>
    </div></div>
    <div className="issue-age"><time dateTime={issue.reportedAt}>{formatReportedAt(issue.reportedAt)}</time><small>{formatAge(issue.reportedAt)} · {issue.reporter}</small></div>
    {isAdmin ? <label className={`priority-control priority-${issue.priority.toLowerCase()}`}><i className="priority-dot" /><select aria-label={`Priority for ${issue.title}`} value={issue.priority} onChange={(event) => void onUpdate(issue.id, 'priority', event.target.value as Priority)}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select><ChevronDown size={12} /></label> : <span className={`priority-control readonly-control priority-${issue.priority.toLowerCase()}`}><i className="priority-dot" />{issue.priority}</span>}
    {isAdmin ? <label className={`status-control status-${issue.status.toLowerCase().replace(' ', '-')}`}><i className="status-dot" /><select aria-label={`Status for ${issue.title}`} value={issue.status} onChange={(event) => void onUpdate(issue.id, 'status', event.target.value as Status)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={12} /></label> : <span className={`status-control readonly-control status-${issue.status.toLowerCase().replace(' ', '-')}`}><i className="status-dot" />{issue.status}</span>}
  </article>
}

function formatAge(date: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date))
}

function formatReportedAt(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date))
}

function categoryIcon(category: Category) {
  const props = { size: 16, strokeWidth: 1.9 }
  if (category === 'Electrical') return <Lightbulb {...props} />
  if (category === 'Plumbing') return <Droplets {...props} />
  if (category === 'Furniture') return <Sofa {...props} />
  if (category === 'Classroom') return <Building2 {...props} />
  return <Wrench {...props} />
}

export default App