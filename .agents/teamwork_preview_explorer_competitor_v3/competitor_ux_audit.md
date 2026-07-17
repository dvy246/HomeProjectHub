# HomePlanningHub Competitor & UX Audit Report

## 1. Executive Summary
This report analyzes HomePlanningHub against top industry competitors (**Omni Calculator**, **Inch Calculator**, **Calculator.net**, and **Homewyse**) and identifies key user experience, layout, and functional gaps. While HomePlanningHub's Astro-based architecture yields near-perfect Core Web Vitals (a massive ranking advantage over legacy platforms), critical gaps in dynamic pricing inputs, mobile viewport interactivity, fraction/unit flexibility, and backlink/embed sharing restrict its search performance and user engagement. 

This audit outlines concrete design flaws, reconciles conflicting strategic directions from prior audits, and provides actionable recommendations to build a high-converting, evergreen SEO and product moat.

---

## 2. Competitor Feature & Gap Matrix

| Competitor Feature | Omni Calculator | Inch Calculator | Calculator.net | Homewyse | HomePlanningHub (Current) | Gaps & Exploit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Workspace Persistence** | ❌ Stateless | ❌ Stateless | ❌ Stateless | ❌ Stateless | **✅ Persistent Workspace** | **Exploit:** Leverage localStorage to keep user sizes and material lists persistent across calculators. |
| **Dynamic Unit Toggling** | ✅ Live Imperial/Metric toggles per field | ✅ Imperial/Metric toggles | ✅ Simple selectors | ❌ Fixed Imperial | ⚠️ English-only standard; interactive designers hardcoded to Imperial | **Gap:** Incumbents rank globally by supporting metric units. Our interactive designers are hardcoded to feet/inches. |
| **Shareable URL State** | ✅ Full query param string | ✅ URL parameter parsing | ✅ Simple permalinks | ❌ Multi-screen wizard | ⚠️ Spotty (only compare matrix & budget binder support URL params) | **Gap:** Users cannot share custom calculations (e.g. deck design, stair cut plans) via copy-pasting the URL. |
| **Embeddable Widgets** | ✅ High-performance iframe snippets | ✅ Copy-paste widget scripts | ❌ Direct link only | ❌ Opaque portals | ⚠️ /embed/ routes exist but lack UI widgets or discovery features | **Gap:** Bloggers and DIY forums cannot easily embed our tools, missing out on massive backlink-building flywheels. |
| **Step-by-Step Formulas** | ✅ Interactive logic breakdowns | ✅ Deep text-based articles | ✅ Formula summaries | ❌ Opaque black box | **✅ Expandable Math Report Deck** | **Exploit:** Our ReportEngine provides high E-E-A-T transparency by showing detailed mathematical steps. |
| **Localized Cost Estimates** | ❌ None | ❌ Standard regional estimates | ⚠️ Simple pricing templates | ✅ ZIP-code labor & material multipliers | ⚠️ Mixed (Shed/Baluster hardcoded; Slab allows overrides) | **Gap:** Users want cost, not just volume. Incumbents either lack cost or hardcode cost constants. |

---

## 3. Reconciliation of Strategic Conflict
Prior team audit reports present a direct strategic conflict:
*   **Explorer UX Audit Handoff (`.agents/explorer_ux_audit/handoff.md`)**: Recommends building a **Static Localized Cost & BOM Engine** (~200–300 pages) and abandoning the **Pre-Calculated Project Blueprint Library** (5,000 to 10,000 pages) due to Cloudflare's 20,000 files limit.
*   **Orchestrator Handoff (`.agents/orchestrator/handoff.md`)**: Delivers the opposite verdict, recommending **building the Curated/Hybrid Blueprint Library** and **abandoning the Localized Cost Engine**.

### Reconciliation Verdict: Build the Curated/Hybrid Blueprint Library; Do NOT Build the Localized Cost Engine.
The Orchestrator's decision is strategically correct and represents the most viable path for the following reasons:

1.  **Logical Decay vs. Physical Constants (Maintenance Cost)**:
    *   *Mathematical Blueprints (Evergreen)*: Material volumes, joist spans, and stair riser/tread counts are governed by physics and building codes (e.g., IRC). They are physical constants. A blueprint page for a "12-foot rise stair stringer" or a "10x12 concrete patio" will remain accurate for decades, requiring **zero ongoing maintenance**.
    *   *Localized Cost Engine (Volatile)*: Retail lumber/concrete pricing and contractor hourly labor rates fluctuate daily due to inflation, regional supply constraints, and seasonal demand. A static localized cost index becomes outdated within months, immediately damaging user trust and E-E-A-T (evidenced by ongoing complaints on Reddit's `r/HomeImprovement` about Homewyse's inaccurate pricing). Without a dynamic real-time price API, a static localized cost index is a maintenance sinkhole.
2.  **Mitigation of Cloudflare Files Limit**:
    *   By adopting **Astro's Hybrid Rendering** with the `@astrojs/cloudflare` adapter (`export const prerender = false`), we can serve an infinite combination of blueprint dimensions dynamically via Cloudflare Workers without exceeding the 20,000 static file limit of the Free tier.

---

## 4. Concrete UX/UI Audit Findings

### A. Mobile Viewport Layout Stacking & Friction
*   **Files Affected**: `src/components/calculators/ConcreteSlabDesigner.tsx` (Lines 155–158), `src/components/calculators/StairStringerDesigner.tsx` (Lines 154–157), and all interactive designers.
*   **Problem**: In widescreen viewports, designers render in a two-column grid (`grid-cols-12`) placing the interactive SVG canvas on the left and input controls on the right. On mobile viewports (screen widths `< 1024px`), this collapses into a single column, stacking the SVG canvas *above* the controls. 
*   **UX Impact**: A mobile user adjusting inputs (e.g. length/width sliders) must scroll down past the SVG to reach the inputs. As they adjust the slider, they cannot see the SVG canvas update because it is out of the viewport. They must scroll up to see the visual changes, then scroll back down to refine inputs. This extreme friction reduces dwell time and increases mobile bounce rates.
*   **Visual Representation**:
    ```
    +-------------------------+
    |      SVG CANVAS         |   <-- Viewport Top (Updated in real-time)
    +-------------------------+
    ===========================   <-- Mobile Fold (Cuts off screen)
    +-------------------------+
    |   LENGTH SLIDER [==== ] |   <-- User must scroll down here to interact
    |   WIDTH SLIDER  [==   ] |   
    +-------------------------+
    ```

### B. Fixed/Hardcoded Material Costs & Lack of Customization
*   **Files Affected**: `src/components/calculators/ShedCostCalc.tsx` (Lines 17–28, 58–60), `src/components/calculators/renovation/FlooringCostCalc.tsx`.
*   **Problem**: In several standard calculators that attempt to estimate costs, material prices are defined as hardcoded local array variables:
    ```typescript
    const SIDING_TYPES = [
      { value: "plywood", label: "Plywood T1-11", costSqft: 2.5 },
      { value: "vinyl", label: "Vinyl Siding", costSqft: 3.5 },
      { value: "metal", label: "Metal Siding", costSqft: 4.0 },
      { value: "cedar", label: "Cedar Shakes", costSqft: 6.0 },
    ];
    ```
*   **UX Impact**: The user cannot change these values to reflect current retail store pricing in their area. Hardcoding vinyl siding at `$3.50/sq ft` makes the calculation useless for someone paying `$5.20/sq ft` at a local lumberyard, forcing them to abandon the tool to calculate pricing manually.

### C. Rigid Imperial-Only Input Formats (International UX Gap)
*   **Files Affected**: `src/components/calculators/ConcreteSlabDesigner.tsx` (Lines 358–360), `src/components/calculators/TileDesigner.tsx` (Lines 14–20).
*   **Problem**: Input components are hardcoded to imperial labels (`Length (ft)`) and parse raw floats directly, without conversion hooks or toggle parameters.
*   **UX Impact**: Home improvement is a global search niche. DIYers in Europe, Canada, and Australia search in meters, centimeters, and millimeters. Failing to support unit toggles or a global Imperial/Metric switch on our core interactive designers prevents HomePlanningHub from ranking for international queries, giving Omni Calculator a total monopoly in these markets.

### D. Broken Localized Routing & switcher Links
*   **Files Affected**: `src/components/i18n/LanguageSwitcher.tsx` (Lines 21–30), `src/layouts/Layout.astro` (Lines 267–338).
*   **Problem**: The language switcher in the header generates URLs for Spanish, German, Portuguese, Polish, and Italian (e.g., `/es/calculators/concrete/slab/`). However, there are no localized folders in `src/pages` and no dynamic routing handler is configured.
*   **UX Impact**: Clicking any non-English locale from the header dropdown immediately redirects the user to a **404 Page Not Found** screen. This represents a critical UX breakdown.

### E. Loss of Input State on Tab Switching
*   **Files Affected**: `src/components/calculators/MaterialWise.tsx`, and calculators with sub-tab configurations.
*   **Problem**: Switching between view tabs (e.g. switching between different material comparisons or estimator panels) resets the state of input fields to default values.
*   **UX Impact**: If a user inputs custom dimensions, then clicks a tab to read a related comparison or guide, and returns to find their inputs reset, they experience high friction. This reduces dwell time.

### F. Lack of Visual SVG Diagrams on Standard Calculators
*   **Files Affected**: `src/components/calculators/DrywallCalc.tsx`, `src/components/calculators/FrenchDrainCalc.tsx`, `src/components/calculators/VinylFenceCalc.tsx`.
*   **Problem**: Standard calculators are simple text forms. Unlike the interactive designers, they lack static or dynamic SVG illustrations labeling input values.
*   **UX Impact**: For concepts like French drains (trench width, depth, slope) or drywall (stud height vs width), text labels are not always clear to beginner DIYers. Incumbents like Inch Calculator place a labeled wireframe showing exactly where to measure, reducing error rates.

---

## 5. Strategic Optimization Proposals

### Proposal A: Floating "Picture-in-Picture" Mobile Canvas
*   **UX Fix**: On mobile viewports (`max-width: 1023px`), render the interactive SVG canvas inside a floating, sticky header panel at the top of the viewport (taking up ~30% of screen height) when the user scrolls down to the inputs. 
*   **Benefit**: Allows users to see the 2D layout updating in real-time as they adjust the inputs without scrolling back and forth.

### Proposal B: Global Metric/Imperial Context Toggle
*   **UX Fix**: Implement a shared React Context provider (`UnitContext`) wrapped around the pages layout. Standardize all designers to read variables from this context and display either feet/inches or meters/centimeters dynamically.
*   **Benefit**: Expands keyword reach to cover all English-speaking countries using metric systems (e.g. UK, Canada, Australia).

### Proposal C: Client-Side Cost Customization Panels
*   **UX Fix**: Standardize pricing inputs in all estimators (e.g. `ShedCostCalc.tsx`). Instead of hardcoded constant variables, expose these values as editable inputs with local default values (e.g. "Edit Unit Prices" section). Store custom pricing in localStorage so it persists across sessions.
*   **Benefit**: Solves the pricing accuracy problem without requiring a server-side regional database.

### Proposal D: URL Query Param Synchronization
*   **UX Fix**: Wire up React `useEffect` listeners to synchronize input states with the URL query parameters using `window.history.replaceState`. For example: `/calculators/concrete/slab/?length=12&width=14&thickness=4`.
*   **Benefit**: Allows users to copy-paste their specific calculations to contractors, partners, or store employees, creating an organic sharing network.

### Proposal E: Share & Embed Widget Builder
*   **UX Fix**: Add an "Embed Calculator" drawer/modal to the results panel of every calculator. Provide a copyable HTML snippet: `<iframe src="https://homeplanninghub.com/embed/concrete-slab/?length=12" width="100%" height="450px" frameborder="0"></iframe>`.
*   **Benefit**: Powers high-authority backlink loops from DIY blogs and construction suppliers looking to host helpful widgets.

---

## 6. Verification & Checklist
To ensure future implementations do not break the performance moat:
1.  **Build Validation**: Run `npm run build` and ensure the file count in `dist` does not breach Cloudflare's limit.
2.  **Performance Score**: Ensure Core Web Vitals maintain `PageSpeed: 98+` on mobile by lazy-loading scripts and reserving ad slot heights.
3.  **Noindex Verification**: Ensure sitemaps exclude utility/saved folders to prevent crawlers indexing empty pages.
