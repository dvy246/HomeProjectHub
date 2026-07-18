# HomePlanningHub: Developer & AI Agent Guidelines

Single source of truth for dev setup, architecture, UI/UX, and SEO/E-E-A-T guidelines.

---

## 1. Development & CLI Commands

### Local Dev Server
```
npm run dev                          # Interactive, http://localhost:4321
astro dev --background               # Background (non-interactive agents)
astro dev status | logs | stop       # Manage background server
```

### Build & Preview
```
npm run build                        # SSG → ./dist/
npm run preview                      # Serve production build locally
```

### Quality
```
npm run test      # Vitest unit tests
npm run check     # Astro/TS diagnostics
npm run lint      # Biome lint + format
npm run deploy    # Build + Cloudflare Pages
```

---

## 2. Technical Stack & Structure

### Stack
- **Framework:** Astro 7.0.3 (SSG)
- **Interactive:** React 19.0.0 Islands (client-hydrated)
- **Styling:** Tailwind CSS v4.0.0 (`@import "tailwindcss"` in `src/styles/global.css`, no `tailwind.config.js`)
- **Hosting:** Cloudflare Pages
- **Storage:** Browser `localStorage` only — no server database

### Directory Layout
```
/
├── public/                       # Favicons, robots.txt, sitemap indices
├── src/
│   ├── components/
│   │   ├── calculators/          # ~61 React components (Calc + Designer)
│   │   ├── diagrams/             # Interactive SVG diagrams
│   │   ├── ui/                   # Base components (Button, Input, Card, etc.)
│   │   └── CalculatorHub.tsx     # Searchable calculator index (11 categories, 76 entries)
│   ├── content/guide/            # Markdown guides (credited to Marcus Vance)
│   ├── data/
│   │   ├── materials.json        # Density/config data
│   │   ├── workflows.json        # Project playbook step definitions
│   │   ├── estimate-seeds.ts
│   │   ├── blueprint-seeds.ts    # Popular dimension sets for slab, deck, and wall framing
│   │   ├── material-prices.json  # Default regional average pricing parameters for estimating
│   │   └── compare-materials.json # 29 materials (5 categories) with cost/scores/SVG colors/affiliate links
│   ├── layouts/Layout.astro      # Nav, footer, search, locale switcher
│   ├── lib/                      # Pure TS utilities, no React
│   │   ├── geometry.ts           # Spatial math (shared across calculators)
│   │   ├── materialEngine.ts     # Packaging/waste rules (shared)
│   │   ├── closetEngine.ts       # Closet designer math
│   │   ├── compareEngine.ts      # Material comparison scoring, TCO, URL encode/decode, personas
│   │   ├── concreteSlabEngine.ts # Concrete slab & patio designer math
│   │   ├── deckEngine.ts         # Deck designer math
│   │   ├── tileEngine.ts         # Tile designer math
│   │   ├── wainscotingEngine.ts  # Wainscoting designer math
│   │   ├── flooringEngine.ts     # Flooring designer/material estimation math
│   │   ├── framingEngine.ts      # Wall framing designer math
│   │   ├── measureEngine.ts      # Photo-to-measurement math
│   │   ├── stairEngine.ts        # Stair stringer designer math
│   │   ├── diyVsProEngine.ts     # DIY vs contractor cost comparison math
│   │   ├── hardscapeEngine.ts    # Hardscape designer math
│   │   ├── logisticsEngine.ts    # Bulk vs bagged comparison math
│   │   ├── reportEngine.ts       # Report card thresholds/config
│   │   ├── scopeEngine.ts        # Room scope & material planning math
│   │   ├── projectEngine.ts      # Project playbook engine
│   │   ├── budgetEngine.ts       # Budget/labor costing
│   │   ├── estimateEngine.ts     # Estimate generation
│   │   ├── storage.ts            # localStorage typed wrappers
│   │   ├── schema.ts             # JSON-LD schema builders (BreadcrumbList, WebApp, MathSolver, FAQPage, HowTo)
│   │   ├── affiliates.ts         # Lowe's + Amazon affiliate URL builder
│   │   ├── relatedCalculators.ts # Cross-link registry
│   │   └── *.test.ts             # 16 test files, 182 tests total (colocated)
│   ├── pages/
│   │   ├── compare/              # ~846 programmatic material comparison pages (MaterialWise)
│   │   └── ...                   # ~57 calculator SEO pages + plan/estimate/maintenance/legal
│   └── styles/global.css         # Tailwind v4 entry + CSS custom properties
├── package.json
└── astro.config.mjs
```

---

## 3. Core Architecture

### Two-Layer Calculation System
All math follows this split. Keep geometry independent from material/packaging logic.

- **Layer 1 ([geometry.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/geometry.ts)):** Raw spatial math — area (rect, circle, triangle, L-shape), volume, opening subtraction, unit conversion.
- **Layer 2 ([materialEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/materialEngine.ts)):** Packaging rules — concrete bags, drywall sheets, stud count, aggregate/mulch tonnage, waste factor.

### Designer Engine Pattern
All interactive designers use:
- **`*Engine.ts`** — pure functions only (no React, no DOM). Returns deterministic result objects. Uses `assertNever` for union exhaustiveness.
- **`*Designer.tsx`** — `withI18n` HOC, inline `<svg>` canvas + sidebar panel. `grid-cols-1 lg:grid-cols-12`.
- **`index.astro`** — SEO page with schemas, H2/H3 keyword content, `<Component client:load />`.
- **`[...slug].astro`** — catch-all route for programmatic SEO pages (compare, stair dimension pages). Uses `getStaticPaths()` to generate 100s–1000s of pages from seed data.

---

## 4. State Persistence

All storage is client-side `localStorage`. SSR guard: `typeof window !== "undefined"`.

- **[storage.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/storage.ts):** Typed `localStorage` wrappers with SSR guard.
- **ClosetDesigner:** Full auto-save/restore under key `home_project_hub_closet_design_v2`. Reset button clears it.
- **ProjectPlaybook:** Saves checklist checkbox state under `hph-playbook-checked-{workflowId}`.
- **All other calculators/designers:** No persistence. Reset on refresh.
- **Graceful degradation:** Wrap all `localStorage` access in try/catch for private browsing fallback.
- **Incognito warning:** Display where save-state panels exist.

---

## 5. UI/UX Design

- **Colors** (from `global.css`):
  - Stone grays: `#fafaf9`, `#fafafc`, `#e7e5e4`, `#1c1917`
  - Safety copper: `#ea580c`, `#f97316` (interactive elements, hover, focus)
- **`@utility glass-panel`** — floating summary boxes, onboarding alerts.
- **Micro-animations:** `cubic-bezier(0.16, 1, 0.3, 1)`, `translateY(-3px)` on hover.
- **No emojis** — use SVG icons.
- **SVG canvas pattern:** 9 Designers render inline `<svg>` in left column, inputs/results in right column. Photo-to-Measurement uses HTML `<canvas>`. Click-to-focus hotspots optional.
- **Print:** All 9 designers + BulkVsBaggedCalc + ScopeBinder have `window.print()`. Use `print:hidden` on nav/footer/controls. PayloadCalc has no print button.
- **Export:** HardscapeDesigner has JSON blueprint save. No PDF export exists yet — all printouts use browser `window.print()`.

---

## 6. SEO & E-E-A-T

### Per-Page Requirements
Every calculator page must include:
- Exactly one `<h1>` with target keyword
- Self-referencing canonical URL
- OG + Twitter meta tags
- BreadcrumbList schema
- WebApplication schema
- MathSolver schema
- HowTo schema
- FAQPage schema (with matching `<details>/<summary>` HTML on page)
- `print:hidden` on nav, footer, tab controls, theme switcher

### Schema Implementation
All schemas built in [schema.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/schema.ts). The `graphSchema()` combinator merges schemas into one JSON-LD.

### Sitemap & Robots
- Locale routes (`/es/`, `/de/`, `/pt/`, `/pl/`, `/it/`) are noindex, excluded from sitemap, blocked in robots.txt.
- Utility routes (`/saved/`, `/planner/`, `/projects/`, `/embed/`, `/privacy/`, `/terms/`, `/disclaimer/`, `/404`, `/500`) excluded from sitemap.

### Attribution
- All guides credit **Marcus Vance (DIY Construction Specialist)**.
- All estimates link to [/disclaimer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/disclaimer.astro).

### AdSense & Placement Rules
- Do not manually layout advertisement slots or create mock placeholders. AdSense Auto Ads handles ad injection automatically. Ad components should be completely empty/stubbed out.

---

## 7. Shipped Features

### Interactive Designers (SVG Canvas + Sidebar Panel)

| Feature | Engine | Component | Page | Key Properties |
|---|---|---|---|---|
| Concrete Slab Designer | [concreteSlabEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/concreteSlabEngine.ts) | [ConcreteSlabDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/ConcreteSlabDesigner.tsx) | [/calculators/concrete-slab-designer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/concrete-slab-designer/index.astro) | 3 shapes (rect/L-shape/circle), rebar grid, control joints, sub-base, 5 finishes, vapor barrier, SVG plan + cross-section, all bag sizes, print, useProjects, payload cross-link, **25 programmatic dimension pages** |
| Closet Designer | [closetEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/closetEngine.ts) | [ClosetDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/ClosetDesigner.tsx) | [/calculators/closet-designer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/closet-designer/index.astro) | 6 modes, multi-wall, 9 section types, **localStorage auto-save**, print, payload cross-link, useProjects |
| Wainscoting Designer | [wainscotingEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/wainscotingEngine.ts) | [WainscotingDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/WainscotingDesigner.tsx) | [/calculators/wainscoting-designer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/wainscoting-designer/index.astro) | SVG elevation, print, **no localStorage, no payload cross-link** |
| Hardscape Designer | [hardscapeEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/hardscapeEngine.ts) | [HardscapeDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/HardscapeDesigner.tsx) | [/calculators/hardscape-designer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/hardscape-designer/index.astro) | SVG grid, JSON export, print, payload cross-link |
| Deck Designer | [deckEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/deckEngine.ts) | [DeckDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/DeckDesigner.tsx) | [/calculators/deck-designer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/deck-designer/index.astro) | SVG blueprint, joist/beam/footing layout, print, payload cross-link, **20 programmatic dimension pages** |
| Tile Designer | [tileEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/tileEngine.ts) | [TileDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/TileDesigner.tsx) | [/calculators/tile-designer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/tile-designer/index.astro) | SVG clip-path grid, patterns (brick, herringbone), orientation toggle, print, payload cross-link |
| Wall Framing Designer | [framingEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/framingEngine.ts) | [FramingDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/FramingDesigner.tsx) | [/calculators/framing-designer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/framing-designer/index.astro) | SVG elevation, doors/windows obstacles, printable cut list, code warning validation, payload cross-link, useProjects, **17 programmatic dimension pages** |
| Photo-to-Measurement Simulator | [measureEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/measureEngine.ts) | [MeasureFromPhoto.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/MeasureFromPhoto.tsx) | [/calculators/measure-from-photo/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/measure-from-photo/index.astro) | Interactive 2D Canvas scaling and tracing, local client-side processing, direct materials calculator redirect |
| Stair Stringer Designer | [stairEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/stairEngine.ts) | [StairStringerDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/StairStringerDesigner.tsx) | [/calculators/stair-stringer-designer/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/stair-stringer-designer/index.astro) | SVG elevation cut pattern, L-shaped carpenter framing square overlay, IRC warning checks, printable blueprint (window.print), 5400+ programmatic pages |
| MaterialWise Compare | [compareEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/compareEngine.ts) | [MaterialWise.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/MaterialWise.tsx) | [/compare/\[...slug\]](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/compare/%5B...slug%5D.astro) | 29 materials (5 categories), 6 priority sliders, weighted scoring, lifecycle TCO, SVG textures (10 patterns), winner badge, affiliate buy buttons, print, share URL, **846 programmatic pages** |

### Flagship Visual Utility

| Feature | Files | Key Properties |
|---|---|---|
| Room Renovation Budget Binder | [scopeEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/scopeEngine.ts), [ScopeBinder.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/ScopeBinder.tsx), [/plan/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/plan/index.astro) | SVG room plan view, 3 surface finishes (floor/walls/ceiling), 7 material types, quality tier pricing, opening subtractions (doors/windows), shareable URL, printable binder (window.print), waste factor, auto-calculated quantities |

### Specialized Calculators

| Feature | Files | Key Properties |
|---|---|---|
| DIY vs Pro Cost | [DiYVsProCalc.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/DiYVsProCalc.tsx), [diyVsProEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/diyVsProEngine.ts), [/calculators/diy-vs-pro/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/diy-vs-pro/index.astro) | 11 project types, skill-adjusted waste/rework, contractor quote or estimate mode, risk meter, side-by-side cost breakdown, sunk cost analyzer (mistakes + progress), print, YMYL-safe disclaimers |
| Multi-Material Flooring | [FlooringCalc.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/FlooringCalc.tsx), [flooringEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/flooringEngine.ts), [/calculators/flooring/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/flooring/index.astro) | Planks (LVP, laminate, hardwood, engineered wood) & Rolls (carpet, vinyl sheet), live SVG layout preview, integrated CostEstimatorWidget, sitemaps |
| Payload Safety | [PayloadCalc.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/PayloadCalc.tsx), [reportEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/reportEngine.ts), [/calculators/payload/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/payload/index.astro) | Reads `?weight=&material=` URL params, SVG truck visualizer with suspension sag, trip count optimization, **no print, no localStorage** |
| Bulk vs Bagged | [BulkVsBaggedCalc.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/BulkVsBaggedCalc.tsx), [logisticsEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/logisticsEngine.ts), [/calculators/bulk-vs-bagged/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/bulk-vs-bagged/index.astro) | Side-by-side cost comparison (bulk delivery vs bagged DIY), print, **no localStorage** |
| Project Playbook | [ProjectPlaybook.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/ProjectPlaybook.tsx), [projectEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/projectEngine.ts), [budgetEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/budgetEngine.ts), [workflows.json](file:///Users/divyyadav/developer/HomeProjectHub/src/data/workflows.json), [/calculators/renovation/](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/renovation/index.astro) | Multi-step workflow, budget/labor, phase timeline, printable binder, checklist localStorage |
| Explain & Compare | [reportEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/reportEngine.ts) | 10-section report deck: summary, materials, waste, weight, alternatives, checklist, mistakes, next steps, formulas. `REPORT_THRESHOLDS` config. |
| Estimate Pages | [estimateEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/estimateEngine.ts), `src/pages/estimate/*/` | Dynamic estimate pages (concrete-slab, paint-room, roof-shingles, square-footage, tile-floor) |

### Standard Calculators (~47 standalone)
One component + one SEO page each. Major categories:
- **Concrete (10):** Slab, Footing, Column, Wall, Tube, Steps, Mix Ratio, Curb & Gutter, Block Fill, Rebar
- **Roofing (6):** Shingles, Metal, Plywood, Pitch, Snow Load, Ice & Water Shield
- **Weight (10):** Aluminum, Glass, Log, Metal, Pipe, Plate, Steel, Steel Plate, Stone, Tonnage
- **Wall & Fence (8):** Baluster, Board & Batten, Brick, Framing, Retaining Wall, Spindle Spacing, Vinyl Fence, Vinyl Siding
- **Landscaping (10):** Gravel, Limestone, Rip Rap, River Rock, Sand, Mulch, French Drain, Fire Glass, Sealant, Sonotube
- **Specialty (7):** Decking, Drywall, Lumber, Shed Cost, Spiral Staircase, Photo-to-Measurement, Stair Stringer
- **Paint (1):** Paint
- **Tile (1):** Tile
- **Renovation (9):** Bathroom, Kitchen, Basement, Garage, Patio, Deck, Flooring, Fence, DIY vs Pro Cost

### Supporting Files
- **[relatedCalculators.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/relatedCalculators.ts):** Cross-link registry for "Next Recommended Calculators"
- **[affiliates.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/affiliates.ts):** Lowe's (Impact Radius `affcil`) + Amazon Associates (`tag`). **No Home Depot.** Uses `PUBLIC_LOWES_AFFILIATE_ID` and `PUBLIC_AMAZON_ASSOCIATES_TAG` env vars.
- **[CalculatorHub.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/CalculatorHub.tsx):** Searchable index, 11 categories, 77 entries, filterable by text + category.
- **[CostEstimatorWidget.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/ui/CostEstimatorWidget.tsx):** Shared budgeting and cost customization interface powered by local storage price overrides.

---

## 8. Design Patterns & Conventions

### Component Patterns
- **All components:** `function ComponentName()` (no `React.FC`), wrapped with `withI18n()`, exports `default withI18n(ComponentName)`. Imports `useI18n`, `withI18n` from `./i18n/`.
- **Designers:** Inline `<svg>` canvas in left grid column (span 7-8), controls + results in right column (span 4-5). Color legend below canvas.
- **Standard calculators:** Inputs top/left, results bottom/right. No SVG canvas.

### localStorage Pattern
```ts
const STORAGE_KEY = "home_project_hub_<feature>[_v<version>]";
function saveDesign(state) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }
function loadSavedDesign() { if (typeof window !== "undefined") try { ... } catch { return null; } }
```

### Testing
- **16 test files** in `src/lib/`, colocated with engines
- **182 tests total**, all passing
- Vitest runner, engine tests only (no component/DOM tests)
- `npm run test` to execute
- **Link Verification:** Always run the link-checker script in `scratch/check_links.js` against the built `dist/` folder before launching a production deployment to verify internal anchors.

### Tailwind v4 Differences from v3
- Entry: `@import "tailwindcss"` in CSS file (no PostCSS config needed)
- Custom utilities: `@utility glass-panel { ... }`
- Theme tokens: `@theme { --color-accent: #ea580c; }`
- No `tailwind.config.js` — CSS-first configuration
- All custom values in `src/styles/global.css`
