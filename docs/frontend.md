# Construction Site Management — Frontend Spec

## What This Covers

The frontend is a single-page React app that provides the UI for site supervisors and contractors. It talks to the Express backend via REST API calls.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| TypeScript | Type safety |
| React Router | Client-side routing |
| Axios | HTTP client for API calls |
| Tailwind CSS | Styling |
| Lucide React | Icons |

---

## Project Structure

```
client/
├── src/
│   ├── components/    # Reusable UI components (Sidebar, DataTable, Modal, etc.)
│   ├── pages/         # One component per page/route
│   ├── services/      # API call functions (one file per resource)
│   └── types/         # TypeScript interfaces matching backend data
├── index.html
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

**Key idea:** Pages compose components and call services. Services handle API calls. Components are reusable UI pieces.

---

## Pages (7 total)

### 1. Dashboard — `/`

The landing page. Gives a quick overview of everything.

**What it shows:**
- Stat cards: total sites, active workers today, today's total expenses, pending reports
- Quick links to common actions (add site, mark attendance, add expense)
- Recent activity feed (latest entries across all sites)

**Why it matters:** Contractors managing multiple sites need a single glance to know the state of things.

### 2. Sites List — `/sites`

Browse and manage all construction sites.

**What it shows:**
- Card grid layout — each card shows site name, status badge, address, start date
- Search bar to filter by name
- Filter by status (active / completed / on_hold)
- "Add Site" button that opens a modal form

### 3. Site Detail — `/sites/:id`

Everything about one specific site, organized in tabs.

**Tabs:**
- **Overview** — site info (name, address, status, start date), summary stats
- **Attendance** — links to attendance page
- **Materials** — links to materials page
- **Expenses** — links to expenses page
- **Reports** — links to daily reports page

**Header:** Site name, status badge, address, start date — always visible regardless of active tab.

### 4. Attendance — `/sites/:id/attendance`

Mark and review who showed up to work.

**What it shows:**
- Date picker (defaults to today)
- List of all workers with toggle buttons for each: `present` / `absent` / `half_day`
- Overtime hours input field per worker
- "Mark All Present" bulk action button
- Save button to submit attendance in bulk

**How it works:** Supervisor opens this page at the start of the day, marks everyone, hits save. The POST sends an array of attendance records.

### 5. Materials — `/sites/:id/materials`

Track materials purchased or delivered to a site.

**What it shows:**
- Table with columns: name, quantity, unit, unit price, total (calculated), vendor, date
- Running total at the bottom (sum of all material costs)
- "Add Material" button → modal form with fields: name, quantity, unit, unit price, vendor, date
- Edit/delete actions per row

### 6. Expenses — `/sites/:id/expenses`

Track all costs for a site.

**What it shows:**
- Table with columns: category, description, amount, date
- Category filter tabs at the top: All | Material | Labor | Transport | Misc
- Totals by category displayed as summary cards
- "Add Expense" button → modal form
- Edit/delete actions per row

### 7. Daily Reports — `/sites/:id/reports`

End-of-day site logs.

**What it shows:**
- Timeline/list of past reports (newest first) — date, weather icon, summary preview
- "Create Report" button → form with: date, weather dropdown, summary textarea, issues textarea
- Click a report to see the full detail view

---

## Reusable Components

| Component | What It Does |
|-----------|-------------|
| **Sidebar** | Left navigation bar with links to Dashboard, Sites, Workers. Uses Lucide icons. Highlights active page. |
| **PageHeader** | Page title on the left, primary action button on the right (e.g. "Add Site"). |
| **DataTable** | Sortable table component. Receives columns config + data rows. Supports action buttons per row. |
| **StatCard** | Small card showing a label, a number, and an icon. Used on the Dashboard. |
| **Modal** | Overlay dialog for add/edit forms. Has title, form content, cancel/submit buttons. |
| **StatusBadge** | Colored pill showing status text. Green = active, yellow = on_hold, gray = completed. |
| **EmptyState** | Friendly illustration + message + action button. Shown when a table/list has no data yet. |

---

## API Integration (Services Layer)

Each resource gets its own service file in `src/services/`:

- `siteService.ts` — getSites, getSite, createSite, updateSite, deleteSite
- `workerService.ts` — getWorkers, createWorker, updateWorker, deleteWorker
- `attendanceService.ts` — getAttendance, markAttendance, updateAttendance
- `materialService.ts` — getMaterials, createMaterial, updateMaterial, deleteMaterial
- `expenseService.ts` — getExpenses, createExpense, updateExpense, deleteExpense
- `reportService.ts` — getReports, getReport, createReport, updateReport

All services use Axios with a base URL pointing to `http://localhost:3000/api`.

---

## UX Patterns

### Loading States
- Show skeleton placeholders or spinners while data is being fetched
- Disable submit buttons while a request is in-flight

### Error Handling
- Axios interceptor catches API errors globally
- Show toast notifications on failure (e.g. "Failed to save attendance")
- Form validation runs before submit — show inline error messages for required fields

### Empty States
- When a site has no materials yet: show a friendly message like "No materials tracked yet" with an "Add Material" button
- Same pattern for expenses, attendance, reports

---

## What's NOT in the Frontend (MVP)

- No login/signup screens (no auth in MVP)
- No file/photo uploads
- No mobile app (responsive web only — works on phone browsers)
- No push notifications
- No PDF/Excel export buttons
