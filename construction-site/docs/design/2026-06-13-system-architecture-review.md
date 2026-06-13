# Architecture Doc Review

> **Reviewed:** `construction-site/docs/design/2026-06-13-system-architecture.md`
> **Method:** Workflow with 5 dimensional reviewers (accuracy, coherence, completeness, false_confidence, spec_alignment), each finding adversarially verified before inclusion.
> **Result:** 16 verified findings — 1 blocker, 9 major, 6 minor.

## Summary

The architecture doc is substantially correct in its high-level shape but carries 16 findings across five dimensions. The dominant theme is **contract drift and false confidence in §7's "all clean" claims**: the doc misstates ON DELETE CASCADE behavior (blocker), conflicts with `docs/backend.md` on the error shape, undercounts endpoints/components by treating spec totals as actuals, and elides Phase 1 routing/sequencing decisions that the roadmap leaves explicitly open. A secondary theme is **incomplete documentation of cross-cutting client/server concerns** — CORS, client error-handling pattern, i18n provider mechanics, the DATE oid 1082 override, and inline currency formatting are all under-specified in §3.

## Findings by dimension

### accuracy

- **blocker** — §6 paragraph 1: "No `ON DELETE CASCADE` defined"
  - Finding: Doc claims no CASCADE constraints exist; migration defines CASCADE on every foreign key.
  - Evidence: `server/src/db/migrate.ts` lines 26–27 (attendance → sites + workers), 36 (materials → sites), 47 (expenses → sites), 56 (daily_reports → sites).
  - Fix: Replace with "ON DELETE CASCADE is defined on all foreign keys (sites → attendance, materials, expenses, daily_reports; workers → attendance)." Remove "deletes leave orphans" assertion.

- **minor** — §3 line 82: "(5 lines total)"
  - Finding: `index.ts` is 8 lines, not 5.
  - Fix: Change to "(8 lines total)" or "(5 non-blank lines)" if that's the metric.

### coherence

- **major** — §5 line 133 vs `docs/backend.md:181`: Error shape conflict
  - Finding: Architecture doc says strict `{ error: string }` with "No other keys"; `docs/backend.md:181` allows optional `details`. Code (`server/src/middleware/errorHandler.ts:4,9`) and `server/CLAUDE.md:73` both follow the strict form.
  - Fix: Reconcile across all four locations. Recommended direction: drop optional `details` from `docs/backend.md:181` to match code + architecture + server CLAUDE.md.

- **major** — §7 line 170: "All six cross-package contracts clean ✓"
  - Finding: Contradicted by the error-shape conflict above.
  - Fix: Update §7 to call out the unresolved error-shape conflict as an open contract issue.

- **minor** — §7 line 179: "Real spec-vs-code gaps (not Phase 1)"
  - Finding: Heading implies gaps are post-Phase-1, but the gap-fix plan and §8's target state treat them as Phase 1 closure work.
  - Fix: Rename to "Phase 1 gap-fix work" or fold under "Built but not yet in main specs" alongside Payroll/Landing/i18n.

### completeness

- **major** — §3 Server, Middleware row: CORS missing
  - Finding: `server/src/app.ts:18` mounts `app.use(cors())` globally; only `errorHandler.ts` is listed.
  - Fix: Add "CORS (cors package) — default config (all origins); mounted globally before routers."

- **major** — §3 Client, Services row: Error-handling responsibility undocumented
  - Finding: Doc says "no interceptor" but doesn't state that error handling is the caller's job. Pages handle this inconsistently (try/catch in `SitesList.tsx`; `.then/.finally` without `.catch` in `Dashboard.tsx`, `Materials.tsx`).
  - Fix: Add to Services row: "Error handling is the caller's responsibility — pages must wrap service calls in try/catch and surface errors to users."

- **major** — §3 Client, i18n row: Provider mechanics underdocumented
  - Finding: One-line description vs full implementation: `LanguageProvider` context, catalogs at `i18n/{en,hi}.json` (~165 keys each), `main.tsx` wraps `<App />`, persists to `localStorage` (`sm_lang`), missing-key fallback to English with dev warning.
  - Fix: Expand i18n row with the implementation specifics above.

- **major** — §5 / §9.7: CORS as production decision missing
  - Finding: CORS is default (all origins); not mentioned in cross-package contracts or deployment decision points.
  - Fix: Add to §9.7: "CORS is currently default. Same-origin reverse proxy needs no change; separate-origin deployment requires an explicit allowlist."

- **minor** — §3 Client, Components row: Inline currency formatting drift
  - Finding: `Intl.NumberFormat('en-IN')` inlined across `Materials.tsx:17–18`, `Expenses.tsx:27–28`, `Payroll.tsx:11–15`, `Workers.tsx:95`. §8 plans consolidation but §3 doesn't mention the drift.
  - Fix: Note in §3: "Currency formatting is inline in Materials, Expenses, Payroll, Workers. Centralized `formatINR` planned (see §8)."

- **minor** — §3 Server, DB row: DATE oid 1082 override absent
  - Finding: Override is documented in §5 but missing from §3, despite §11 flagging it as "silent magic."
  - Fix: Expand DB row: "Shared pool with oid 1082 (DATE) parser override returning raw `YYYY-MM-DD` to prevent IST shift."

### false_confidence

- **major** — §7 line 165: "All 24 REST endpoints ✓"
  - Finding: Accurate against spec but misleading in a "matches spec" section — codebase has 25 endpoints (24 spec'd + Payroll). The doc itself acknowledges Payroll three lines down.
  - Fix: Rephrase to "All 24 spec'd REST endpoints from `docs/backend.md` ✓ (plus 1 unspec'd: Payroll)."

- **major** — §5 line 133 (same conflict as coherence finding above) — flagged here because the doc states the strict shape with high confidence despite the spec disagreement.

- **minor** — §7 line 168: "All 7 reusable components ✓"
  - Finding: Conflates spec inventory with actual inventory. `client/src/components/` has 9 files (7 spec'd + `LanguageSwitcher` + `PageTransition`).
  - Fix: "All 7 spec'd reusable components ✓ (plus 2 Phase 1 additions: `LanguageSwitcher`, `PageTransition`); DataTable lacks sort (see gap below)."

### spec_alignment

- **major** — §8 line 192: "Landing at `/`, Dashboard at `/app`"
  - Finding: Target state asserts a routing layout that `docs/frontend.md:44` requires reversed (Dashboard at `/`), and `docs/roadmap/01-landing-redesign.md:24` explicitly excludes route changes from its scope. The gap report flags current routing as a blocker.
  - Fix: §8 must resolve the root route explicitly — either commit to restoring Dashboard at `/` (per spec), or record an explicit spec-change decision lifting the original contract (documented separately from Feature 01, since that feature's scope excludes routing).

- **minor** — §10 lines 268–272: Phase 2 sequencing
  - Finding: Lists auth, photo, GST without explicit ordering. `docs/roadmap/04-bill-photo-capture.md:59` notes photos "likely should follow auth" for privacy.
  - Fix: Add: "Phase 2 sequence: auth (Feature 07) first, then photos (Feature 04), then GST (Feature 05)."

## Top fixes (priority order)

1. **Fix the ON DELETE CASCADE statement in §6** (blocker) — the only outright factual error; materially misleads on data-loss behavior.
2. **Reconcile the error-shape contract** across `docs/backend.md:181`, architecture §5 line 133, `errorHandler.ts`, and `server/CLAUDE.md` (major × 2).
3. **Resolve the root route in §8 line 192** (major) — either restore Dashboard at `/` per spec, or record an explicit spec-change decision.
4. **Correct the endpoint and component counts in §7 lines 165 & 168** (major + minor) — distinguish "spec'd" from "actual."
5. **Backfill §3 with the missing cross-cutting concerns**: CORS middleware, client error-handling responsibility, full i18n mechanics, and the DATE oid 1082 override (major × 3 + minor).
6. **Reframe §7 line 179's "not Phase 1" heading** (minor) — align with the gap-fix plan's treatment.
