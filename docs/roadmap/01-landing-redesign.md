# Feature 01 — Landing Page: Light "Warm Sand" Redesign

| | |
|---|---|
| **Phase** | 1 — build now |
| **MVP-safe?** | ✅ Yes — pure frontend restyle, no new deps, no API/DB changes |
| **Status** | Designed & user-approved (paused mid-build) |
| **Effort** | Small (~half day) |
| **Files touched** | `client/src/pages/LandingPage.tsx` only |

## Goal
Convert the existing dark (`bg-gray-950`) landing page to a light, warm, scannable theme and lead the hero with the simplest possible promise — "your whole site, logged in 5 minutes a day" — while keeping all existing sections, copy, and animations.

## Market rationale
The page is the first thing a price-sensitive contractor sees on a low-end Android in daylight. A bright, warm theme reads better outdoors than a dark UI, and the "5 minutes a day" framing maps to the verified reality that the competition is *time saved vs WhatsApp+Excel*, not feature count.

## Scope
**In:**
- Hero copy: lead with **"Your whole site, logged in 5 minutes a day."**; keep "Ditch the WhatsApp chaos. Run your sites like a pro." as the supporting line. Move the amber highlight/underline animation onto "5 minutes a day."
- Dark → light **Warm Sand** palette across all 11 sections (page `amber-50`, white cards, `amber-600` CTAs, `gray-900` text).
- Flip the in-page **App Preview mock** from a dark UI to a light one (the real app is light).
- WCAG-AA contrast pass (bump section tags `amber-500` → `amber-600`).

**Out:** structural/section changes, route changes, copy rewrites beyond the hero, new colors outside the agreed amber/gray + existing semantic red/emerald/green.

## Color mapping (dark → light)
| Element | Now | → Warm Sand |
|---|---|---|
| Page | `bg-gray-950 text-white` | `bg-amber-50 text-gray-900` |
| Cards | `bg-gray-900/50 border-white/5` | `bg-white border-gray-200 shadow-sm` |
| Card hover | `border-amber-500/20` | `border-amber-300` |
| Body text | `text-gray-400/300` | `text-gray-600/700` |
| Nav / footer | `bg-gray-950/80 border-white/5` | `bg-amber-50/80 backdrop-blur border-gray-200` |
| Section tags | `text-amber-500` | `text-amber-600` |
| Hero glow blobs | `amber-500/20` | `amber-200/40` (softened) |
| Grid overlay | white lines `rgba(255,255,255,.1)` | dark lines `rgba(0,0,0,.05)` |
| Before/After cards | `red-500/5` / `emerald-500/5` | `red-50 border-red-200` / `emerald-50 border-emerald-200` |
| Status pills | `green-500/10 text-green-400` | `green-100 text-green-700` |
| CTA card | `from-gray-900 to-gray-800` | `from-white to-amber-50 border-amber-200` |

## Dependencies
None. Framer Motion + Lucide already installed.

## Acceptance criteria
- [ ] No `gray-950`/`gray-900` page backgrounds remain; page is `amber-50`.
- [ ] Hero leads with the 5-min headline; WhatsApp line retained below.
- [ ] App Preview mock renders light.
- [ ] All text meets AA contrast on its background.
- [ ] `npm run build` passes (tsc + Vite).
- [ ] Verified at 375px, 768px, 1024px.

## Open decisions
None — design approved.
