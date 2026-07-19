# Implementation Plan: Cost-vs-Value Payback Integration
**Feature Slug: cost-vs-value**

This document outlines the files to be created and modified to implement Feature 2: Remodeling ROI indicators.

---

## 1. Create Data File
We will create `src/data/cost-vs-value.json` to store Zonda's national average project costs, resale values, and payback percentages.

---

## 2. Create CostVsValue React Widget
We will build a generic, premium-styled React component at `src/components/ui/CostVsValueWidget.tsx` (wrapped with `withI18n`) which:
1. Accepts a `projectKey: string` and optional `customCost?: number`.
2. Reads the recoup metrics from the JSON file.
3. Automatically hides itself if the current locale is not English (`locale !== "en"`).
4. Displays:
   - Recoupment % as a progress indicator/gauge.
   - Resale value added based on either the default cost or the user's custom computed project budget.
   - Proper attribution to Zonda Media's annual report.
   - Safety disclaimers and outbound links for local regional data.

---

## 3. Component Integration
We will mount this widget in the results side-panel of:
- `ConcreteSlabCalc.tsx` (using key `concrete-slab`)
- `DeckDesigner.tsx` (using composite/wood dynamically based on selection)
- `RoofShingleCalc.tsx` (using key `roofing-shingles`)
