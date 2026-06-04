# Construction Site Management — Feature Roadmap (Master Plan)

> **Status:** Planning. Build has NOT started.
> **Created:** 2026-06-04
> **Basis:** Market analysis (see `docs/market-analysis.md` summary in chat / findings below).
> **Decision on record:** *Plan now, build later.* MVP-safe features build in Phase 1; features that break the MVP's written guardrails are documented now and built in a later phase.

---

## 1. Why this roadmap exists

The MVP's six modules — sites, workers, attendance, materials, expenses, daily reports — are **table-stakes**, not a differentiator. Market research (103-agent deep-research run, 23 verified claims) found that India's #1 player **Powerplay** already covers all six and explicitly markets *"Say goodbye to WhatsApp and Excel"* — the exact positioning this app targets. Powerplay starts at **₹71,999/year**; **Onsite** at a **₹36,000/year** floor.

**The opening is the layer *above* the six modules, plus price.** This roadmap captures the features that close that gap, in priority order, without silently breaking the MVP's scope rules.

## 2. The non-negotiable guardrails (from CLAUDE.md / specs)

These are deliberately **out of MVP scope**. Any feature needing one is Phase 2+:

| Guardrail | Features it blocks |
|---|---|
| **No auth / no accounts** | GST billing & e-invoicing, multi-user pricing tiers, per-customer data isolation |
| **No file/photo uploads** | Bill/voucher photo capture |
| **No offline** (online-only, Vite proxy → API) | Offline-first sync |

Phase-2 docs each state explicitly which guardrail they lift and what that costs.

## 3. Phasing

### Phase 1 — Build now (MVP-safe, no guardrail changes)
| # | Feature | Doc | Why first |
|---|---|---|---|
| 1 | Landing page — light "Warm Sand" redesign | [`01-landing-redesign.md`](01-landing-redesign.md) | Already designed & approved; pure frontend; zero risk |
| 2 | Payroll — attendance → wage computation | [`02-payroll.md`](02-payroll.md) | Highest impact/effort ratio; uses data we already store |
| 3 | Vernacular UI (Hindi + regional) | [`03-vernacular-i18n.md`](03-vernacular-i18n.md) | Real differentiator vs English-only Powerplay; frontend-only |

### Phase 2 — Documented now, build later (each lifts a guardrail)
| # | Feature | Doc | Guardrail lifted |
|---|---|---|---|
| 7 | **Auth — signup/login & accounts** (build FIRST; gates the rest) | [`07-auth-accounts.md`](07-auth-accounts.md) | No auth / no accounts |
| 4 | Bill / voucher photo capture | [`04-bill-photo-capture.md`](04-bill-photo-capture.md) | File uploads |
| 5 | GST billing + vendor/labour payment ledgers | [`05-gst-billing-ledgers.md`](05-gst-billing-ledgers.md) | Auth/accounts |

### Phase 3 — Largest lift, last
| # | Feature | Doc | Guardrail lifted |
|---|---|---|---|
| 6 | Offline-first sync | [`06-offline-first.md`](06-offline-first.md) | Online-only architecture |

> **Pricing / GTM** is a business decision, not a buildable feature in a no-auth MVP (enforcing tiers needs accounts). It is captured here as strategy, built only alongside Phase 2 auth: **undercut the ₹36k–₹72k/year incumbents with a free / sub-₹1,000-month tier.** Price — not features — is the wedge for this segment.

## 4. Verified market findings this roadmap rests on

All confirmed at "high" confidence (3-0 adversarial votes) unless noted:

- WhatsApp+Excel thesis is real (Taylor & Francis 2024, MDPI 2025, KPMG 2025) **but already claimed** by funded incumbents → the angle alone is not a differentiator.
- Powerplay covers all 6 modules + payroll/petty-cash/photos/PO-GRN; from ₹71,999/yr.
- Onsite covers attendance/materials/expenses + subcontractor RA billing; ₹36k/yr floor.
- Yojo offers offline + 8 vernacular languages + attendance→wage payroll (the gaps we target).
- GST billing absent from our specs; sold by Vyapar & ContractorDash.
- Bill-photo capture is a defensible gap (Haeywa's niche; even Yojo does *not* do it — verified by refutation).
- Global tools (Procore/Buildertrend/Contractor Foreman ~₹4,000+/mo, US-centric) are **not** direct threats in this price-sensitive segment.

**Caveats:** most competitor claims come from vendors' own pages (accurate for "what they claim," not audited for depth). Powerplay may be pivoting to AI estimating — re-verify before launch. Pricing current as of June 2026.

## 5. How to use these docs

1. Each feature has its own `.md` with: goal, market rationale, scope (in/out), data-model & API & UI changes, dependencies, acceptance criteria, effort, and open decisions.
2. **Verification gate:** after all docs are written, cross-check each against the specs and guardrails (see §2) before building.
3. **Build gate:** only Phase 1 docs are cleared to build. Phase 2/3 require an explicit decision to lift a guardrail (and updates to `CLAUDE.md` + specs at that time).

## 6. Open questions (carried from research)

- Real *small*-contractor (1–10 crew) adoption of each competitor — marketing says "all sizes," actual SMB traction unverified.
- Lowest sustainable price point in this segment — how far must we undercut ₹36k/yr to convert WhatsApp users?
- True build cost + regulatory burden of GST e-invoicing (IRN, reverse charge) and whether it forces the auth layer.
