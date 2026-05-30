# Construction Site Management — Backend Spec

## What This Covers

The backend is a REST API built with Express + TypeScript, backed by PostgreSQL. It handles all data storage, validation, and business logic. The frontend talks to it via `/api` endpoints.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Express | HTTP server & routing |
| TypeScript | Type safety |
| pg (node-postgres) | PostgreSQL driver |
| PostgreSQL | Database |

---

## Project Structure

```
server/
├── src/
│   ├── routes/        # API route handlers (one file per resource)
│   ├── models/        # Database queries and business logic
│   ├── db/            # DB connection pool + migration SQL files
│   └── types/         # TypeScript interfaces (shared types)
├── package.json
└── tsconfig.json
```

**Key idea:** Routes handle HTTP (parse request, send response). Models handle SQL (queries, inserts, updates). Keep them separate.

---

## Database Tables

### sites
Represents a construction project/location.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR(255) | Required — e.g. "Sunrise Apartments" |
| address | TEXT | Location/address |
| status | VARCHAR(20) | `active`, `completed`, or `on_hold` |
| start_date | DATE | When construction began |
| created_at | TIMESTAMP | Auto-set |

### workers
Individual laborers/tradespeople. Not tied to a specific site (they can work on multiple sites).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR(255) | Required |
| role | VARCHAR(100) | e.g. mason, electrician, laborer, plumber |
| phone | VARCHAR(20) | Contact number |
| daily_wage | DECIMAL(10,2) | What they earn per day |
| created_at | TIMESTAMP | Auto-set |

### attendance
Tracks who showed up at which site on which day.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| site_id | UUID (FK → sites) | Which site |
| worker_id | UUID (FK → workers) | Which worker |
| date | DATE | The day |
| status | VARCHAR(20) | `present`, `absent`, or `half_day` |
| overtime_hours | DECIMAL(4,1) | Extra hours beyond normal shift |

**Unique constraint:** One record per (site_id, worker_id, date) — a worker can only have one attendance entry per site per day.

### materials
Tracks materials purchased/delivered to a site.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| site_id | UUID (FK → sites) | Which site |
| name | VARCHAR(255) | e.g. cement, steel bars, bricks |
| quantity | DECIMAL(10,2) | How much |
| unit | VARCHAR(50) | bags, kg, pieces, cubic meters |
| unit_price | DECIMAL(10,2) | Cost per unit |
| vendor | VARCHAR(255) | Supplier name |
| date | DATE | Purchase/delivery date |

### expenses
General expenses tied to a site.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| site_id | UUID (FK → sites) | Which site |
| category | VARCHAR(50) | `material`, `labor`, `transport`, or `misc` |
| description | TEXT | Details about the expense |
| amount | DECIMAL(12,2) | Total cost |
| date | DATE | When it occurred |

### daily_reports
End-of-day summary of what happened on site.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| site_id | UUID (FK → sites) | Which site |
| date | DATE | Report date |
| weather | VARCHAR(20) | `sunny`, `rainy`, `cloudy` |
| summary | TEXT | What work was done today |
| issues | TEXT | Problems, blockers, delays |
| created_at | TIMESTAMP | Auto-set |

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Sites — `/api/sites`

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | /api/sites | List all sites |
| GET | /api/sites/:id | Get one site with details |
| POST | /api/sites | Create a new site |
| PUT | /api/sites/:id | Update site info |
| DELETE | /api/sites/:id | Delete a site |

### Workers — `/api/workers`

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | /api/workers | List all workers |
| POST | /api/workers | Add a new worker |
| PUT | /api/workers/:id | Update worker info |
| DELETE | /api/workers/:id | Remove a worker |

### Attendance — `/api/sites/:siteId/attendance`

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | /api/sites/:siteId/attendance?date=YYYY-MM-DD | Get attendance for a site on a date |
| POST | /api/sites/:siteId/attendance | Mark attendance in bulk (array of workers) |
| PUT | /api/attendance/:id | Update a single attendance record |

### Materials — `/api/sites/:siteId/materials`

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | /api/sites/:siteId/materials | List all materials for a site |
| POST | /api/sites/:siteId/materials | Add a material entry |
| PUT | /api/materials/:id | Update an entry |
| DELETE | /api/materials/:id | Delete an entry |

### Expenses — `/api/sites/:siteId/expenses`

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | /api/sites/:siteId/expenses | List all expenses for a site |
| POST | /api/sites/:siteId/expenses | Add an expense |
| PUT | /api/expenses/:id | Update an expense |
| DELETE | /api/expenses/:id | Delete an expense |

### Daily Reports — `/api/sites/:siteId/reports`

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | /api/sites/:siteId/reports | List all reports for a site |
| GET | /api/sites/:siteId/reports/:id | Get a single report |
| POST | /api/sites/:siteId/reports | Create a daily report |
| PUT | /api/reports/:id | Update a report |

---

## Error Handling

- **Input validation** on all POST/PUT routes — check required fields and correct types before touching the DB
- **Centralized error handler middleware** — catches errors and returns consistent JSON: `{ error: "message", details?: "extra info" }`
- **404 handler** for unknown routes
- **Database errors** caught and returned as 500 with a generic message (don't leak SQL errors to client)

---

## What's NOT in the Backend (MVP)

- No authentication or user roles
- No file uploads
- No deployment/Docker config
- No notifications
- No PDF/Excel export
