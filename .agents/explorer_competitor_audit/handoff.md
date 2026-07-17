# Competitor Feature and Gap Audit Report

## 1. Observation

A structural audit of the HomePlanningHub calculator catalog and interactive designers was performed. The following observations were made regarding existing files, inputs, layout patterns, and capabilities:

### A. Lack of Interactive Cost Estimations in Core Designers
While the `ScopeBinder` component (`src/components/calculators/ScopeBinder.tsx`) and the `DiYVsProCalc` component (`src/components/calculators/DiYVsProCalc.tsx`) deal with monetary values and budgeting, our 9 primary interactive designers only output physical material quantities (e.g. bag counts, rebar grid spacing, studs, joists).
- In `src/components/calculators/ConcreteSlabDesigner.tsx` lines 281-283, the outputs saved to projects or passed to the calculator callback are strictly volumetric and physical:
  ```typescript
  const projectInputs = { shape, length: input.lengthA, width: input.widthA, thickness: input.thickness };
  const projectResults = { area: results.area, volumeCuYd: results.volumeCuYd, bagCount: results.bagCount, weight: results.weightLbs };
  const projectMaterials = results.materialList;
  ```
  There is no interactive UI panel or input controls where the user can enter localized concrete bag unit costs, rebar stick costs, or hourly contractor/helper labor rates to calculate an overall slab cost.

### B. Rigid Imperial-Only Input Units
Across both the interactive designers and standard calculators, input fields are hardcoded to single, specific units (usually US Imperial: feet, inches, yards).
- In `src/components/calculators/ConcreteSlabDesigner.tsx` lines 358-370, inputs are fixed to specific units with no option to toggle to metric equivalents (meters, centimeters, millimeters):
  ```tsx
  <Input ref={lengthRef} label="Length (ft)" name="length" type="number" ... />
  <Input ref={widthRef} label="Width (ft)" name="width" type="number" ... />
  <Input ref={thicknessRef} label="Thickness (in)" name="thickness" type="number" ... />
  ```
- Similarly, in `src/components/calculators/TileDesigner.tsx` lines 14-20, variables represent imperial dimensions without dynamic conversion:
  ```typescript
  const [widthFt, setWidthFt] = useState<number>(10);
  const [heightFt, setHeightFt] = useState<number>(10);
  const [groutWidthIn, setGroutWidthIn] = useState<number>(0.125); // 1/8"
  ```

### C. Hardcoded Cost Seeding and Static Lists
Where cost is evaluated, prices are hardcoded as static constants in component code rather than being customizable or reactive to dynamic inputs.
- In `src/components/calculators/ShedCostCalc.tsx` lines 18-28:
  ```typescript
  const SIDING_TYPES = [
    { value: "plywood", label: "Plywood T1-11", costSqft: 2.5 },
    { value: "vinyl", label: "Vinyl Siding", costSqft: 3.5 },
    { value: "metal", label: "Metal Siding", costSqft: 4.0 },
    { value: "cedar", label: "Cedar Shakes", costSqft: 6.0 },
  ];
  ```
  The user can choose the type, but cannot override the `$3.5/sq ft` value for vinyl siding if their local retail price is different.

### D. Missing Print Controls on Standard Calculators
Although all 9 interactive designers, comparison pages, and renovation playbooks support the print function (`window.print()`), standard page calculators that render the `ReportEngine` do not display a print button or export plan tool.
- A grep search in `src/components/calculators/` shows that `window.print()` is used in 14 files, but is completely absent from calculators like `DrywallCalc.tsx`, `PaintCalc.tsx`, `RoofShingleCalc.tsx`, and `RoofPitchCalc.tsx`. These pages generate extensive dynamic summaries via `<ReportEngine />` but don't give users an easy way to print the resulting report sheets.

### E. Static Diagrams Missing on Standard Calculators
While interactive designers draw rich SVG canvas plans (such as the overhead and cross-section views in `ConcreteSlabDesigner.tsx` and the joist layout in `DeckDesigner.tsx`), the standard calculators have no visual schemas or labeled diagrams showing what variables (like "Pitch", "Rise", "Run", or "Diameter") represent.

---

## 2. Logic Chain

The gaps identified above directly impact organic search engine optimization (SEO), international user acquisition, and overall site engagement in the following ways:

1. **Unit Constraints Limit International Traffic (Omni Calculator Gap)**:
   - *Observation*: Standard input forms use hardcoded Imperial units (e.g. `Length (ft)`).
   - *Reasoning*: A significant portion of home improvement search traffic comes from regions using the metric system (Europe, Canada, Australia, etc.). By not providing unit selection dropdowns or a global metric/imperial switch, we alienate international search query volume. Competitors like Omni Calculator rank globally because every input field can toggle between yards, meters, feet, and centimeters.
   
2. **Lack of Dynamic Pricing Gaps Engagement (Homewyse / InchCalculator Gap)**:
   - *Observation*: Designers output only physical quantities, and standard cost calculators hardcode material costs.
   - *Reasoning*: Homeowners planning projects are motivated primarily by cost. If a user receives a list of materials (e.g., "67 bags of 80lb concrete") but cannot input the local price of a bag or estimate professional labor, they must leave the page to perform manual calculations or consult a competitor like Homewyse. Allowing customizable pricing tiers (Basic, Standard, Premium) increases time-on-site (Dwell Time), a critical Google ranking signal.

3. **Absence of Shared Iframe Embeds (Omni Calculator Gap)**:
   - *Observation*: There are no visual embed code generators for external blogs.
   - *Reasoning*: Bloggers and affiliate marketers in the DIY niche frequently look for calculators to embed in their articles. Omni Calculator gains thousands of high-quality backlinks by providing a copy-paste iframe snippet. Because HomePlanningHub is fully static, we could easily offer clean `/embed/...` routes that display the calculator UI without navigation headers, driving link equity and ranking power.

4. **Incomplete Standard Visual Support (InchCalculator Gap)**:
   - *Observation*: Standard calculators have text-based inputs and outputs but lack labeled dimension diagrams.
   - *Reasoning*: Visual clarity is crucial for complex calculations (e.g., measuring "Roof Pitch" or "Sonotube Concrete"). InchCalculator embeds static diagrams displaying exactly which side represents the width, diameter, or slope. Adding simple SVG wireframes to our standard calculators would reduce input mistakes and improve page readability.

---

## 3. Caveats

- **No Live Competitor Scraping**: Because the agent operates under CODE_ONLY network constraints, competitor analysis was performed using internal knowledge of their user interfaces, features, and tools (e.g. Omni's unit selectors, Homewyse's zip code pricing tier systems).
- **Assumed Regional Averages**: Suggested cost defaults represent regional United States averages. Since the site runs on a zero-API static model, exact local zip code rates are simulated using tier multipliers (Basic, Standard, Premium) rather than real-time regional cost databases.

---

## 4. Conclusion

To bridge these competitor gaps without compromising our **zero-API, static-only deployment model**, we propose the following high-value features and architectural improvements:

### Proposal A: Unit Conversion System
Create a shared, lightweight unit utility to enable dropdown unit selectors on all input rows, or a global Metric/Imperial toggle at the top of the controls column.
- **Implementation**: The React state stores raw SI values, and the input controls automatically render converted values based on the selected unit.

### Proposal B: Add Dynamic Cost Summaries to Interactive Designers
Introduce a collapsible "Budget & Labor Estimator" panel in the sidebar of all 9 interactive designers.
- **Model**: Seed a local configuration of low/mid/high material and labor prices (using the same pattern as `ScopeBinder`'s `MATERIAL_DEFAULTS`).
- **Features**: Allow the user to toggle between "DIY Mode" (calculates material costs + optional waste padding) and "Contractor Mode" (adds local labor hourly rates and typical tool rental fees), with all inputs editable by the user.

### Proposal C: Create Embeddable Calculator Pages
Create lightweight, index-free embed routes (e.g., `/embed/calculators/concrete-slab/`) that render components with a clean layout (hiding website headers, footers, sidebars, and ads).
- **Features**: Provide a "Share & Embed" button at the bottom of each calculator that outputs an HTML `<iframe>` snippet, allowing other sites to embed HomePlanningHub tools.

### Proposal D: Static SVG Dimension Guides for Standard Calculators
Design and embed standard inline SVG diagrams on pages without an interactive canvas (e.g. Concrete Columns, Curb & Gutters). These diagrams should clearly label the variables (`D` for diameter, `H` for height, etc.) matching the form input labels.

### Proposal E: Standardize Printing and Export Actions
Extend the printable layout capability to standard calculators. When a user clicks "Print Result Deck", generate a formatted, printable PDF layout of the `ReportEngine` findings, including formulas and material lists.

---

## 5. Verification Method

To verify these findings and check the code references:
1. Inspect the layout constraints of any designer (e.g., `src/components/calculators/ConcreteSlabDesigner.tsx`) to confirm inputs are fixed to Imperial strings without conversion hooks.
2. Search the codebase for pricing tier controls in `src/components/calculators/ScopeBinder.tsx` to inspect how localized pricing is simulated statically.
3. Verify that running the test runner `npm run test` executes and passes all existing engine unit tests, indicating that core geometric and material calculations remain intact:
   ```bash
   npm run test
   ```
