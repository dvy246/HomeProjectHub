# HomePlanningHub: Developer & AI Agent Guidelines

This document serves as the single source of truth for developer environment setup, directory structure, system architecture, UI/UX styles, and strict SEO/E-E-A-T guidelines for **HomePlanningHub** (homeplanninghub.com). HomePlanningHub is a static utility tool built for strong SEO, high-performance Core Web Vitals, and persistent local user workspaces.

---

## 1. Development & CLI Commands

### Local Development Server
*   **Standard Mode:** Starts the interactive dev server on `http://localhost:4321`.
    ```bash
    npm run dev
    ```
*   **Background Mode:** Starts the Astro dev server in the background (highly recommended for non-interactive agents).
    ```bash
    astro dev --background
    ```
*   **Manage Background Server:**
    ```bash
    astro dev status  # Check if running
    astro dev logs    # View console logs
    astro dev stop    # Terminate the server
    ```

### Production Build & Preview
*   **Build Project:** Compiles static HTML output into `./dist/` using Static Site Generation (SSG). Disable Astro telemetry during build to speed up execution.
    ```bash
    npm run build
    ```
*   **Preview Build:** Runs a local web server serving the production compiled files.
    ```bash
    npm run preview
    ```

### Testing, Quality Assurance & Linting
*   **Run Unit Tests:** Executes the unit tests written with Vitest.
    ```bash
    npm run test
    ```
*   **Astro Diagnostics Check:** Checks TypeScript and Astro component compilation issues.
    ```bash
    npm run check
    ```
*   **Code Formatter & Linter:** Uses Biome to check lint rules and auto-format files.
    ```bash
    npm run lint
    ```
*   **Deployment:** Builds the project and publishes to Cloudflare Pages.
    ```bash
    npm run deploy
    ```

---

## 2. Technical Stack & Repository Structure

### Stack Specifications
*   **Framework:** Astro 7.0.3 (Static Site Generation by default)
*   **Interactive Components:** React 19.0.0 Islands (hydrated client-side)
*   **Styling:** Tailwind CSS v4.0.0
*   **Hosting/CDN:** Cloudflare Pages (Static Assets)
*   **Database/Storage:** Browser `localStorage` (No server-side database required for user workspaces)

### Directory Structure
```text
/
├── public/                  # Static assets (favicons, robots.txt, sitemap indices)
├── src/
│   ├── components/          # Reusable UI & Calculator React component islands
│   │   ├── calculators/     # Material calculator components (e.g. ConcreteSlabCalc)
│   │   ├── diagrams/        # Interactive diagrams and visual SVGs
│   │   └── ui/              # Base Vercel-style UI components (Buttons, Inputs, Cards)
│   ├── content/
│   │   └── guide/           # Markdown guides/articles reviewed by Marcus Vance
│   ├── layouts/             # Astro base layouts (e.g. Layout.astro)
│   ├── lib/                 # Core TS utilities (formula engines, storage, schema)
│   └── pages/               # Static Astro page routes (calculators, compare, legal)
├── package.json             # NPM dependencies & task script definitions
└── astro.config.mjs         # Astro integration configs (Sitemap, React, Tailwind)
```

---

## 3. Core Architecture & Formula Engines

All calculations are separated into a modular, two-layer calculation system. Keep geometry logic independent from packaging or material rules.

### Layer 1: Spatial Geometry Engine ([geometry.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/geometry.ts))
Handles raw physical math without material logic.
*   `calculateRectArea(length, width)`: Standard rectangular area.
*   `calculateCircleArea(radius)` / `calculateCircleAreaFromDiameter(diameter)`: Circle area calculations.
*   `calculateTriangleArea(base, height)`: Triangular surface calculations.
*   `calculateLShapeArea(lengthA, widthA, lengthB, widthB)`: L-shaped compound area calculation.
*   `calculateVolume(area, depth)`: Computes cubic volume from surface area and thickness.
*   `subtractOpenings(totalArea, openings[])`: Deducts standard door (21 sq ft) and window (12 sq ft) area sizes.
*   `convertLength(value, fromUnit, toUnit)`: Standard linear conversions between `in`, `ft`, `yd`, `cm`, and `m`.

### Layer 2: Material Packaging Engine ([materialEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/materialEngine.ts))
Applies practical packaging rules, material densities, and waste factors.
*   `applyWasteFactor(volume, wasteFraction)`: Applies margin for cutting, spillage, and site conditions.
*   `calculateConcreteBags(volumeCuFt, bagSize)`: Computes bags of concrete (40lb yield = 0.3 cu ft, 50lb = 0.375 cu ft, 60lb = 0.45 cu ft, 80lb = 0.6 cu ft).
*   `estimateConcreteWeightLbs(volumeCuFt)`: Assumes standard density of 150 lbs per cubic foot.
*   `calculateAggregateTons(type, cubicYards)`: Calculates aggregate weight (crushed stone, sand, gravel) using density configurations from [materials.json](file:///Users/divyyadav/developer/HomeProjectHub/src/data/materials.json).
*   `calculateMulchBags(type, cubicYards)`: Calculates mulch bags needed based on bag sizes (typically 2 cu ft).
*   `calculateDrywallSheets(wallAreaSqFt, sheetSize)`: Computes sheets of drywall (4x8, 4x10, or 4x12) along with joint tape (linear feet), joint compound (lbs), and drywall screws (lbs).
*   `calculateStudCount(wallLengthFt, spacing)`: Computes wall studs based on 16" or 24" spacing.

---

## 4. State Persistence & Local Workspace

User state and rooms are managed entirely client-side.
*   **Storage Utilities:** Managed via [storage.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/storage.ts) using `localStorage`.
*   **Apply Measurements:** Calculators must detect saved room geometries in localStorage. If a matching saved room exists, show an "Apply [Room Name]" button to pre-fill calculator input fields.
*   **State Reset Safeguard:** Calculators must degrade gracefully when private browsing is active or if `localStorage` gets cleared mid-session, falling back to default values without crashing.
*   **Incognito Warn Notice:** Present a warning in the save-state panel explaining that workspace data will be deleted if the user closes their Incognito/Private window.

---

## 5. UI/UX Design & Aesthetic Requirements

To stand out from legacy calculator websites, maintain a clean, premium, "architectural studio" feel:

*   **Warm Stone & Safety Copper Palette:** Use the variables defined in [global.css](file:///Users/divyyadav/developer/HomeProjectHub/src/styles/global.css):
    *   *Stone Grays:* White/stone backgrounds (`#fafaf9`, `#fafafc`, `#e7e5e4`, `#1c1917`).
    *   *Safety Copper Accent:* High-visibility orange (`#ea580c`, `#f97316`) for interactive elements, hover states, and focus outlines.
*   **Translucent Elements & Panels:** Use the `@utility glass-panel` styles for floating calculator summary boxes and contextual onboarding alerts.
*   **Micro-Animations:** Card hover effects should use soft cubic-bezier transitions (`cubic-bezier(0.16, 1, 0.3, 1)`) and a subtle `translateY(-3px)` lift.
*   **Zero Emojis in Hubs:** Always use clean, color-matched SVG vector icons instead of raw browser emojis to preserve design authority.
*   **Interactive Visualizers:**
    *   **Click-to-Focus SVG Hotspots:** Wire diagrams (like `ConcreteSlabDiagram.tsx`) so that clicking visual arrows focuses and scrolls the corresponding input field.
    *   **3D Pallet & Cement Bag Visualizer:** Render interactive grid stacks of bags (capped at 50 bags per standard pallet) that fill dynamically as values change.
    *   **Mixer Truck Volume Fill:** Render proportional drum-liquid levels representing ready-mix capacities. Stack multiple trucks inline if volumes exceed 10 cubic yards.
    *   **Interactive House Explorer:** Isometric SVG interactive map featuring Stripe/Linear hover physics (3D elevation offsets) and a details routing panel.
*   **PDF Print Utility Layouts:** Ensure all output modules include a print button invoking `window.print()`. Write custom `@media print` rules (or Tailwind `print:hidden`) to hide navigation menus, footers, tab controls, and theme switches, replacing select controls with static text labels.

---

## 6. Strict SEO & E-E-A-T Quality Safeguards

Google's Helpful Content System (HCU) is critical for ranking. All calculator and guide pages must meet these specifications:

### A. Core SEO Tags & Structure
*   **Single H1 Header:** Every page must have exactly one `<h1>` containing the target search term. Do not use creative slogans for H1 headers.
*   **Multiple Title Prevention:** Prevent duplicate title tags in the HTML `<head>`. Never include raw `<title>` tags inside SVGs or child elements without setting `aria-hidden` or removing the tags entirely, as they leak into the document `<head>` and confuse search crawlers.
*   **Self-Referencing Canonical Tags:** Define a self-referencing canonical URL on every page to prevent duplicate parameters from indexing.
*   **SEO Schema Structured Data:** Build structured JSON-LD schemas in [schema.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/schema.ts):
    *   *MathSolver Schema:* On all active calculator pages.
    *   *FAQPage Schema:* Match expandable accordion FAQ elements.
    *   *BreadcrumbList:* Breadcrumbs paths for crawl nesting.

### B. Robots, Sitemaps & Locale Routes
*   **Dynamic Translation Routing (`/es/`, `/de/`, `/pt/`, `/pl/`, `/it/`):**
    *   To prevent indexing low-quality auto-translated routes, these locale subdirectories are configured with `noindex={true}` meta tags in their layout.
    *   These locale routes must be added to the sitemap filter inside [astro.config.mjs](file:///Users/divyyadav/developer/HomeProjectHub/astro.config.mjs) to exclude them from the XML sitemap index.
    *   Exclude locale folders from search engines in `robots.txt`.
*   **Sitemap Indexing Filters:** Ensure utility paths (`/saved/`, `/planner/`, `/projects/`, `/embed/`, `/privacy/`, `/terms/`, `/disclaimer/`, `/404`, `/500`) are excluded from `/sitemap-index.xml` compilation.
*   **Persistent Locale Switcher:** Store language preferences inside `localStorage` and display country flag emojis in the header language selector.

### C. E-E-A-T & Trust Badges
*   **Attribution & Editorial Bios:** Every guide page must credit **Marcus Vance (DIY Construction Specialist)** as the chief author and editor, linking back to their professional credentials on the About page.
*   **Disclaimer Links:** Link all estimates to the [disclaimer.astro](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/disclaimer.astro) page explaining variables and tolerances.

---

## 7. Monetization & Ad Placement Rules

*   **AdSense Placements:**
    *   *Desktop:* Leaderboard below the introduction, responsive box below the results panel, sticky scroll-aware sidebar.
    *   *Mobile:* Single responsive box before the input form, single box after the results panel.
    *   *Safety Rule:* Ad units must never push the calculator's primary input fields below the viewport fold on initial page load.
*   **Affiliate Integration:**
    *   *Home Depot Affiliate Alert:* The Home Depot affiliate program was discontinued. **Do not use Home Depot affiliate URLs.**
    *   *Approved Affiliates:* Target Lowe's (Impact Radius) or Amazon Associates.
    *   **Affiliate Links:** Pre-populate product links with quantities calculated by the active page (e.g. Quikrete bags). Include FTC-compliant disclosure notices.

---

## 8. Smart Project Planning System (Ecosystem #1)

A complete, calculator-powered project planning system that turns any home improvement idea into a precise, actionable, staged project binder.
*   **Workflow Configurations (`src/data/workflows.json`):** Defines the list of project steps (e.g. Patio, Shed, Roofing replacement), required inputs, construction timelines, mistakes lists, accessory tools (with buy vs rent specifications), and phase difficulties.
*   **Staged Budgeting & Labor Pricing:** Calculates estimated materials cost based on quantities, and contractor labor rates based on baseline project hours, regional cost multipliers (0.85x to 1.55x), and contingency buffers.
*   **DIY vs. Hire Phase Timeline:** Renders step timelines annotated with phase durations, difficulty tags, and specific trade safety/hiring recommendations.
*   **Printable Project Binder PDF:** Facilitates printing a comprehensive document binder containing material lists, budget summaries, a Contractor Quote Comparison Worksheet, and final punch checklists.
*   **Shared Dimensions Sync:** Maintains a single source of truth in `localStorage`. Dimensions entered in the initial step automatically propagate to all subsequent calculators (e.g. `initialLength`, `initialWidth`, `initialDepth`).
*   **Reusable Component (`ProjectWorkflow.tsx`):** Coordinates back/next navigation, displays progress indicators, loads calculators dynamically, and renders aggregated master shopping checklists and milestones.

---

## 9. Explain & Compare Engine (Ecosystem #2)

Every calculator generates a deterministic 10-section explanation card deck containing:
1.  **Project Summary:** Value-based overview of slab dimensions or wall area coverage.
2.  **Material Breakdown:** Tabulated exact package counts (bags, pieces, sheets).
3.  **Waste Explanation:** Margin recommendations (`high`, `normal`, `low`) based on waste percent.
4.  **Delivery Recommendation:** Safe hauling weight assessments against standard pickup payloads.
5.  **Estimated Weight:** Cargo mass in pounds and tons.
6.  **Comparison Section:** Side-by-side alternative material comparisons (e.g., Concrete vs. Pavers vs. Gravel).
7.  **Shopping Checklist:** Core quantities mixed with secondary accessory and safety gear checklists.
8.  **Common Mistakes:** Curated errors (e.g., over-watering concrete, using incorrect fasteners).
9.  **Next Recommended Calculators:** Contextual routing suggestions.
10. **Learning Section:** Under-the-hood geometry/civil formulas and structural codes (e.g., IBC Section 2308).

*   **Configurable Thresholds (`src/lib/reportEngine.ts`):** Centralized `REPORT_THRESHOLDS` mapping limits for transport weight limits (`3,000 lbs`), ready-mix quantities (`1.5 cy`), and manual mixing safety limits (`60 bags`).

---

## 10. Will It Fit? Vehicle Payload Safety Calculator

To differentiate HomePlanningHub from generic, saturated calculator networks, we implement the **Payload Safety & Trip Calculator** as our key educational and SEO moat:
*   **Purpose:** Solves a major DIY hazard and vehicle damage pain point. Estimates total materials load weight and compares it against vehicle suspension payloads.
*   **Standalone Route:** Located at `/calculators/payload/` ([index.astro](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/payload/index.astro)). Renders the interactive [PayloadCalc.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/PayloadCalc.tsx) client-side.
*   **Features:**
    *   *Interactive SVG Vehicle Visualizer:* Automatically adjusts cargo blocks and simulates rear axle suspension spring compression (sag) based on calculated weight. Flashes red overload danger states.
    *   *Trip Count Optimization:* Suggests the safe number of trips based on vehicle hauling thresholds.
    *   *Tire Pressure & Safety Tips:* Recommends PSI pressure boosts and load distribution layouts to preserve steering control.
*   **Contextual Sourcing Integration:** Linked from the "Delivery Recommendation" panel of other calculators using URL parameters (e.g. `?weight=4500&material=concrete`), automatically loading calculations into the vehicle safety planner.

---

## 11. Interactive Deck Layout Designer with Live Material Engine

To establish a category-defining organic traffic moat and a unique, brand-agnostic utility, we implement the **Deck Layout Designer**:
*   **Location:** `/calculators/deck-designer/` ([index.astro](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/deck-designer/index.astro)). Renders the interactive [DeckDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/DeckDesigner.tsx) client-side.
*   **Calculation Engine:** Math operations defined in [deckEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/deckEngine.ts) (computes footings, support posts, double 2x10 beams, joists count based on 12", 16", or 24" spacing, 16-ft decking boards, hardware, and weights).
*   **Visual SVG Blueprint Canvas:** Renders a 2D grid representation of the deck layout (ledger wall, joists, double beams, footings, and posts) centering dynamically according to selected width and depth sliders.
*   **Contextual Safety Links:** Redirects users to the Payload Safety Calculator, pre-populating total structural lumber and concrete pier weights via URL parameters.
*   **YMYL Warning Rules:** Displays prominent disclaimers reminding users that estimates are based on general IRC R507 standards and require verification from local building departments before construction.

---

## 12. Interactive Tile Layout Designer & Pattern Calculator

To capture long-tail visual search queries (herringbone layout, vertical vs horizontal 12x24, subway offsets), we implement the **Tile Layout Designer**:
*   **Location:** `/calculators/tile-designer/` ([index.astro](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/tile-designer/index.astro)). Renders the interactive [TileDesigner.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/TileDesigner.tsx) client-side.
*   **Calculation Engine:** Spacing math defined in [tileEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/tileEngine.ts) (computes tile counts, box packages, grout joint weights, and thinset mortar requirements based on grout lines and patterns).
*   **SVG Blueprint Grid Repeater:** Visualizes repeating tile grids (Straight Grid, Brick Bond, Herringbone, Versailles Pattern mockup) clipped to room borders via SVG `<clipPath>`.
*   **Vertical vs. Horizontal Toggles:** Supports orientation adjustments that rotate the tile shapes for large formats (12x24, 24x48) dynamically.
*   **YMYL Warning Rules:** Displays disclaimers advising users that tiling requires waste buffers of 10%–15% due to irregular border cuts.

---

## 13. Bulk vs. Bagged Material Delivery Logistics Calculator

To address post-calculation planning and transport logistics, we implement the **Bulk vs. Bagged Material Delivery Logistics Calculator**:
*   **Location:** `/calculators/bulk-vs-bagged/` ([index.astro](file:///Users/divyyadav/developer/HomeProjectHub/src/pages/calculators/bulk-vs-bagged/index.astro)). Renders the interactive [BulkVsBaggedCalc.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/BulkVsBaggedCalc.tsx) client-side.
*   **Calculation Engine:** Spacing math defined in [logisticsEngine.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/logisticsEngine.ts) (compares bulk prices + flat delivery fees + short-load surcharges against bagged materials count + DIY pickup trips + labor time).
*   **Interactive Panel:** Displays side-by-side comparison cards breaking down cost variables, transport weight, vehicle trips, and mixing/spreading labor.
*   **YMYL Warning Rules:** Prominently warns users about pickup vehicle payload limits, advising them to consult their vehicle owner's manual before hauling heavy materials.

