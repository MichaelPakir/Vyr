# Vyr Support Desk

A full-stack MERN ticketing platform built for real-world support workflows.

Vyr helps teams manage customer/internal support requests with role-based access, ticket lifecycle tracking, threaded conversation, file attachments, and realtime updates.

## Why This Project Stands Out

- End-to-end product thinking: authentication, authorization, data modeling, realtime UX, and admin tools in one system.
- Practical architecture: React + Express + MongoDB + Socket.IO in a clear client/server structure.
- Production-minded details: CORS allowlist, JWT auth, role-based route protection, secure password hashing, and environment-driven configuration.

## Core Features

- User authentication (register/login) with JWT.
- Role model with `user`, `admin`, and `superadmin`.
- Ticket creation with multiple attachment uploads.
- Ticket status workflow: `Open`, `Pending`, `Resolved`.
- Role-aware ticket visibility:
  - Users can view their own tickets.
  - Admins/Superadmins can view all tickets and update status.
- Threaded ticket conversation via comments.
- Realtime updates (Socket.IO):
  - New comments appear live.
  - Ticket status changes are broadcast instantly.
- Admin user management:
  - View users.
  - Promote/demote roles (superadmin-gated).

## Tech Stack

### Frontend

- React 19
- React Router
- Tailwind CSS
- Socket.IO Client
- Axios
- Vite

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- `bcryptjs`
- Multer (attachments)
- Socket.IO
- CORS + dotenv

## Repository Structure

```txt
client/   React SPA (routing, auth context, ticket UI, admin UI)
server/   Express API, Mongo models/controllers/routes, Socket.IO server
```

## Local Setup

### 1. Clone and Install

```bash
git clone https://github.com/MichaelPakir/Vyr.git
cd Vyr

cd server
npm install

cd ../client
npm install
```

### 2. Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLIENT_URLS=http://localhost:5173
SUPERADMIN_BOOTSTRAP_SECRET=your_bootstrap_secret
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run the App

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Snapshot

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/bootstrap-superadmin` (requires `x-bootstrap-secret` header)

### Tickets

- `POST /api/tickets` (auth, supports `attachments` upload)
- `GET /api/tickets/my` (auth)
- `GET /api/tickets/:id` (auth)
- `GET /api/tickets` (admin/superadmin)
- `PUT /api/tickets/:id` (admin/superadmin)

### Comments

- `POST /api/tickets/:ticketId/comments` (auth)
- `GET /api/tickets/:ticketId/comments` (auth)

### Users

- `GET /api/users` (admin/superadmin)
- `PATCH /api/users/:id/promote` (superadmin)
- `PATCH /api/users/:id/demote` (superadmin)

## Realtime Events

Client subscribes to Socket.IO events:

- `newComment`
- `ticketUpdated`

This enables live conversation and status synchronization without page refreshes.

## Security & Access Notes

- Passwords are hashed with bcrypt.
- Protected routes require Bearer JWT.
- Access control is enforced server-side by role.
- CORS uses an allowlist (`CLIENT_URLS`) for both REST and Socket connections.

## What I Would Improve Next

- Add automated tests (unit + integration + E2E).
- Add audit logs and activity timeline per ticket.
- Introduce pagination/filtering for larger ticket volumes.
- Add Docker and CI pipeline for one-command onboarding/deployment.

## Author

Michael Pakir

Open to frontend/full-stack opportunities where product ownership and clean engineering matter.
