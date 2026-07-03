# Implementation Plan: Premium UI/UX & Interactive Visual Enhancements

This plan outlines the implementation of premium interactive features for **HomePlanningHub**, specifically targeting the **Concrete Slab Calculator** as a primary blueprint. The objective is to establish a superior UX that is visually intuitive, interactive, and highly professional.

---

## User Review Required

> [!IMPORTANT]
> The calculations and visual engines are built completely in React on the client side. We will ensure that the additions do not introduce any extra network weight or external render dependencies, preserving our Core Web Vitals score.

---

## Proposed Changes

### 1. Reusable Visual Components

We will create two new modular visual assets to represent material counts physically.

#### [NEW] [PalletVisualizer.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/ui/PalletVisualizer.tsx)
*   **Purpose:** Renders a 3D-like grid stack of cement bags. Capped at 50 bags (representing 1 full standard pallet).
*   **Behavior:** Fills bags in real-time as the count increases. Shows clear labels when limits are reached (e.g. *"1 full pallet + 12 bags"*).

#### [NEW] [TruckVisualizer.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/ui/TruckVisualizer.tsx)
*   **Purpose:** Renders a clean CSS/SVG concrete mixer truck.
*   **Behavior:** Fills the drum color indicator dynamically. Shows capacity percentage (up to 10 cubic yards per truck). Automatically stacks multiple trucks if the order exceeds 10 cubic yards.

---

### 2. Core Page & Diagram Interactive Bindings

#### [MODIFY] [ConcreteSlabDiagram.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/diagrams/ConcreteSlabDiagram.tsx)
*   **Changes:** Add click listeners (`cursor-pointer`) on the dimension labels and lines (Length, Width, Thickness). Trigger an `onDimensionClick(field)` callback passed down from the parent.

#### [MODIFY] [ConcreteSlabCalc.tsx](file:///Users/divyyadav/developer/HomeProjectHub/src/components/calculators/ConcreteSlabCalc.tsx)
*   **Changes:**
    *   Implement `onDimensionClick` handler to focus the length, width, or thickness input elements.
    *   Add a **Site Condition Slider** mapped to standard waste margins (3%, 10%, 15%, 20%).
    *   Add a **DIY vs Hired Labor Toggle** displaying estimated professional labor cost ($4.00–$12.00 per sq ft depending on thickness/setup) side-by-side with material-only expenses.
    *   Integrate `PalletVisualizer` and `TruckVisualizer` under the output card.
    *   Include a collapsible **Math Step-by-Step Stepper** explaining the conversion and calculations in an accordion.

---

## Verification Plan

### Automated Tests
*   Ensure all new React components compile cleanly without syntax errors:
    `npm run check` (once local dev environment is verified)

### Manual Verification
*   Verify clicking on the diagram's "Length" line automatically focuses the length input.
*   Verify sliding the condition selector adjusts the waste factor percentage.
*   Verify the visual bag grid and concrete truck drum fill dynamically as inputs change.
