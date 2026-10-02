# Store Rating Platform

A full-stack web application designed for users to explore registered stores and submit store ratings, built for the Full Stack Intern Coding Challenge.

> **Status:** Phase 1 Foundation Complete. Initial project scaffolding, Express backend, React frontend, environment configuration, and PostgreSQL connection pool foundation are initialized. Core business features, authentication, and database schemas are scheduled for subsequent phases.

---

## Tech Stack (Phase 1 Foundation)

- **Backend:** Express.js (Node.js runtime)
- **Frontend:** React.js (Vite, React Router v7)
- **Database:** PostgreSQL (Driver: `pg`, connection pool foundation established)
- **Tooling:** CORS, dotenv, nodemon, concurrently

---

## Project Structure

```text
store-rating-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & PostgreSQL pool configuration
│   │   ├── controllers/    # API controllers (health check)
│   │   ├── middleware/     # Error and 404 middleware
│   │   ├── routes/         # Express routing definitions
│   │   ├── services/       # Business logic layer (future phases)
│   │   ├── db/             # Migrations & schema scripts (future phases)
│   │   ├── utils/          # Utility helpers
│   │   ├── app.js          # Express app configuration & middleware
│   │   └── server.js       # HTTP server entry point & startup checks
│   ├── .env.example        # Backend environment variables template
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Layout wrappers (MainLayout with Navbar & Footer)
│   │   ├── pages/          # Page views (HomePage with health check, LoginPage placeholder)
│   │   ├── routes/         # React Router configuration
│   │   ├── services/       # Frontend API client utilities
│   │   ├── hooks/          # Custom React hooks (future phases)
│   │   ├── context/        # Context providers (future phases)
│   │   ├── utils/          # Frontend utility helpers
│   │   ├── App.jsx         # App root component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Clean, modern stylesheet
│   ├── index.html
│   ├── vite.config.js      # Vite configuration & API proxy
│   └── package.json
│
├── .env.example            # Root environment reference
├── .gitignore              # Repository git ignore rules
├── package.json            # Root scripts for running both services
└── README.md
```

---

## Prerequisites

- **Node.js**: v18+ (tested on v24)
- **npm**: v9+ (tested on v11)
- **PostgreSQL**: v14+ (installed and running locally)

---

## Installation & Setup

1. **Create PostgreSQL Database:**
   Create an empty database named `store_rating_db` in PostgreSQL.

2. **Clone the repository and install all dependencies:**
   ```bash
   # From project root
   npm run install:all
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` in `backend/` to `backend/.env`:
   ```bash
   # On Windows PowerShell
   Copy-Item backend/.env.example backend/.env
   # Or on macOS/Linux
   cp backend/.env.example backend/.env
   ```
   *Note: Update `DATABASE_URL` or DB_* credentials in `.env` with your local PostgreSQL credentials.*

4. **Initialize Database (Migrations & Seed Data):**
   ```bash
   # From project root
   npm run setup
   ```
   *This command safely creates the database schema, tables, constraints, and idempotent seed records.*

---

## Running the Application

### Option A: Run Both Services Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

### Option B: Run Services Separately

**1. Start the Backend API:**
```bash
cd backend
npm run dev
```
Backend will be running at `http://localhost:5000`.

**2. Start the Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## Health Check Endpoint

To verify that the backend API is active:
- **URL:** `GET http://localhost:5000/api/health`
- **Sample Response:**
  ```json
  {
    "success": true,
    "message": "API is running",
    "environment": "development",
    "timestamp": "2026-10-02T17:15:52.182Z",
    "database": {
      "status": "connected",
      "details": "PostgreSQL connection successful"
    }
  }
  ```

---

## Upcoming Phases

- **Phase 2:** PostgreSQL database schema & relational design (Users, Stores, Ratings)
- **Phase 3:** Automated migrations, seed data, and `npm run setup` command
- **Phase 4:** Authentication & Role-Based Access Control (System Admin, Normal User, Store Owner)
- **Phase 5:** System Administrator backend APIs
- **Phase 6:** Normal User backend APIs
- **Phase 7:** Store Owner backend APIs
- **Phase 8:** Complete React frontend views & state management
- **Phase 9:** Validations, error UX, and responsive polish
- **Phase 10:** Testing, security verification, and final documentation
