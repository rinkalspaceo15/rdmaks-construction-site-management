# Construction Site Management — MVP Design Spec

## Overview

A web application for small builders and contractors to manage construction sites, replacing WhatsApp + Excel workflows. The MVP focuses on daily site reports, attendance, material tracking, and expense tracking.

**Target Users:**
- Site supervisors/foremen (on-site, logging data)
- Contractors/builders (reviewing data across multiple sites)

**MVP Scope:**
- No authentication (added later)
- Local development only (no deployment config)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, React Router, Axios, Tailwind CSS, Lucide React |
| Backend | Express, TypeScript, pg (node-postgres) |
| Database | PostgreSQL |

---

## Project Structure

```
construction-site/
├── client/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API call functions
│   │   └── types/         # TypeScript interfaces
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── models/        # Database queries/logic
│   │   ├── db/            # DB connection + migrations
│   │   └── types/         # TypeScript interfaces
│   └── package.json
└── README.md
```

---

## Data Model (PostgreSQL)

### sites
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR(255) | Site name |
| address | TEXT | Location |
| status | VARCHAR(20) | active, completed, on_hold |
| start_date | DATE | Project start date |
| created_at | TIMESTAMP | Auto-set on creation |

### workers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR(255) | Worker name |
| role | VARCHAR(100) | mason, electrician, laborer, etc. |
| phone | VARCHAR(20) | Contact number |
| daily_wage | DECIMAL(10,2) | Daily wage amount |
| created_at | TIMESTAMP | Auto-set on creation |

### attendance
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| site_id | UUID (FK → sites) | Which site |
| worker_id | UUID (FK → workers) | Which worker |
| date | DATE | Attendance date |
| status | VARCHAR(20) | present, absent, half_day |
| overtime_hours | DECIMAL(4,1) | Extra hours worked |

### materials
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| site_id | UUID (FK → sites) | Which site |
| name | VARCHAR(255) | cement, steel, bricks, etc. |
| quantity | DECIMAL(10,2) | Amount |
| unit | VARCHAR(50) | bags, kg, pieces |
| unit_price | DECIMAL(10,2) | Price per unit |
| vendor | VARCHAR(255) | Supplier name |
| date | DATE | Purchase/delivery date |

### expenses
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| site_id | UUID (FK → sites) | Which site |
| category | VARCHAR(50) | material, labor, transport, misc |
| description | TEXT | Details |
| amount | DECIMAL(12,2) | Expense amount |
| date | DATE | Expense date |

### daily_reports
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| site_id | UUID (FK → sites) | Which site |
| date | DATE | Report date |
| weather | VARCHAR(20) | sunny, rainy, cloudy |
| summary | TEXT | What happened today |
| issues | TEXT | Problems/blockers |
| created_at | TIMESTAMP | Auto-set on creation |

---

## API Endpoints

All prefixed with `/api`.

### Sites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sites | List all sites |
| GET | /api/sites/:id | Get site details |
| POST | /api/sites | Create site |
| PUT | /api/sites/:id | Update site |
| DELETE | /api/sites/:id | Delete site |

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/workers | List all workers |
| POST | /api/workers | Add worker |
| PUT | /api/workers/:id | Update worker |
| DELETE | /api/workers/:id | Delete worker |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sites/:siteId/attendance?date= | Get attendance for a site/date |
| POST | /api/sites/:siteId/attendance | Mark attendance (bulk) |
| PUT | /api/attendance/:id | Update single record |

### Materials
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sites/:siteId/materials | List materials for a site |
| POST | /api/sites/:siteId/materials | Add material entry |
| PUT | /api/materials/:id | Update entry |
| DELETE | /api/materials/:id | Delete entry |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sites/:siteId/expenses | List expenses for a site |
| POST | /api/sites/:siteId/expenses | Add expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |

### Daily Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sites/:siteId/reports | List reports for a site |
| GET | /api/sites/:siteId/reports/:id | Get single report |
| POST | /api/sites/:siteId/reports | Create daily report |
| PUT | /api/reports/:id | Update report |

---

## Pages & UI

### 7 Pages:

1. **Dashboard** (`/`) — Overview cards (total sites, active workers, today's expenses, pending reports), quick links, recent activity feed.

2. **Sites List** (`/sites`) — Card grid with status badges, search/filter by status, "Add Site" button.

3. **Site Detail** (`/sites/:id`) — Tabbed layout: Overview | Attendance | Materials | Expenses | Reports. Site info header with status, address, start date.

4. **Attendance** (`/sites/:id/attendance`) — Date picker, worker list with present/absent/half_day toggles, overtime input, bulk mark all.

5. **Materials** (`/sites/:id/materials`) — Table view (name, quantity, unit, price, vendor, date), add form, running total.

6. **Expenses** (`/sites/:id/expenses`) — Table with category/description/amount/date, category filter tabs, add form, totals by category.

7. **Daily Reports** (`/sites/:id/reports`) — Timeline/list of past reports, create form (date, weather, summary, issues), single report view.

### Reusable Components:
- **Sidebar** — Navigation with Lucide icons
- **PageHeader** — Title + action button
- **DataTable** — Sortable table with actions
- **StatCard** — Dashboard metric card
- **Modal** — Add/edit forms
- **StatusBadge** — Colored status indicator
- **EmptyState** — Friendly message when no data

---

## Error Handling & Validation

### Backend:
- Input validation on all POST/PUT routes (required fields, valid types)
- Centralized error handler middleware — returns `{ error: string, details?: string }`
- 404 handler for unknown routes
- Database errors caught, returned as 500 with generic message

### Frontend:
- Axios interceptor for API errors — toast notifications on failure
- Form validation — required fields checked before submit, inline errors
- Loading states — skeleton/spinner while fetching
- Empty states — friendly message + action when no records

---

## Out of Scope (MVP)

- Authentication / user roles
- File uploads (photos)
- Deployment / Docker
- Mobile app (responsive web only)
- Notifications
- Reports export (PDF/Excel)
