# PEC CAMPUS CARE

PEC CAMPUS CARE is a campus maintenance reporting dashboard. Students and staff can submit issues, set a priority, follow status changes, and search or filter the shared queue. Reports and dashboard statistics are saved in the browser with `localStorage`.

On first visit, choose **Admin** or **Student**. Students create a profile with their name, year, department, roll number, and password, then use the same dashboard with read-only maintenance controls. Admins sign in with server-configured credentials and receive account, editing, deletion, settings, and report-export tools. Both roles use the same dashboard.

The Admin login page lets users request an Admin account with a username and password. Requests cannot sign in until an existing Admin approves them in the Admin management panel.

## Run locally

Install Node.js 20 or newer. Configure the Admin credentials and session signing secret, then start the Vite UI and Express API together:

```powershell
Copy-Item .env.example .env
# Set ADMIN_PASSWORD and a random SESSION_SECRET (32+ characters).
npm install
npm run dev
```

Open the local URL printed by Vite. The first Admin is provisioned by `ADMIN_USERNAME` and `ADMIN_PASSWORD`; signed-in Admins can create additional Admin usernames from the Admin user-management panel. For production, set `NODE_ENV=production`, use HTTPS, and use strong random secrets. The Express server serves the production `dist` folder with `npm start` after `npm run build`.

## Included workflows

- Submit a report with category, description, location, and priority.
- Update any issue's priority (Low, Medium, High, or Critical) and status (Pending, In Progress, or Resolved).
- Search by complaint ID, category, description, location, status, or priority.
- Combine category, priority, status, and location filters; use View all to reset the queue.
- Open a complaint title to view its complete report details.
- Review live totals, pending, in-progress, resolved, high/critical, resolution rate, and category breakdown statistics.
- Admin can approve/reject Admin account requests, create/remove Admin accounts, edit and delete complaints, manage student accounts, change the campus label, and export a CSV report. These APIs require an Admin session.

Student accounts and issue records are stored in the server's ignored `server/data/store.json` file. Passwords are hashed with bcrypt; session cookies are HttpOnly, signed, and SameSite. On first authenticated access, legacy browser issues are imported once; Students can migrate only reports attributed to their profile, and those imported statuses start as Pending. Existing local student accounts can sign in once to migrate to the server.