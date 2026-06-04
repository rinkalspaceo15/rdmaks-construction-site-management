# Feature 02 — Payroll: Attendance → Wage Computation

| | |
|---|---|
| **Phase** | 1 — build now |
| **MVP-safe?** | ✅ Yes — uses existing `workers.daily_wage` + `attendance`; no auth, no uploads, no new deps |
| **Effort** | Medium (~2–3 days) |
| **New module?** | Yes — a 7th feature area (read-only computation over existing data) |

## Goal
Turn the attendance the app already records into **payable wages**. For any site + date range, show per-worker and total wages computed from attendance status and overtime. This is the single highest-value, lowest-cost gap to close.

## Market rationale (verified)
Every serious competitor monetizes this: **Yojo, Onsite, Powerplay, ContractorDash** all auto-calculate wages from attendance. Our schema captures attendance (`status`, `overtime_hours`) and `workers.daily_wage` but **computes nothing** — confirmed gap. Contractors today do this by hand in Excel; automating it is an immediate "why switch" reason.

## Current data we already have
- `workers.daily_wage DECIMAL(10,2)`
- `attendance.status ∈ {present, absent, half_day}`, `attendance.overtime_hours DECIMAL(4,1)`
- `attendance` is unique per `(site_id, worker_id, date)`

## Computation rule (proposed)
```
base_factor = present → 1.0 | half_day → 0.5 | absent → 0.0
day_wage    = daily_wage × base_factor
overtime    = overtime_hours × (daily_wage / 8)      # default: 8-hr standard day
worker_total (range) = Σ over days (day_wage + overtime)
```

## Scope
**In:**
- **Backend:** new `models/payroll.ts` (no new table — computed via SQL JOIN of `attendance` + `workers`). New **nested** read route `GET /api/sites/:siteId/payroll?from=YYYY-MM-DD&to=YYYY-MM-DD` returning `{ rows: [{worker_id, name, role, present_days, half_days, absent_days, overtime_hours, wage}], total }`. Follows the existing nested-router pattern (`payroll.ts` mounted at `/api/sites`).
- **Frontend:** new page `pages/Payroll.tsx` at `/sites/:id/payroll`; service `payrollService.ts`; sidebar/tab link; date-range picker; table + grand total; all money via `Intl.NumberFormat('en-IN')` with `₹`.

**Out (this feature):** marking wages as *paid*, payment ledger, advances/loans (those belong to Feature 05), editing wages, PF/ESI statutory deductions.

## API contract
```
GET /api/sites/:siteId/payroll?from=2026-06-01&to=2026-06-30
200 → {
  "from": "2026-06-01", "to": "2026-06-30",
  "rows": [{ "worker_id": "...", "name": "Ramesh", "role": "mason",
             "present_days": 22, "half_days": 1, "absent_days": 2,
             "overtime_hours": "6.0", "wage": "13200.00" }],
  "total": "13200.00"
}
400 → { "error": "from and to dates are required" }
```
DECIMAL values returned as **strings** (pg convention — per cross-package contract).

## Dependencies
None new. Pure SQL + existing stack.

## Acceptance criteria
- [ ] Migration unchanged (no new table) OR documented if a `payroll_runs` cache table is added later.
- [ ] Route validates `from`/`to` present and `from <= to` before querying.
- [ ] Parameterized SQL only.
- [ ] Wage math matches the rule above; verified against a hand-calculated fixture.
- [ ] Money rendered as `₹` + en-IN grouping on the client.
- [ ] `npm run build` passes on both packages.
- [ ] Empty range → friendly empty state, not a spinner.

## Decisions (locked 2026-06-04)
1. **Overtime rate** — ✅ DECIDED: `overtime_hours × (daily_wage ÷ 8)`. No multiplier in v1; revisit if users ask.
2. **Standard day length** — ✅ DECIDED: 8 hours.
3. **Cache table** — not now; compute on the fly. Add a `payroll_runs` cache only if large ranges prove slow.
