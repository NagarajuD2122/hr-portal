# HR Management Portal (MERN + TypeScript)

Full-stack HR portal with auth (access + refresh tokens), RBAC, and employee management with validation on both frontend and backend.

## Tech Stack
- Frontend: React (TypeScript), Redux Toolkit + RTK Query, React Router, React Hook Form, Zod, Vite
- Backend: Node.js, Express.js (TypeScript), MongoDB + Mongoose, Zod
- Auth: JWT Access (15m) + Refresh (7d via HttpOnly cookie), bcrypt

## Monorepo Structure
```
/backend   # Express + Mongoose + Zod
/frontend  # React + RTK + RRD + RHF + Zod
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI)

### Backend
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/hr_portal
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-2
CORS_ORIGIN=http://localhost:5173
```
2. Install deps and seed:
```
cd backend
npm i
npm run seed
npm run dev
```

### Frontend
```
cd frontend
npm i
npm run dev
```
Vite dev server: `http://localhost:5173`

Proxy routes `/api/*` to backend on `http://localhost:4000`.

## Auth & RBAC
- Access token: 15 minutes, sent via `Authorization: Bearer <token>`
- Refresh token: 7 days, stored as HttpOnly cookie `refreshToken`
- Refresh flow: frontend hits `POST /api/auth/refresh` automatically on 401
- Roles:
  - Admin: Create/Read/Update/Delete
  - Editor: Create/Read/Update
  - Viewer: Read

## API Overview

Base URL: `/api`

Auth
- `POST /auth/register` { name, username, email, password, role? } → `{ accessToken, user }`
- `POST /auth/login` { email, password } → `{ accessToken, user }`
- `POST /auth/refresh` (cookie) → `{ accessToken }`
- `POST /auth/logout` clears cookie
- `GET /auth/me` (Bearer) → user

Employees (Bearer + RBAC)
- `GET /employees` query: `page,limit,search,role,isActive`
- `GET /employees/:id`
- `POST /employees` (Admin/Editor)
- `PUT /employees/:id` (Admin/Editor)
- `DELETE /employees/:id` (Admin)

Validation
- Backend: Zod middleware validates requests
- Frontend: Zod schemas in forms; rules match backend

Soft Delete
- `deletedAt` set on delete; list excludes soft-deleted; UI row grays out if applicable

## Sample Users (seed)
- admin@example.com / Admin@123 (Admin)
- editor@example.com / Editor@123 (Editor)
- viewer@example.com / Viewer@123 (Viewer)

## Notes
- Adjust CORS and cookie `sameSite/secure` for production
- For production, deploy backend (Render/railway) and frontend (Vercel/Netlify), and update proxy/base URLs

# hr-portal
lifemine assingment
