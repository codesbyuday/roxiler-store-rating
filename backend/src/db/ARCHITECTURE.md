# Database Architecture (Phase 2)

This document outlines the relational database schema, constraints, indexes, and architectural decisions for the Store Rating Platform, built for PostgreSQL.

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ RATINGS : submits
    USERS ||--|| STORES : "owns (1:1)"
    STORES ||--o{ RATINGS : receives

    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar password
        varchar address
        varchar role
        timestamp created_at
        timestamp updated_at
    }

    STORES {
        int id PK
        varchar name
        varchar email
        varchar address
        int owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    RATINGS {
        int id PK
        int user_id FK
        int store_id FK
        smallint rating
        timestamp created_at
        timestamp updated_at
    }
```

---

## 2. Table Schemas

### 2.1 `users` Table
Stores all types of users in a single table, utilizing the `role` column for role-based access control.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier for the user. |
| `name` | VARCHAR(60) | NOT NULL | User's full name. Database constraint ensures min 20 and max 60 characters. |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address. Used for authentication. |
| `password` | VARCHAR(255) | NOT NULL | Password hash (bcrypt). *Note: length constraints apply at the application level before hashing.* |
| `address` | VARCHAR(400) | | User's address. |
| `role` | VARCHAR(20) | NOT NULL | Determines system permissions. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp. |

### 2.2 `stores` Table
Stores information about registered stores and their associated Store Owner.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier for the store. |
| `name` | VARCHAR(255) | NOT NULL | The store's name. |
| `email` | VARCHAR(255) | NOT NULL | The store's contact email. |
| `address` | VARCHAR(400) | NOT NULL | The physical or primary address. |
| `owner_id` | INTEGER | UNIQUE, NOT NULL | Foreign key to `users.id`. Represents the strictly 1:1 Store Owner. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp. |

### 2.3 `ratings` Table
Stores ratings submitted by Normal Users for Stores.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier for the rating entry. |
| `user_id` | INTEGER | NOT NULL | Foreign key to `users.id` (Normal User). |
| `store_id` | INTEGER | NOT NULL | Foreign key to `stores.id`. |
| `rating` | SMALLINT | NOT NULL | Integer rating from 1 to 5. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp. |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record update timestamp. |

---

## 3. Database Constraints

### 3.1 Primary and Foreign Keys
- **Primary Keys:** Every table uses an auto-incrementing integer `id` as the primary key.
- **Foreign Keys:**
  - `stores.owner_id` references `users(id)`. **ON DELETE RESTRICT**. (Prevents accidental deletion of a user if they actively own a store).
  - `ratings.user_id` references `users(id)`. **ON DELETE CASCADE**. (If a user is deleted, their submitted ratings are cleared to maintain data integrity).
  - `ratings.store_id` references `stores(id)`. **ON DELETE CASCADE**. (If a store is deleted, its ratings are also removed).

### 3.2 Check Constraints
- **User Name:** `CHECK (length(name) >= 20 AND length(name) <= 60)` 
- **User Role:** `CHECK (role IN ('admin', 'user', 'owner'))`
- **Rating Bounds:** `CHECK (rating >= 1 AND rating <= 5)`
- **Email Format:** A basic regex check `CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')` to enforce minimum structural validity at the DB level, alongside backend validation.

### 3.3 Unique Constraints
- **User Email:** `UNIQUE(email)` enforces unique accounts system-wide.
- **Store Owner (1:1):** `UNIQUE(owner_id)` on the `stores` table guarantees that a single Store Owner can be associated with *at most one* store, strictly enforcing a 1:1 structural relationship at the database level.
- **One Rating Per User Per Store:** `UNIQUE (user_id, store_id)` on the `ratings` table. Ensures a Normal User cannot submit multiple distinct ratings for the same store. Subsequent rating changes will be handled via `UPDATE` queries or `INSERT ... ON CONFLICT`.

---

## 4. Indexes

Indexes are designed to optimize the specific filtering, searching, and dashboard requirements outlined in the PDF:

- **`idx_users_email`** on `users(email)`: Speeds up authentication lookups and uniqueness checks.
- **`idx_users_role`** on `users(role)`: Optimizes the Admin dashboard filtering where users are queried by their role.
- **`idx_users_name`** on `users(name)`: Supports Admin dashboard sorting/filtering by user name.
- **`idx_stores_name`** on `stores(name)`: Supports the Normal User requirement to search stores by name.
- **`idx_stores_address`** on `stores(address)`: Supports the Normal User requirement to search stores by address.
- **`idx_stores_owner_id`** on `stores(owner_id)`: Crucial for the Store Owner dashboard, where owners need fast access to their specific store.
- **`idx_ratings_store_id`** on `ratings(store_id)`: Highly critical. Optimizes the calculation of a store's average rating (`AVG(rating) WHERE store_id = X`).
- **Note on Composite Uniqueness:** The `UNIQUE(user_id, store_id)` constraint automatically creates an index on `(user_id, store_id)`, facilitating extremely fast lookups for "has this user rated this store already?".

---

## 5. Architectural Decisions

### 5.1 Calculated vs. Stored Overall Rating
The "overall rating" of a store is **not** stored as a column in the `stores` table. Instead, it will be calculated dynamically using `AVG(rating)` from the `ratings` table.
- **Reasoning:** Storing it physically would introduce data duplication and require complex synchronization (e.g., database triggers or backend transactions) every time a rating is inserted, modified, or deleted. Dynamically calculating it via SQL ensures 100% data consistency. Given the index on `ratings(store_id)`, performance will be highly optimal.

### 5.2 Single Users Table Strategy
All roles (System Administrator, Normal User, Store Owner) share the `users` table instead of splitting into three tables.
- **Reasoning:** A single login system is required. Centralizing authentication and basic profile data prevents duplicating password hashing logic, schema, and API boundaries. The `role` column will strictly dictate authorization in the Express routing layers.

### 5.3 Password Validation Boundary
While the PDF dictates strict password rules (8-16 chars, uppercase, special character), we **do not** enforce these via database `CHECK` constraints.
- **Reasoning:** The application will hash passwords using `bcrypt` before insertion. Bcrypt hashes are fixed-length strings (typically 60 characters) and obfuscate the original contents. Therefore, password complexity validation strictly belongs to the Backend Application Layer (Phase 9/Validations).

### 5.4 Strict 1:1 "One Store per Owner" Complexity
The assignment specifies that an owner can view "the" average rating of "their" store. To enforce this strict 1:1 ownership relationship directly in the database architecture, a `UNIQUE` constraint has been applied to the `owner_id` column in the `stores` table.
- **Reasoning:** Adding this constraint completely guarantees that an owner cannot have multiple stores registered to their ID, eliminating any potential data inconsistencies and aligning perfectly with the intended simplicity of the dashboard routing.
