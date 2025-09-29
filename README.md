# HD Notes – Full‑Stack OTP/Google Notes App (React + Express + MongoDB)

A mobile‑first note‑taking app with email+OTP or Google sign‑in, JWT auth (httpOnly cookie), CSRF protection, and create/delete notes.

## Stack
- Frontend: React 18 + TypeScript + Vite + TailwindCSS
- Backend: Express + TypeScript + MongoDB (Mongoose)
- Auth: Email OTP (via SMTP or console fallback) and Google OAuth (ID token)
- Security: httpOnly JWT cookie, CSRF cookie/header, Helmet, CORS, rate limiting, Zod validation

## Project Structure
```
client/  # React app
server/  # Express API
```

## 1) Prerequisites
- Node.js LTS (>=18)
- MongoDB (local or Atlas)
- Google OAuth 2.0 Web Client ID (optional, for Google sign‑in)

## 2) Configure ENV
### Server
Copy and edit `server/.env` from example:
```
cp server/.env.example server/.env
```
Required values:
- `MONGO_URI`: e.g. `mongodb://127.0.0.1:27017/notes`
- `JWT_SECRET`: 32+ chars random string
- `CLIENT_ORIGIN`: default `http://localhost:5173`
- SMTP (optional): set to send real emails; otherwise OTPs are logged to console
- `GOOGLE_CLIENT_ID` (optional)

PowerShell one‑liner to generate a 48‑char secret:
```
-join ((48..57 + 65..90 + 97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

### Client
Copy and edit `client/.env` from example:
```
cp client/.env.example client/.env
```
- `VITE_API_BASE`: `http://localhost:4000`
- `VITE_GOOGLE_CLIENT_ID`: your Google OAuth Web Client ID

## 3) Install & Run (two terminals)
### Terminal A – API
```
cd server
npm i
npm run dev
```
API at `http://localhost:4000` (health: `/health`)

### Terminal B – Client
```
cd client
npm i
npm run dev
```
Web at `http://localhost:5173`

## 4) Flows
- Sign up (email, name, DOB) → Get OTP → Verify → JWT cookie issued → CSRF cookie issued
- Sign in (email) → Get OTP → Verify → JWT + CSRF
- Google Sign‑In (if email not already registered via OTP) → JWT + CSRF
- Dashboard → shows user info, create/delete notes (requires JWT + CSRF)

## API Summary
- `POST /api/auth/request-otp` {purpose: signup|login, name?, dob?, email}
- `POST /api/auth/verify-otp` {purpose, name?, dob?, email, otp}
- `POST /api/auth/google` {idToken}
## Git
Initialize and commit when ready:
```bash
git init
git add .
git commit -m "feat: initial full-stack notes app with OTP/Google auth"
```
## Notes
- If SMTP is not configured, OTP codes are printed in the server console for development.
- For Google sign-in, configure Authorized JavaScript origin `http://localhost:5173` and Authorized redirect URIs can be omitted for GSI one-tap.

## Editor (TipTap) Features

The dashboard uses a rich TipTap editor with the following capabilities:

- **[Formatting]** Bold, Italic, Underline, Strike, Inline Code, Highlight, Color picker
- **[Headings]** Paragraph, H1, H2, H3
- **[Alignment]** Left, Center, Right (for paragraphs and headings)
- **[Lists]** Bulleted list, Numbered list, Task list (checkboxes)
- **[Blocks]** Blockquote, Code block, Horizontal rule
- **[Links]** Set link (opens in new tab, rel="noopener noreferrer nofollow"), Unlink
- **[Editing]** Undo, Redo, Clear marks, Clear nodes
- **[Placeholder]** “Start writing your note...” when empty

Toolbar buttons reflect active state and operate on the current selection. Links can be added via prompt; URLs are normalized to `https://` if missing a scheme.

### Keyboard Shortcuts (common)

- **[Bold]** Ctrl/Cmd+B
- **[Italic]** Ctrl/Cmd+I
- **[Underline]** Ctrl/Cmd+U (via extension)
- **[Undo/Redo]** Ctrl/Cmd+Z / Shift+Ctrl/Cmd+Z

## Dashboard UX & Animations

- **[Mobile-first]** Single column stack: welcome card, Create Note button, Notes list.
- **[Desktop two-pane]**
  - By default, the stack is centered.
  - On Create or open an existing note, the stack animates to the left and a large editor slides in on the right.
  - On Save/Cancel, the editor hides and the stack recenters.
- **[Notes list]** Grid of rectangular cards. Click a card to open in the editor. Delete via the trash icon.

## TipTap Install (v2)

Install aligned v2 packages in `client/` (use legacy peer deps if your env requires it):

```bash
npm i @tiptap/react@2 @tiptap/pm@2 @tiptap/starter-kit@2 @tiptap/extension-placeholder@2 \
       @tiptap/extension-link@2 @tiptap/extension-underline@2 @tiptap/extension-highlight@2 \
       @tiptap/extension-text-style@2 @tiptap/extension-color@2 @tiptap/extension-task-list@2 \
       @tiptap/extension-task-item@2 @tiptap/extension-text-align@2
# if needed
npm i --legacy-peer-deps @tiptap/react@2 @tiptap/pm@2 @tiptap/starter-kit@2 @tiptap/extension-placeholder@2 \
       @tiptap/extension-link@2 @tiptap/extension-underline@2 @tiptap/extension-highlight@2 \
       @tiptap/extension-text-style@2 @tiptap/extension-color@2 @tiptap/extension-task-list@2 \
       @tiptap/extension-task-item@2 @tiptap/extension-text-align@2
```
Restart the dev server after install. If Vite caches misbehave, stop dev, delete `client/node_modules/.vite`, then start again.

## Usage Notes

- **[Create]** Click the Create Note button → editor opens on the right (desktop) or inline (mobile). Save to persist.
- **[Edit]** Open a note card to load content in the editor. Save to apply changes.
- **[Delete]** Trash icon on a note card.
- **[Auth cookies]** httpOnly JWT + CSRF cookie/header are required for write operations.

## Roadmap / Extensibility

- **[Images]** Add `@tiptap/extension-image` with upload handler (S3/R2) and paste/drop support.
- **[Tables]** TipTap table extensions with toolbar actions.
- **[Slash commands]** Quick insert menu for headings, lists, code block, HR, tasks.
- **[Server-side note updates]** Optional `PUT /api/notes/:id { content }` (currently create/delete endpoints exist; update can be added to persist edits server-side).
