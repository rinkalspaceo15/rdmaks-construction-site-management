# Construction Site Management — Project Requirements

## The Problem

Small builders and contractors in India manage their construction sites using **WhatsApp groups and Excel sheets**. This means:

- Daily reports get lost in chat scrolls
- Attendance is tracked on paper or memory
- Material purchases have no central record
- Expenses are scattered across messages, bills, and notebooks
- No single place to see "how is my site doing?"

There is no affordable, simple tool built for this audience.

---

## The Solution

A **web app** where a contractor or site supervisor can:

1. **Register their construction sites** and track status (active, on hold, completed)
2. **Mark daily attendance** for workers at each site
3. **Log materials** purchased or delivered (cement, steel, bricks, etc.)
4. **Track expenses** by category (material, labor, transport, misc)
5. **Write daily site reports** — what happened, weather, issues

All data is organized **per site**. One contractor can manage multiple sites.

---

## Who Uses It

| User | What They Do |
|------|-------------|
| **Site Supervisor / Foreman** | On-site daily. Marks attendance, logs materials received, writes end-of-day report |
| **Contractor / Builder** | Reviews data across all sites. Checks expenses, attendance trends, site progress |

Both use the same app — no separate roles in MVP.

---

## MVP Features (What We Build)

### 1. Site Management
- Create, edit, delete construction sites
- Each site has: name, address, status, start date
- Status options: active, completed, on_hold

### 2. Worker Management
- Add workers with: name, role (mason, electrician, laborer, etc.), phone, daily wage
- Workers are global — one worker can appear at multiple sites

### 3. Daily Attendance
- Select a site and date → see list of workers
- Mark each worker: present, absent, or half day
- Record overtime hours
- Bulk "mark all present" option
- One entry per worker per site per day

### 4. Material Tracking
- Log materials per site: name, quantity, unit, unit price, vendor, date
- See running total of material costs
- Example: "50 bags cement, Rs.350/bag, from ABC Traders, 30-May-2026"

### 5. Expense Tracking
- Log expenses per site: category, description, amount, date
- Categories: material, labor, transport, misc
- Filter by category
- See totals per category

### 6. Daily Reports
- One report per site per day
- Fields: date, weather (sunny/rainy/cloudy), summary of work done, issues/blockers
- Browse past reports in timeline view

### 7. Dashboard
- Landing page with overview cards:
  - Total sites
  - Active workers today
  - Today's expenses
  - Pending reports
- Quick links to common actions
- Recent activity across all sites

---

## What We DON'T Build (MVP)

| Skipped Feature | Why |
|----------------|-----|
| Login / Authentication | Adds complexity — MVP is single-user, add auth later |
| File/Photo uploads | Site photos are useful but not essential for MVP |
| Mobile app | Responsive web works on phones — native app is later |
| Notifications | No alerts/reminders in MVP |
| PDF/Excel export | View-only for now, export comes later |
| Deployment / Docker | Local development only |

---

## How It Works (User Flow)

```
Contractor opens app
  → Dashboard shows overview of all sites
  → Clicks a site
    → Site Detail page with tabs:
        → Attendance: mark today's attendance
        → Materials: log new material purchase
        → Expenses: add an expense
        → Reports: write today's report
  → Can also manage workers (add/edit) from sidebar
```

---

## Tech Summary

| Part | Technology |
|------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Express, TypeScript |
| Database | PostgreSQL |
| Icons | Lucide React |

**Two separate apps:**
- `client/` — React frontend (runs on port 5173, proxies API calls)
- `server/` — Express backend (runs on port 3000, serves REST API)

---

## Data Overview

Six tables, all linked through **site_id**:

```
sites ─────────┐
               ├── attendance (site + worker + date)
workers ───────┘
sites ──── materials (what was bought for this site)
sites ──── expenses (what was spent on this site)
sites ──── daily_reports (what happened at this site today)
```

Workers are independent — they can work at any site.

---

## Success Criteria

The MVP is done when a contractor can:

- [ ] Add a construction site
- [ ] Add workers
- [ ] Mark attendance for workers at a site on a given day
- [ ] Log materials purchased for a site
- [ ] Log expenses for a site
- [ ] Write a daily report for a site
- [ ] See a dashboard with overview stats across all sites
