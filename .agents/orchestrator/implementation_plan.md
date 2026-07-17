# High-ROI Feature Implementation Plan: Client-Side Cost & Labor Estimator

## 1. Feature Proposal: Client-Side Local Cost & Labor Customizer

We propose a **Client-Side Local Cost & Labor Customizer Widget** that integrates seamlessly into the results panel of all 9 interactive designers and standard calculators.

### Rationale
- **High SEO ROI**: Google bids heavily on cost-focused queries (e.g. "concrete slab cost", "fence installation pricing"). Providing dynamic material cost calculations on the same page as structural volume calculations directly satisfies transactional search intent. This increases Dwell Time and Recirculation, which are critical ranking signals.
- **Zero API Costs**: Incumbents rely on expensive, geo-restricted zip-code APIs. We bypass this by seeding national averages in a local JSON file (`material-prices.json`) and allowing users to customize unit rates directly in their browser.
- **Product Moat & Workspace Integration**: Any unit price customizations are stored in `localStorage` and shared globally. If a user sets the cost of concrete to $6.50/bag on the Slab Designer, that unit rate automatically propagates to the Concrete Column and Tube calculators.
- **Low Complexity**: The feature is a standalone, reusable React component (`CostEstimatorWidget.tsx`) that reads physical quantities as props and outputs a styled budget summary table.

---

## 2. Step-by-Step Execution Roadmap

### Step 1: Create Default Price Seed Data
- **File**: `src/data/material-prices.json` (New File)
- **Structure**:
```json
{
  "concrete_80lb_bag": { "label": "Concrete Mix (80lb bag)", "defaultPrice": 6.25, "unit": "bag" },
  "rebar_10ft_grade60": { "label": "Rebar #4 (10ft stick)", "defaultPrice": 8.50, "unit": "stick" },
  "gravel_crushed_ton": { "label": "Crushed Gravel (Base)", "defaultPrice": 45.00, "unit": "ton" },
  "lumber_2x4_stud": { "label": "Stud (2x4x8ft)", "defaultPrice": 3.75, "unit": "stud" },
  "drywall_4x8_sheet": { "label": "Drywall Sheet (4x8)", "defaultPrice": 14.50, "unit": "sheet" },
  "labor_hourly_rate": { "label": "Contractor Labor Rate", "defaultPrice": 65.00, "unit": "hour" }
}
```

### Step 2: Implement LocalStorage Wrappers
- **File**: `src/lib/storage.ts`
- **Modifications**: Add helper methods to save and retrieve unit material prices.
```typescript
export interface MaterialPrice {
  price: number;
  label: string;
}

export function saveMaterialPrice(key: string, price: number): void {
  try {
    localStorage.setItem(`hph_price_${key}`, price.toString());
  } catch (e) {}
}

export function getMaterialPrice(key: string, defaultPrice: number): number {
  if (typeof window === "undefined") return defaultPrice;
  try {
    const val = localStorage.getItem(`hph_price_${key}`);
    return val ? parseFloat(val) : defaultPrice;
  } catch (e) {
    return defaultPrice;
  }
}
```

### Step 3: Build the Cost Estimator Widget
- **File**: `src/components/ui/CostEstimatorWidget.tsx` (New File)
- **Description**: A React component that takes computed quantities as props, manages state for custom unit prices, calculates material totals, includes a toggle for "Contractor Labor", and computes the final cost.
- **UI Design**: Uses the Stone grays theme (`bg-[var(--bg-inset)]`, `border-[var(--border)]`) and includes a print-friendly style that does not apply the `no-print` class.

### Step 4: Integrate Widget into Designers
- **File**: `src/components/calculators/ConcreteSlabDesigner.tsx`
  - Mount `<CostEstimatorWidget>` inside the results panel (under the volumetric summary card).
  - Pass the computed quantities (`bagCount`, rebar sticks, gravel tonnage) as a materials prop.
- **File**: `src/components/calculators/FramingDesigner.tsx`
  - Mount the widget in the sidebar layout.
  - Pass the stud count, header boards, and structural fastener calculations.

---

## 3. Verification Plan

1. **Vitest Unit Validation**:
   - Write unit tests in `src/lib/storage.test.ts` to verify that `saveMaterialPrice` and `getMaterialPrice` write/read from localStorage correctly, falling back to defaults during SSR contexts.
   - Run Vitest suite: `npm run test`
2. **Layout & Type Checks**:
   - Run standard build validation to verify compilation and typescript types:
     ```bash
     npm run check
     npm run lint
     ```
3. **UI & Storage Integration Tests**:
   - Open Slab Designer page and enter custom dimension inputs.
   - Modify the unit price of "Concrete Mix" to $7.00. Verify the total price updates.
   - Reload page and check if the custom price of $7.00 persists in the input field.
   - Navigate to the Framing Designer. Verify the local pricing context matches the configured defaults.
4. **Print Verification**:
   - Press `Cmd+P` to open the Print Preview. Verify the "Cost Estimate & Budget" table renders on the print sheet, while navigation headers and side ads are hidden.
