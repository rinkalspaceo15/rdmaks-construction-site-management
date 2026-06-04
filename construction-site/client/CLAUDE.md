# Frontend — React App

Full frontend spec lives in @../../docs/frontend.md — read it before adding pages or services.

## Tech
React 18 + TypeScript 5 (strict) + Vite 5 + Tailwind CSS 3 + React Router 6 + Axios + Lucide React + Framer Motion

## Commands
```bash
npm install
npm run dev       # Vite dev server, port 5173, proxies /api → localhost:3000
npm run build     # Runs `tsc` (typecheck) + Vite production build — use this to verify TS before claiming done
npm run preview   # Preview production build
```
No standalone lint/typecheck script — `npm run build` is the verification command. <!-- DECIDE: add eslint+prettier? -->

## Structure
```
src/
├── main.tsx              # Entry — renders <App/> inside <BrowserRouter>
├── App.tsx               # Routes + AppLayout (sidebar + main); LandingPage rendered without layout
├── index.css             # Tailwind base imports only
├── components/           # Reusable UI (PascalCase files): Sidebar, PageHeader, DataTable, StatCard, Modal, StatusBadge, EmptyState
├── pages/                # One file per route (PascalCase): LandingPage, Dashboard, SitesList, SiteDetail, Workers, Attendance, Materials, Expenses, DailyReports
├── services/             # One file per resource: api.ts (shared axios instance), siteService, workerService, attendanceService, materialService, expenseService, reportService
└── types/index.ts        # Interfaces matching backend models (DECIMAL fields are strings — pg driver)
```

## Routes
| Path | Page | Layout |
|------|------|--------|
| `/` | LandingPage | No sidebar |
| `/app` | Dashboard | AppLayout |
| `/sites` | SitesList | AppLayout |
| `/sites/:id` | SiteDetail (tabbed) | AppLayout |
| `/workers` | Workers | AppLayout |
| `/sites/:id/attendance` | Attendance | AppLayout |
| `/sites/:id/materials` | Materials | AppLayout |
| `/sites/:id/expenses` | Expenses | AppLayout |
| `/sites/:id/reports` | DailyReports | AppLayout |

## Design rules (from parent CLAUDE.md — enforce here)
- **Colors**: amber/orange primary (`amber-600` for actions/CTAs, `amber-700` hover), `gray-900` sidebar, warm neutrals (`gray-50` page bg, `gray-100`/`gray-200` borders). Use Tailwind classes directly — `tailwind.config.js` `theme.extend` is empty; do not add a color until asked.
- **Currency**: every money value renders with `₹` prefix using `Intl.NumberFormat('en-IN')`. <!-- DECIDE: add src/utils/format.ts helper formatINR(n) — currently inline, should be centralized -->
- **Responsive**: mobile-first. Verify at **375px, 768px, 1024px**. Sidebar collapses on `<md` (already wired in `AppLayout`: `md:ml-64`).
- **Accessibility**: every interactive element needs a label or `aria-label`; modals trap focus; forms use `<label htmlFor>`; status colors must pair with text/icon (not color alone).
- **Tap targets**: minimum 44×44px on mobile (contractors use phones on dusty sites).

## Code conventions
- **TypeScript strict mode is ON** (`strict`, `noUnusedLocals`, `noUnusedParameters`). No `any` without a `// reason: ...` comment. Use types from `src/types/index.ts`.
- **Imports**: relative paths only — no path aliases configured (`@/components` will NOT work). Order: React/router → external libs → `components/` → `pages/` → `services/` → `types`.
- **Naming**: PascalCase for components/pages/files (`SiteDetail.tsx`), camelCase for services (`siteService.ts`), camelCase for hooks (`useFoo`).
- **State**: `useState` + `useContext` only — no Redux, Zustand, Jotai. Server state via direct service calls in `useEffect` (no React Query yet).
- **Env vars**: prefix with `VITE_` (Vite requirement). Do not commit `.env`; provide `.env.example`.
- **Constants**: shared strings/enums go in `src/types/index.ts` or a dedicated `src/constants.ts` — never inline magic strings/numbers.

## UI conventions
- **Styling**: Tailwind utility classes only — no CSS modules, styled-components, inline `style={}` (except dynamic values like computed widths).
- **Icons**: `lucide-react` only. Never install another icon library.
- **Forms**: open inside `<Modal>`. Validate on submit; show inline error text under the field. <!-- DECIDE: add zod + react-hook-form, or keep manual validation -->
- **Loading**: spinner (centered) for fetches under ~500ms; skeleton rows for tables/lists; never show empty UI while loading.
- **Errors**: catch in the calling component, show user-facing message via toast. <!-- DECIDE: install react-hot-toast or sonner — currently no toast lib, api.ts has no interceptor -->
- **Empty states**: use the `<EmptyState>` component with a friendly message + primary action button (e.g., "Add your first site").
- **Animations**: `framer-motion` is available for page transitions and modals — keep subtle, no spinning/bouncing on production data.

## Always do
- Run `npm run build` before saying a feature is done — catches TS errors `npm run dev` skips.
- Add a route in `App.tsx` AND a service in `services/` AND a sidebar link in `components/Sidebar.tsx` when introducing a new page.
- Format every money value with `₹` + `Intl.NumberFormat('en-IN')`.
- Match existing component shape — read a similar page (e.g., `SitesList.tsx`) before creating a new one.
- Test the change at 375px width before claiming responsive.

## Never do
- Do not install new UI/icon/animation libraries — stack is fixed (Tailwind + Lucide + Framer Motion).
- Do not hardcode hex colors or arbitrary Tailwind values (`bg-[#f59e0b]`) — use the agreed palette (amber/gray scale).
- Do not pick a color on your own — confirm with the user.
- Do not add a utility/helper file without checking if a service or existing component already covers it.
- Do not use the running backend server URL directly — always go through `/api` (Vite proxies).
- Do not commit `.env`, `dist/`, or `node_modules/`.

<!--
Open decisions to confirm with the team:
1. Toast library — react-hot-toast vs sonner vs custom
2. Form validation — zod + react-hook-form vs manual
3. Lint setup — add eslint + prettier or skip for MVP
4. Currency helper — where to live (src/utils/format.ts?)
5. Axios interceptor — add global 4xx/5xx handler in services/api.ts
These notes are HTML comments — stripped from Claude's context per docs, visible when you open the file.
-->
