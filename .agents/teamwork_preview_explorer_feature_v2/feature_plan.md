# Feature Proposal: Interactive Dynamic Material Cost & Takeoff Customizer Widget

This document proposes and details the design, schema, and implementation roadmap for the **Interactive Dynamic Material Cost & Takeoff Customizer Widget** (`TakeoffCostWidget.tsx`).

---

## 1. Goal & Context

Based on the findings in the **Competitor & UX Audit Report** (`competitor_ux_audit.md`) and the **SEO & AdSense Audit Report** (`seo_adsense_audit.md`):
- **Competitor Gaps**: Legacy tools (Omni, Inch, Homewyse) either completely lack pricing or rely on volatile localized indexes that go stale quickly. However, HomePlanningHub currently uses hardcoded pricing constants (e.g. `$45` for sub-base, `$12` for rebar, or siding in `ShedCostCalc.tsx`).
- **Core Value Proposition**: Expose client-side cost estimation where the user has full control. Users can override unit prices to match local retail store prices (e.g., Home Depot, Lowe's, local lumberyards).
- **Viral Sharing Flywheel**: Custom prices are saved to `localStorage` for cross-calculator consistency, and can be shared via URL query parameters (e.g. `?concrete_bag_price=7.50`), allowing DIYers to share full quotes and estimates.
- **Print Optimization**: Ensure the takeoff customizer remains fully readable in printouts (clean tables, hidden edit controls/buttons) using Tailwind's `print:` utilities.

---

## 2. Technical Specification for `TakeoffCostWidget.tsx`

### Reusable Path
- **File**: `src/components/ui/TakeoffCostWidget.tsx`

### Interface Definitions

```typescript
export interface TakeoffMaterialItem {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  defaultPrice?: number; // Explicit default price (fallback) passed by caller
}

export interface TakeoffCostWidgetProps {
  materials: TakeoffMaterialItem[];
  calculatorId: string;
  onPriceChange?: (updatedPrices: Record<string, number>, totalCustomCost: number) => void;
}
```

### Storage Schema
- **Storage Type**: Browser `localStorage`
- **Key**: `home_project_hub_material_costs_v1`
- **Data Structure**:
  ```json
  {
    "concrete_80lb_bag": 7.50,
    "drywall_sheets": 15.00,
    "joint_tape": 6.50
  }
  ```

### Key Logic & Helper Functions

#### A. Key Normalization
Ensures that material names map consistently to keys for storage and URLs (e.g. "Drywall Sheets" -> "drywall_sheets").
```typescript
export function getMaterialKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "");
}
```

#### B. Merged Initialization Order
1. **URL parameter**: `?[material_key]_price=XX.XX` (Highest priority, enables shared configurations).
2. **localStorage**: `home_project_hub_material_costs_v1` key map (Reflects user custom defaults).
3. **props `defaultPrice`**: Passed explicitly by parent.
4. **Fallback pricing map**: Internal dictionary of common material prices.

```typescript
const DEFAULT_PRICE_FALLBACKS: Record<string, number> = {
  concrete_80lb_bag: 7.50,
  concrete_60lb_bag: 6.00,
  concrete_50lb_bag: 5.20,
  concrete_40lb_bag: 4.50,
  rebar_sticks: 8.50,
  sub_base: 45.00, // per ton
  sealer: 35.00, // per gal
  drywall_sheets: 15.00,
  joint_tape: 6.50,
  joint_compound: 18.00,
  drywall_screws: 9.50,
};
```

---

## 3. Mock Component Code: `TakeoffCostWidget.tsx`

Below is the proposed implementation details for `src/components/ui/TakeoffCostWidget.tsx`:

```tsx
import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { useI18n } from "../i18n/I18nProvider";

export interface TakeoffMaterialItem {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  defaultPrice?: number;
}

export interface TakeoffCostWidgetProps {
  materials: TakeoffMaterialItem[];
  calculatorId: string;
  onPriceChange?: (updatedPrices: Record<string, number>, totalCustomCost: number) => void;
}

const STORAGE_KEY = "home_project_hub_material_costs_v1";

const DEFAULT_PRICES: Record<string, number> = {
  concrete_80lb_bag: 7.50,
  concrete_60lb_bag: 6.00,
  concrete_50lb_bag: 5.20,
  concrete_40lb_bag: 4.50,
  rebar_sticks: 8.50,
  sub_base: 45.00,
  sealer: 35.00,
  drywall_sheets: 15.00,
  joint_tape: 6.50,
  joint_compound: 18.00,
  drywall_screws: 9.50,
};

export function getMaterialKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "");
}

export const TakeoffCostWidget: React.FC<TakeoffCostWidgetProps> = ({
  materials,
  calculatorId,
  onPriceChange,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  // 1. Storage Helpers
  const loadSavedPrices = (): Record<string, number> => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const savePrices = (pricesMap: Record<string, number>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pricesMap));
    } catch {}
  };

  const getPricesFromURL = (): Record<string, number> => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const urlPrices: Record<string, number> = {};
    materials.forEach((mat) => {
      const key = getMaterialKey(mat.name);
      const paramVal = params.get(`${key}_price`);
      if (paramVal) {
        const parsed = parseFloat(paramVal);
        if (!isNaN(parsed) && parsed >= 0) {
          urlPrices[key] = parsed;
        }
      }
    });
    return urlPrices;
  };

  // 2. State setup
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const saved = loadSavedPrices();
    const urlPrices = getPricesFromURL();
    const initialPrices: Record<string, number> = {};

    materials.forEach((mat) => {
      const key = getMaterialKey(mat.name);
      const fallback = mat.defaultPrice ?? DEFAULT_PRICES[key] ?? 1.00;
      initialPrices[key] = urlPrices[key] ?? saved[key] ?? fallback;
    });

    // Auto-persist query params if loaded via shared URL
    if (Object.keys(urlPrices).length > 0) {
      savePrices({ ...saved, ...urlPrices });
    }

    return initialPrices;
  };

  // Keep raw input strings in state to avoid cursor jump while typing decimals
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const initialInputs: Record<string, string> = {};
    materials.forEach((mat) => {
      const key = getMaterialKey(mat.name);
      initialInputs[key] = (prices[key] ?? 0).toFixed(2);
    });
    return initialInputs;
  });

  // Calculate totals
  const totalCost = materials.reduce((sum, mat) => {
    const key = getMaterialKey(mat.name);
    const price = prices[key] ?? 0;
    return sum + (mat.quantity * price);
  }, 0);

  // Trigger parent callback when totals change
  useEffect(() => {
    onPriceChange?.(prices, totalCost);
  }, [prices, totalCost, onPriceChange]);

  // Handle single price changes
  const handlePriceChange = (key: string, rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9.]/g, "");
    setInputs((prev) => ({ ...prev, [key]: rawVal }));

    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed >= 0) {
      const updatedPrices = { ...prices, [key]: parsed };
      setPrices(updatedPrices);
      savePrices(updatedPrices);
    }
  };

  // Copy shareable link (preserves dimensions, updates prices)
  const handleCopyShareLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    materials.forEach((mat) => {
      const key = getMaterialKey(mat.name);
      const val = prices[key];
      if (val !== undefined) {
        url.searchParams.set(`${key}_price`, val.toFixed(2));
      }
    });

    navigator.clipboard.writeText(url.toString())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  // Reset current materials to defaults
  const handleReset = () => {
    const saved = loadSavedPrices();
    const updatedPrices = { ...saved };
    const resetPrices: Record<string, number> = {};
    const resetInputs: Record<string, string> = {};

    materials.forEach((mat) => {
      const key = getMaterialKey(mat.name);
      const fallback = mat.defaultPrice ?? DEFAULT_PRICES[key] ?? 1.00;
      delete updatedPrices[key];
      resetPrices[key] = fallback;
      resetInputs[key] = fallback.toFixed(2);
    });

    savePrices(updatedPrices);
    setPrices(resetPrices);
    setInputs(resetInputs);
  };

  return (
    <Card className="flex flex-col gap-4 border-2 border-[var(--accent)]/10 shadow-sm print:border-0 print:shadow-none print:p-0">
      <div className="flex justify-between items-center print:hidden border-b border-[var(--border)] pb-2.5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--fg)]">Cost & Takeoff Customizer</h3>
          <p className="text-[10px] text-[var(--fg-muted)]">Override unit prices to estimate total materials cost.</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-[10px] font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors underline cursor-pointer"
        >
          Reset to defaults
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {materials.map((mat) => {
          const key = getMaterialKey(mat.name);
          const price = prices[key] ?? 0;
          const lineTotal = mat.quantity * price;

          return (
            <div key={key} className="flex justify-between items-center py-1.5 border-b border-[var(--border)] last:border-b-0 print:border-[var(--border)] print:border-b">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-[var(--fg)]">{mat.name}</span>
                <span className="text-[10px] text-[var(--fg-muted)] font-mono tabular-nums">
                  {mat.quantity.toFixed(1)} {mat.unit}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* User Input controls: hidden during print */}
                <div className="flex items-center gap-1 print:hidden">
                  <span className="text-xs text-[var(--fg-muted)]">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputs[key] ?? ""}
                    onChange={(e) => handlePriceChange(key, e.target.value)}
                    className="w-16 h-8 text-right text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-md px-1.5 font-mono text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <span className="text-[10px] text-[var(--fg-muted)]">/ {mat.unit}</span>
                </div>
                {/* Print layout replacement labels */}
                <span className="hidden print:inline text-xs font-mono text-[var(--fg-secondary)] text-right">
                  ${price.toFixed(2)} / {mat.unit}
                </span>
                {/* Total column */}
                <span className="text-xs font-bold font-mono tabular-nums text-[var(--fg)] w-20 text-right">
                  ${lineTotal.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border)]">
        <span className="text-xs font-bold text-[var(--fg)]">Estimated Materials Subtotal</span>
        <span className="text-sm font-black font-mono text-[var(--accent)] tabular-nums">
          ${totalCost.toFixed(2)}
        </span>
      </div>

      {/* Sharing controls: hidden during print */}
      <div className="flex gap-2 mt-1 print:hidden">
        <button
          type="button"
          onClick={handleCopyShareLink}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {copied ? "Link Copied!" : "Copy Share Link"}
        </button>
      </div>
    </Card>
  );
};
```

---

## 4. Integration Roadmap & Instructions

### Integration Point A: `ConcreteSlabDesigner.tsx`

Currently, `ConcreteSlabDesigner.tsx` calculates its own estimated material cost using hardcoded equations from `concreteSlabEngine.ts` and renders a static list:

#### Before Integration (Conceptual Layout):
```tsx
{/* Shopping List */}
<div className="pt-2 border-t border-[var(--border)]">
  <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Shopping List</span>
  <div className="mt-2 space-y-1">
    {results.materialList.map((item, i) => (
      <div key={i} className="flex justify-between text-xs py-1">
        <span className="text-[var(--fg)]">{item.name}</span>
        <span className="text-[var(--fg-muted)] font-mono">{item.quantity} {item.unit}</span>
      </div>
    ))}
  </div>
</div>
...
<div className="text-[10px] text-[var(--fg-muted)] text-center pt-1">
  Est. material cost: ${results.totalCost.toFixed(0)} &middot; Ready-mix: ~${results.readyMixCost.toFixed(0)}
</div>
```

#### After Integration (Proposed Steps):
1. **Import widget**:
   ```typescript
   import { TakeoffCostWidget } from "../ui/TakeoffCostWidget";
   ```
2. **Add state variables** inside `ConcreteSlabDesigner` to track the dynamically customized total price:
   ```typescript
   const [customTotalCost, setCustomTotalCost] = useState<number | null>(null);
   ```
3. **Render the widget** inside the results panel column (e.g. replacing the static "Shopping List" subsection or rendering immediately below it):
   ```tsx
   <TakeoffCostWidget
     materials={results.materialList}
     calculatorId="concrete-slab"
     onPriceChange={(_, newTotal) => setCustomTotalCost(newTotal)}
   />
   ```
4. **Update the summary tag** at the bottom of the card:
   ```tsx
   <div className="text-[10px] text-[var(--fg-muted)] text-center pt-1">
     Est. material cost: ${customTotalCost !== null ? customTotalCost.toFixed(0) : results.totalCost.toFixed(0)} &middot; Ready-mix: ~${results.readyMixCost.toFixed(0)}
   </div>
   ```

---

### Integration Point B: `DrywallCalc.tsx`

Currently, `DrywallCalc.tsx` does not display any cost estimation whatsoever. Adding our Takeoff Cost customizer is a massive E-E-A-T improvement.

#### Before Integration (Conceptual Layout):
```tsx
<Card>
  <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.finishing.drywall.drywall_materials') ?? 'Drywall Materials'}</h3>
  <div className="flex flex-col gap-3">
    {/* Static rendering of sheets, joint tape, compound, screws */}
  </div>
</Card>
```

#### After Integration (Proposed Steps):
1. **Import widget**:
   ```typescript
   import { TakeoffCostWidget } from "../ui/TakeoffCostWidget";
   ```
2. **Add state variables** inside `DrywallCalc`:
   ```typescript
   const [customTotalCost, setCustomTotalCost] = useState<number | null>(null);
   ```
3. **Embed the widget** in the results column panel (e.g. right underneath the "Drywall Materials" card or replacing it entirely):
   ```tsx
   <div className="mt-4">
     <TakeoffCostWidget
       materials={projectMaterials}
       calculatorId="drywall"
       onPriceChange={(_, newTotal) => setCustomTotalCost(newTotal)}
     />
   </div>
   ```
4. **Update Project Payload (Optional / Secondary integration)**:
   Pass the custom total cost into `AddToProjectCard`'s data payload so that custom pricing follows the item when written to the budget or playbook binder.

---

## 5. Layout & Styling Compliance (Tailwind CSS v4)

As per the **HomePlanningHub Developer Guidelines** (`AGENTS.md`):
- **Tailwind Version**: Built on Tailwind v4 CSS configuration.
- **Backgrounds**: Uses CSS variables `var(--bg-inset)` for input backgrounds and `var(--card-bg)` for container cards.
- **Accents**: Safety copper `#ea580c` and `#f97316` are utilized through `var(--accent)` and `var(--accent-hover)`.
- **Aria Accessibility**: Input elements use `inputMode="decimal"` for mobile numerical keypad popup and include descriptive helper text.
- **Print Optimization**: All editing buttons, copy/share elements, reset text, and inputs are hidden on print layouts using `print:hidden`. The customized price values are cleanly printed as static read-only text nodes using `hidden print:inline`.

---

## 6. Verification and Test Plan

To verify this implementation once written:

1. **Verify Styling & Compile Integrity**:
   - Run `npm run check` to check for TypeScript errors.
   - Run `npm run lint` to format/lint standard file changes.
2. **Verify Interactive Behavior**:
   - **Scenario 1**: Load calculator without query parameters. Change Drywall Sheets cost to `$18.50`. Confirm estimated subtotal recalculates. Reload the page; confirm `$18.50` is successfully fetched from `localStorage` and preserved.
   - **Scenario 2**: Click "Copy Share Link". Open a new incognito window, paste the copied link (containing `?drywall_sheets_price=18.50`). Verify the page loads with the price set to `$18.50`.
   - **Scenario 3**: Click "Reset to defaults". Confirm input resets to `$15.00` (the standard price) and total cost updates.
3. **Verify Print output**:
   - Trigger print preview command (`Cmd+P` on Mac). Confirm the widget card fits inline without buttons or border shadows, and displays the readable static price label (`$18.50 / sheets`) cleanly.
