# Revised Feature Gap & Build Plan

**Project:** HomePlanningHub
**Date:** July 4, 2026
**Status:** Revised after stakeholder review

---

## Executive Summary

HomePlanningHub ships 48+ calculators, 18 guides, project planner, maintenance hub, comparison matrix, and localStorage persistence. Technical execution is strong.

The site answers "how much material do I need?" but falls short on "how do I plan and budget for this?" and "what do I do next?"

**Revised strategy:** Avoid YMYL cost estimation. Build a planning-oriented budget layer where users supply their own prices. Focus on workflow completion, not data authority.

---

## Priority Order (Revised)

### 1. Launch the site
No feature matters without traffic. Remove any remaining launch blockers.

### 2. Backlinks and topical authority through content
- Embeddable calculator widgets for organic backlink acquisition
- Expand content clusters (flooring, fencing, siding, decking, insulation)
- More comparison pages

### 3. Internal linking and cross-calculator workflows
- "You might also need" recommended calculators on every calculator page
- Contextual links between guides and calculators
- Related comparison links

### 4. Renovation Budget Planner (planning-focused, not authoritative pricing)
- User supplies their own material and labor prices
- Pull quantities from calculator results
- Track budget vs. actual spending
- Creates retention loops (users return to update actuals)

### 5. Expand into additional planner and comparison pages
- Data-driven additions based on Search Console queries post-launch
- New material comparison pages
- Seasonal and project-type planners

---

## Features to Build

### 1. Cross-Calculator Internal Linking
**File:** `src/components/ui/RelatedCalculators.tsx`
Simple component dropped into the footer of every calculator page. Links to related calculators and comparison pages.

### 2. Renovation Budget Planner
**New files:**
- `src/lib/budgetEngine.ts` — types + localStorage CRUD
- `src/components/budget/BudgetDashboard.tsx` — list plans
- `src/components/budget/BudgetPlanView.tsx` — single plan with budget tracking
- `src/components/budget/BudgetPlanNew.tsx` — create plan

**New pages:**
- `/renovate/plans/` — list all plans
- `/renovate/plans/new/` — create new plan
- `/renovate/plans/view/` — single plan (client-side ID from URL)

### 3. Embeddable Calculator Widgets
**New files:**
- `/embed/[calculator].astro` — raw iframe-able page with no chrome
- Clean query param API for dimension inputs

### 4. Content Expansion
- Add comparison pages: `flooring-vs-laminate`, `fence-materials`, `siding-options`
- Add guides for missing pillars: flooring, fencing, decking, insulation

---

## Features Explicitly Rejected

| Feature | Reason |
|---------|--------|
| ZIP-code cost estimation | YMYL risk, maintenance burden, erodes trust if inaccurate |
| AI Design Visualization | High API cost, crowded, weak feature adjacency |
| Contractor Marketplace | High ops, trust issues, Angi/Houzz dominate |
| AR/LiDAR Scanning | Phone dependency, Lowe's does it |
| Native Mobile App | No SEO value, premature |
| User Accounts/Auth | Premature before 50K MAU |
| Permitting/Code Data | Expensive APIs, low search volume |

---

## Build Sequence

```
Phase 1 (now)
├── RelatedCalculators component
├── BudgetEngine (lib)
├── Budget Dashboard
├── Budget Plan Detail
├── Budget Plan New
├── Budget pages (renovate/plans/*)
└── Embeddable widget route

Phase 2 (post-launch)
├── Content expansion (guides)
├── Comparison pages
└── Search Console data-driven additions
```
