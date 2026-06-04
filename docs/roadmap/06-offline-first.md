# Feature 06 — Offline-First Sync

| | |
|---|---|
| **Phase** | 3 — documented now, build last |
| **MVP-safe?** | ❌ No — **lifts the online-only architecture** (app assumes live `/api` via Vite proxy) |
| **Effort** | Large (~2–3 weeks; architectural) |

## Goal
Let a supervisor record attendance, materials, and expenses on a site with no signal, and have it sync automatically when the phone reconnects — with no data loss and predictable conflict handling.

## Market rationale (verified)
**Yojo** markets "works 100% offline... built for real Indian construction sites where network is unreliable" as a standout; it's absent from Powerplay's marketing. Our own `CLAUDE.md` already names "intermittent connectivity" as a target reality — yet the app is online-only. Closing this matches the product's stated audience.

> **Caveat:** Yojo's "100% offline" is an unverified vendor boast. The *need* is real (KPMG/academic sources confirm field-connectivity issues); the bar to beat is unproven. Don't over-promise.

## ⚠️ Why this is hard / why it's last
Offline-first is not a feature you bolt on — it changes the data architecture:
- A **client-side store** (IndexedDB) that the UI reads/writes locally first.
- A **sync engine**: queue local mutations, replay to the API on reconnect, reconcile server responses.
- **Conflict resolution**: e.g. two devices mark the same worker's attendance for the same day (the `(site_id, worker_id, date)` unique constraint will collide). Need a documented policy (last-write-wins? per-field merge? surface to user?).
- **ID strategy**: client generates UUIDs locally so records exist before sync (server already uses UUID PKs — compatible).
- Likely a **PWA** (service worker) so the app loads with no network.

## Scope (when built)
**In:** offline create/read for attendance, materials, expenses; background sync on reconnect; clear per-record sync status (pending / synced / conflict).
**Out:** offline for reports/payroll initially (read-mostly); real-time multi-device live updates.

## Dependencies (new — need sign-off)
- Frontend: IndexedDB wrapper (e.g. `idb` or `dexie`), service worker / PWA tooling (`vite-plugin-pwa`). All **new deps requiring sign-off** + a stack-rule exception.
- Backend: sync-friendly endpoints (accept client-generated IDs, idempotent upserts, `updated_at` for conflict detection — needs schema additions).

## Acceptance criteria (when built)
- [ ] `CLAUDE.md` + specs updated to describe the offline architecture and conflict policy.
- [ ] Documented, tested conflict policy for the attendance unique-constraint case.
- [ ] No data loss across airplane-mode → reconnect cycles (tested).
- [ ] Sync status visible per record; failures retried, not silently dropped.
- [ ] Works on a low-end Android browser (the real target device).

## Open decisions
1. **PWA vs native shell** — recommend PWA (stays within "responsive web only" MVP intent).
2. Conflict policy — needs an explicit product decision before building.
3. Which entities are offline-writable at launch (recommend attendance first — it's the daily, on-site, low-signal action).
4. Schema additions (`updated_at`, soft-delete) needed for sync — design before coding.
