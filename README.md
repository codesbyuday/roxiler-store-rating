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

## Authentication & Authorization API (Phase 4)

The backend handles authentication via JSON Web Tokens (JWT) and uses bcrypt for password hashing. All authenticated endpoints expect a `Bearer` token.

### Header Format
```http
Authorization: Bearer <your_jwt_token_here>
```

### Role System
The platform supports three strict user roles:
- `admin` (System Administrator)
- `user` (Normal User)
- `owner` (Store Owner)

### Public Endpoints

- **`POST /api/auth/signup`**
  - **Body:** `{ "name", "email", "password", "address" }`
  - **Details:** Normal users can sign up. The system automatically enforces the `user` role (prevents escalation to `admin` or `owner`).

- **`POST /api/auth/login`**
  - **Body:** `{ "email", "password" }`
  - **Details:** Authenticates an existing user and returns a signed JWT. No password hashes are exposed.

### Protected Endpoints (Requires JWT)

- **`GET /api/auth/me`**
  - **Details:** Retrieves safe profile information about the currently logged-in user.

- **`PATCH /api/auth/password`**
  - **Body:** `{ "currentPassword", "newPassword" }`
  - **Details:** Changes the user's password securely (requires verification of the old password).

### Testing Authentication
1. **Login** using one of the seeded accounts (e.g., `admin@demo.com` with password `Demo@12345`).
2. **Copy the `token`** from the response JSON.
3. **Make an authenticated request** using cURL or Postman:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:5000/api/auth/me
   ```

---

## Admin API (Phase 5)

Administrative endpoints are strictly protected by the `authenticate` and `requireRole('admin')` middlewares.

### Endpoints (Requires Admin JWT)

- **`GET /api/admin/dashboard`**
  - **Details:** Returns aggregations: `totalUsers`, `totalStores`, `totalRatings` using efficient SQL count queries.
  
- **`POST /api/admin/users`**
  - **Body:** `{ "name", "email", "password", "address", "role" }`
  - **Details:** Creates a new user of any role (`admin`, `user`, `owner`). Follows strict password/length validations.

- **`POST /api/admin/stores`**
  - **Body:** `{ "name", "email", "address", "ownerId" }`
  - **Details:** Registers a new store and assigns it to an existing `owner`. Ensures 1:1 assignment natively.

- **`GET /api/admin/users`**
  - **Query Params:** `?name=&email=&address=&role=&sortBy=id&order=asc`
  - **Details:** Returns a filtered, safely sorted list of users (excluding password hashes).

- **`GET /api/admin/users/:id`**
  - **Details:** Returns details for a specific user. If the user is a Store Owner, it calculates and attaches their store's overall rating.

- **`GET /api/admin/stores`**
  - **Query Params:** `?name=&email=&address=&sortBy=overallRating&order=desc`
  - **Details:** Returns a filtered, safely sorted list of stores. Automatically calculates the `overallRating` using `AVG()` natively in PostgreSQL.

---

## Normal User API (Phase 6)

Endpoints available strictly to users with the `user` role.

### Endpoints (Requires User JWT)

- **`GET /api/user/stores`**
  - **Query Params:** `?name=&address=&sortBy=overallRating&order=desc`
  - **Details:** Returns a list of stores featuring their `overallRating` and the currently authenticated user's specific `userRating`.

- **`POST /api/user/stores/:storeId/rating`**
  - **Body:** `{ "rating": 5 }`
  - **Details:** Submits a rating (1-5) for a specific store. Safely rejects attempts to submit duplicate ratings (returning `409 Conflict`).

- **`PATCH /api/user/stores/:storeId/rating`**
  - **Body:** `{ "rating": 4 }`
  - **Details:** Modifies a previously submitted rating belonging to the currently authenticated user.

---

## Store Owner API (Phase 7)

Endpoints available strictly to users with the `owner` role. Identity isolation is strictly enforced via the authenticated JWT (`req.user.id`).

### Endpoints (Requires Owner JWT)

- **`GET /api/owner/dashboard`**
  - **Details:** Returns an aggregate structure containing:
    1. Information about the store natively bound to the authenticated owner.
    2. The dynamically calculated `averageRating` for their store.
    3. A chronologically sorted list of users who submitted a rating (omitting all private info like passwords/hashes).
  - **Note:** Safely returns a `404` if the owner hasn't yet been assigned a store by the System Administrator.

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
