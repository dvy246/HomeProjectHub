# Handoff Report: Dynamic Cost Takeoff Customizer Widget

This report outlines the proposed design and integration strategy for the interactive material cost takeoff widget.

---

## 1. Observation

- **Competitor Gaps & Hardcoded Prices**:
  - Direct observations in `competitor_ux_audit.md` (Lines 57-69) and `ShedCostCalc.tsx` (Lines 17-28, 58-60) show that materials/costs are hardcoded as static constants or local variables.
  - In `concreteSlabEngine.ts` (Lines 243-264), the sub-base, reinforcement, sealer, and ready-mix costs are hardcoded using fixed multipliers:
    ```typescript
    const subBaseCost = subBase.tons * 45;
    const readyMixCost = volumeCuYd * 145 + (volumeCuYd < 4 ? 150 : 0);
    ```
  - In `DrywallCalc.tsx` (Lines 39-44), a list of materials is defined:
    ```typescript
    const projectMaterials: MaterialItem[] = [
      { name: "Drywall Sheets", quantity: sheetsWithWaste, unit: "sheets", category: "drywall" },
      { name: "Joint Tape", quantity: result.tapeLf, unit: "lf", category: "drywall" },
      ...
    ];
    ```
    However, no pricing fields or custom overrides are presented in the results card.
- **Theme & Variables**:
  - `global.css` defines stone gray backgrounds (`var(--card-bg)`) and safety copper accent colors (`var(--accent)` = `#ea580c`, `var(--accent-hover)` = `#f97316`).

---

## 2. Logic Chain

1. **Address Volatile Costs (Observation 1)**: Hardcoding local lumber/concrete material prices is fragile because retail pricing fluctuates daily. A static localized database is a maintenance liability. Exposing a client-side cost customizer allows the user to inputs actual local costs, bypassing database requirements entirely.
2. **Standardized Reusable Widget (Observation 3)**: Since calculators like `DrywallCalc.tsx` and `ConcreteSlabDesigner.tsx` already construct structured lists of physical materials (`MaterialItem[]`), we can create a single reusable UI component (`TakeoffCostWidget.tsx`) that operates on this generic structure.
3. **URL Sharing & Workspace Synergy (Observation 1 & 2)**: Storing custom prices in `localStorage` under a unified key (`home_project_hub_material_costs_v1`) allows pricing to persist globally across different calculator views. Appending `?[material_key]_price=XX.XX` to the URL allows users to copy and share calculations with exact pricing overrides.
4. **CSS and Print Layout Rules (Observation 4)**: Using Tailwind's print utilities (e.g. `print:hidden` to hide interactive elements/inputs, and `hidden print:inline` to show static formatted text tags) ensures compliance with layout regulations and yields a clean, professional printout.

---

## 3. Caveats

- **Tax/Tariff Calculations**: The dynamic takeoff customizer computes the materials subtotal. It does not calculate state sales tax or local delivery surcharges unless specifically requested by the user or hardcoded in the parent engine.
- **Metric Unit Equivalences**: Customizer inputs are linked to the base units of the physical materials (e.g. `lf`, `sq ft`, `ton`). If the metric toggle feature is implemented in the future, these price units will need to dynamically map (e.g. price per meter/square meter).

---

## 4. Conclusion

The implementation of `TakeoffCostWidget.tsx` inside `src/components/ui/` represents a high-ROI, low-complexity enhancement that resolves the lack of user pricing customizability highlighted in the UX Audit.
By integrating the widget inside `ConcreteSlabDesigner.tsx` and `DrywallCalc.tsx`, the platform will immediately gain transactional engagement utility, E-E-A-T trust signals, and organic backlink-sharing capabilities.

---

## 5. Verification Method

### Testing the Component Behaviors
1. **Compiling Verification**:
   - Run `npm run check` to ensure there are no compile-time TypeScript issues.
   - Run `npm run lint` to verify syntax and formatting standards.
2. **Behavioral Inspection**:
   - Verify that customized prices persist in `localStorage` (`home_project_hub_material_costs_v1`).
   - Copy and load URLs containing `?drywall_sheets_price=18.50` in a clean window, verifying the custom value is correctly loaded as the starting unit price.
   - Run print preview (`Cmd+P`) and verify that no inputs or buttons are visible, and unit prices print as static text labels (e.g. `$18.50 / sheets`).

---

## 6. Remaining Work

1. Create the new component file `src/components/ui/TakeoffCostWidget.tsx` with the proposed specifications.
2. Modify `ConcreteSlabDesigner.tsx` to import the widget, track custom total state, and swap the static shopping list with the customizer card.
3. Modify `DrywallCalc.tsx` to render the cost customizer card underneath the materials checklist.
