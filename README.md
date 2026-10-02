# Store Rating Platform

A full-stack web application designed for evaluating and rating registered stores. The platform facilitates three distinct user roles (System Administrator, Store Owner, and Normal User), allowing the community to rate and discover stores based on crowd-sourced reviews.

## Table of Contents

- [Features by Role](#features-by-role)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Application Scripts](#application-scripts)
- [Validation Rules](#validation-rules)
- [Security & Authentication](#security--authentication)
- [Troubleshooting](#troubleshooting)

---

## Features by Role

### 1. System Administrator
- Full access to the Admin Dashboard for platform metrics.
- Complete CRUD operations for User accounts (Admin, Owner, User).
- Complete CRUD operations for Store entities.
- Advanced capabilities to filter (`Name`, `Email`, `Address`, `Role`) and sort tabular records.
- Safely assign registered Store Owners to valid stores natively bypassing duplicate constraints.

### 2. Normal User
- Self-serve registration via public Signup.
- Comprehensive Store directory listing with real-time text-based search (by Name/Address).
- Submit ratings between 1 and 5 stars for any listed store.
- Directly modify previously submitted personal ratings dynamically.

### 3. Store Owner
- Isolated Owner Dashboard representing metrics natively tied to their managed store.
- Monitor total aggregated `Overall Rating` securely calculated on the server side (`COALESCE(AVG(rating), 0)`).
- View a detailed list of system users who provided feedback on their store (concealing sensitive password and system data).

> **Note:** A global Dark Mode UI toggle is built directly into the authenticated and anonymous Navbar for improved viewing accessibility.

---

## Technology Stack

- **Frontend:** React, Vite, React Router, CSS Variables (for responsive/dark mode layouts).
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL (using `pg` driver).
- **Security:** bcrypt (password hashing), jsonwebtoken (JWT).
- **Tooling:** dotenv, cors.

---

## Project Architecture

```
store-rating-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers parsing requests
│   │   ├── db/               # Migration runner, seeder, SQL schemas
│   │   ├── middleware/       # JWT auth extraction, role isolation
│   │   ├── routes/           # Express router configuration
│   │   └── services/         # SQL execution and DB logic
│   ├── .env.example          # Backend configuration scaffold
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/       # Route guards (ProtectedRoute)
│   │   ├── context/          # Auth Context & Theme Context
│   │   ├── layouts/          # Dynamic Navbar & wrapping containers
│   │   ├── pages/            # View logic handling data rendering
│   │   ├── services/         # Custom Fetch Wrapper for JWT injection
│   │   └── index.css         # Semantic styling & data-theme rules
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Prerequisites

Ensure you have the following installed locally:
1. **Node.js** (v18.0.0 or higher recommended).
2. **npm** (v9.0.0 or higher).
3. **PostgreSQL** (v14+ running locally or remotely).

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd store-rating-platform
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

---

## Environment Variables

Locate the `.env.example` file housed in the `backend/` directory.

1. Copy `.env.example` to `.env` in the `backend/` directory:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure the database credentials to match your local PostgreSQL server:
   ```env
   # Database Configuration (PostgreSQL)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_NAME=store_rating_db
   
   # Security
   JWT_SECRET=generate_a_secure_random_string
   ```

*(Ensure the target `DB_NAME` database is created locally using `psql` or pgAdmin before running the setup script).*

---

## Database Configuration

The platform contains a built-in automated migration and seeder engine.

In the `backend/` folder, run:
```bash
npm run setup
```
**This script natively handles:**
- Constructing `users`, `stores`, `ratings`, and `schema_migrations` tables.
- Building explicit `UNIQUE` constraints ensuring one store per owner and one rating per user-store map.
- Safely ignoring previously run migrations (Idempotent execution).
- Injecting securely hashed baseline seed data.

### Baseline Seed Data
Running setup automatically yields three initial accounts formatted with the password `Demo@12345`:
- `admin@demo.com` (Role: Admin)
- `owner@demo.com` (Role: Owner)
- `user1@demo.com` (Role: Normal User)

---

## Application Scripts

### Starting the Backend
```bash
cd backend
npm run dev
```
Starts the Express server on `http://localhost:5000`.

### Starting the Frontend
```bash
cd frontend
npm run dev
```
Starts the Vite development server on `http://localhost:5173`. Proxies `/api` routes seamlessly to the Express backend.

### Building the Frontend
```bash
cd frontend
npm run build
```
Compiles the React application strictly for production output into the `/dist` directory.

---

## Validation Rules

The application securely upholds these standards simultaneously at the database constraint, backend API, and frontend parsing level:

- **Name:** Minimum 20 characters, Maximum 60 characters.
- **Address:** Maximum 400 characters (optional on certain boundaries).
- **Password Requirements:** Length 8-16 characters, containing at least 1 uppercase letter and 1 special character.
- **Ratings:** Strictly clamped between the integers `1` and `5`.
- **Identity Isolation:** Store Owners are definitively restricted to 1 active Store binding by an exclusive database uniqueness parameter (`stores.owner_id`).

---

## Security & Authentication

1. **JWT Strategy**: All routes (except `/auth/login` and `/auth/signup`) execute a Bearer Token extraction header evaluation.
2. **Access Abstraction**: The backend utilizes a rigid `requireRole` middleware array preventing URL-tampering. Admin panels instantly `403 Forbidden` any normal user or owner attempts.
3. **Data Redaction**: At no phase does the platform emit password hashes down to the frontend. Database layers cleanly decouple credentials before JSON serialization.

---

## Troubleshooting

- **`404 API Not Found / CORS errors`:** Ensure the backend is active on Port 5000 and the Vite Proxy hasn't been reconfigured. 
- **`23505 duplicate key value violates unique constraint`:** You are attempting to assign an owner to multiple stores, or a user has submitted a `POST /rating` collision rather than a `PATCH`. The backend safely maps this into a handled `409 Conflict`.
- **Setup Script Failing:** Verify the PostgreSQL service is actively running and the database specified in your `.env` (e.g. `store_rating_db`) is created successfully.
