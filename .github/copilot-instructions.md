# PEC CAMPUS CARE Workspace Guidance

- Keep the dashboard focused on campus maintenance reporting and resolution tracking.
- Use React, TypeScript, and the existing Vite setup.
- Use the Express API and server-owned JSON data store for accounts and issue records; derive dashboard statistics from server issue data.
- Keep Student and Admin sessions server-verified; never expose password hashes or raw passwords to the client after authentication.
- Enforce Admin-only mutations on the backend, not only by hiding controls in React.
- Keep issue status values as Pending, In Progress, and Resolved; retain the existing priority and category types.
- Follow the responsive layout and accessibility patterns in `src/App.tsx` and `src/index.css`.
- Run `npm run build` after code changes when Node.js is available.