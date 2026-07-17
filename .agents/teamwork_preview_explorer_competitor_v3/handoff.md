# Handoff Report: Competitor & UX Audit

## 1. Observation
During a detailed analysis of the HomePlanningHub codebase, layout files, and historical audit documents, the following direct observations were made:

1.  **Imperial-Only Form Inputs in Designers**:
    In `src/components/calculators/ConcreteSlabDesigner.tsx` (Lines 358–360), inputs are fixed to Imperial units:
    ```tsx
    <Input ref={lengthRef} label="Length (ft)" name="length" type="number" inputMode="decimal" value={lengthA} ... />
    <Input ref={widthRef} label="Width (ft)" name="width" type="number" inputMode="decimal" value={widthA} ... />
    ```
    This matches inputs in other designers like `src/components/calculators/TileDesigner.tsx` (Lines 14–20).

2.  **Hardcoded Siding and Framing Costs**:
    In `src/components/calculators/ShedCostCalc.tsx` (Lines 17–22), siding and other materials are estimated using hardcoded array constants:
    ```typescript
    const SIDING_TYPES = [
      { value: "plywood", label: "Plywood T1-11", costSqft: 2.5 },
      { value: "vinyl", label: "Vinyl Siding", costSqft: 3.5 },
      { value: "metal", label: "Metal Siding", costSqft: 4.0 },
      { value: "cedar", label: "Cedar Shakes", costSqft: 6.0 },
    ];
    ```
    Users have no UI mechanism to override these values with local retail costs.

3.  **Viewport Collapsing & Layout Separation**:
    In `src/components/calculators/StairStringerDesigner.tsx` (Lines 154–158), the main layout collapses on smaller screens:
    ```tsx
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* SVG Canvas Column */}
        <div className="lg:col-span-8 flex flex-col gap-4">
    ```
    On mobile viewports, the grid behaves as a single column, stacking the visual canvas at the top and form controls at the bottom, which pushes them out of view simultaneously.

4.  **Broken Language Routing Links**:
    In `src/components/i18n/LanguageSwitcher.tsx` (Lines 21–30), the redirect handler sends users to localized subfolders:
    ```typescript
    window.location.href = l === 'en' ? pathWithoutLocale : `/${l}${pathWithoutLocale}`;
    ```
    However, there are no localized folders under `src/pages/` (such as `es/` or `de/`), resulting in immediate 404 errors for non-English locale selections.

5.  **Audit Strategy Conflict**:
    - `.agents/explorer_ux_audit/handoff.md` (Lines 90–94) recommended: *"Final Verdict: Build the Static Localized Cost & BOM Engine; Do Not Build the Large-Scale Blueprint Library."*
    - `.agents/orchestrator/handoff.md` (Lines 6–7) recommended: *"Verdict: BUILD the Pre-Calculated Project Blueprint Library (Curated/Hybrid); DO NOT BUILD the Localized Cost Engine."*

---

## 2. Logic Chain
The observations support the following assessment of user engagement and competitor positioning:

1.  **Metric-Free Layouts Limit Traffic (Observation 1)**:
    - *Reasoning*: Standard international home improvement search traffic frequently queries metric dimensions (meters, centimeters). Hardcoded Imperial-only inputs prevent HomePlanningHub from ranking in international regions (Europe, Canada, Australia) where competitors like Omni Calculator rank.
2.  **Stateless Page Shifts Restrict Virality (Observation 2)**:
    - *Reasoning*: Without URL search parameter synchronization (e.g. `?length=10&width=12`), users cannot copy and paste a URL to share their exact material results or designs with contractors or retail stores, capping organic referral traffic.
3.  **Scroll Friction Lowers Mobile Dwell Time (Observation 3)**:
    - *Reasoning*: Because mobile screens stack the visual preview canvas above the input panels, users adjusting sliders cannot see visual updates in real-time. This friction degrades mobile user experience and lowers average session duration.
4.  **Evergreen vs. Volatile Asset Maintenance (Observation 5)**:
    - *Reasoning*: Math-based dimension blueprints are governed by physical constants (e.g., volume formulas) and building codes, which are evergreen. Conversely, localized cost data fluctuates daily due to economic conditions. In a zero-API static deployment, a static localized cost database becomes outdated quickly, eroding E-E-A-T. Therefore, building a hybrid/dynamic blueprint library and abandoning the localized cost index is the correct choice.

---

## 3. Caveats
- **No Direct Competitor Scraping**: Peer analysis was performed using internal knowledge of competitor designs under CODE_ONLY constraints.
- **Wrangler Deployment Simulation**: We did not deploy wrangler pages to Cloudflare Pages directly. The file limits are based on Cloudflare's platform specifications.

---

## 4. Conclusion
We have compiled a comprehensive competitor and UX audit report under `competitor_ux_audit.md` in the working directory. To bridge competitor gaps and maximize CTR:
1.  **Confirm the Orchestrator's Verdict**: Build a dynamic, dynamic-routing pre-calculated blueprint library using Astro's hybrid rendering; do not build the localized cost index.
2.  **Resolve UX Flaws**: Focus downstream implementer tasks on implementing mobile-floating layouts, dynamic URL parameters, custom price inputs, and iframe embed generators.

---

## 5. Verification Method
1.  **Inspect Audit Artifacts**: Open `/Users/divyyadav/developer/HomeProjectHub/.agents/teamwork_preview_explorer_competitor_v3/competitor_ux_audit.md` to confirm the presence of specific findings, files, and line numbers.
2.  **Verify Routing Paths**: Inspect the built static folder `dist/` after compiling (`npm run build`) to confirm that `/es/` or other localized path folders are absent, verifying the Language Switcher 404 issue.
3.  **Run Tests**: Run `npm run test` to verify engine stability.

---

## 6. Remaining Work
- **Task 1**: Refactor standard estimators (`ShedCostCalc.tsx`, `FlooringCostCalc.tsx`) to replace hardcoded price constants with customizable, localStorage-saved inputs.
- **Task 2**: Implement a global `UnitContext` and metric toggles for interactive designers.
- **Task 3**: Create a mobile picture-in-picture component wrapper for interactive canvas designers.
- **Task 4**: Introduce URL parameter state parsing across all interactive designers.
- **Task 5**: Build a "Share & Embed" widget generator in the calculator results UI.
