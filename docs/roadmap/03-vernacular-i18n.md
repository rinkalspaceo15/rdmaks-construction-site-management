# Feature 03 — Vernacular UI (Hindi + Regional Languages)

| | |
|---|---|
| **Phase** | 1 — build now |
| **MVP-safe?** | ✅ Yes — frontend-only i18n; no backend/DB change; no auth |
| **Effort** | Medium (~2–3 days incl. translation pass) |

## Goal
Let a low-literacy supervisor use the whole app in their own language. Ship Hindi first, with a language switcher and an architecture that makes adding regional languages (Marathi, Tamil, Telugu…) a translation-file drop, not a code change.

## Market rationale (verified)
Only **Yojo** clearly offers vernacular support (8 Indian languages); **Powerplay is English-only**. For supervisors on ₹8,000 phones who run their lives in Hindi/Marathi, an English-only UI is a hard adoption blocker. This is a clean differentiator against the market leader at low build cost.

## Scope
**In:**
- An i18n layer: a `t(key)` lookup + `LanguageContext` (React Context, per stack rule "useState + useContext only — no Redux").
- Locale JSON files: `client/src/i18n/en.json`, `hi.json` (Hindi), plus stubs for 1–2 regional languages.
- A language switcher in the sidebar/header; selection persisted in `localStorage`.
- Externalize all user-facing UI strings (labels, buttons, empty states, toasts) into keys. **Data stays as entered** (site names, vendor names — never translated).
- Keep `Intl.NumberFormat('en-IN')` for currency regardless of language (₹ grouping is locale-stable).

**Out:** translating user data; RTL languages (not needed for Indian languages); server-side locale; date-localization beyond what `toLocaleDateString('en-IN')` already does.

## Approach decision
- **No new heavy dependency.** A tiny hand-rolled `t()` + Context + JSON files is enough for a fixed-string app and respects the "no new libraries" rule. (If the catalog grows past ~300 keys or needs pluralization/interpolation, revisit `react-i18next` — but that's a deliberate dep addition requiring sign-off.)

## File plan
```
client/src/i18n/
├── index.ts          # LanguageProvider, useTranslation() → { t, lang, setLang }
├── en.json           # source of truth (keys + English)
├── hi.json           # Hindi
└── mr.json           # Marathi (stub / partial)
```
Wrap `<App/>` in `<LanguageProvider>` in `main.tsx`.

## Dependencies
None (hand-rolled). Translation content for Hindi/Marathi to be supplied/reviewed by a native speaker — **flag: machine translation needs human review before launch.**

## Acceptance criteria
- [ ] Switching language updates all chrome strings live, no reload.
- [ ] Choice persists across reloads (`localStorage`).
- [ ] No hardcoded user-facing English strings remain in components (data excluded).
- [ ] Currency still renders `₹` + en-IN grouping in every language.
- [ ] Missing key falls back to English (and logs in dev), never shows a raw key in prod.
- [ ] `npm run build` passes (strict TS — `t()` keys typed).

## Decisions (locked 2026-06-04)
1. **Languages at launch** — ✅ DECIDED: English + Hindi, both full. Regional languages (Marathi/Tamil/Telugu) deferred — add later as JSON drops.
2. **i18n approach** — ✅ DECIDED: hand-rolled `t()` + Context + JSON (no new dependency). Revisit `react-i18next` only if the catalog needs pluralization/interpolation.
3. **Translation review** — ⚠️ OPEN: Hindi strings need a human/native-speaker review pass before launch. Machine draft is not launch-quality.
