# Phase A Research: Cost-vs-Value Payback Integration
**Feature Slug: cost-vs-value**

This document establishes the source data, search intent, and technical architecture for integrating the remodeling Cost vs. Value (CVV) resale return on investment (ROI) metrics into HomePlanningHub calculators.

---

### A.1 — Demand & Intent Verification

#### Search Intent & Query Patterns
Homeowners and sellers planning renovations frequently search for the return on investment to justify the capital expense:
1. `deck addition cost vs value` `[VERIFIED: Google Autocomplete]`
2. `bathroom remodel resale value` `[VERIFIED: Google SERP]`
3. `remodeling roi by project type` `[VERIFIED: Reddit r/HomeImprovement]`
4. `is a new roof worth it for resale` `[VERIFIED: Quora]`
5. `composite vs wood deck roi` `[VERIFIED: Google SERP]`
6. `minor kitchen remodel payback percentage` `[VERIFIED: Google Autocomplete]`

#### Search Engine Result Page (SERP) Gap
* **The Problem**: Competitors (like Homewyse or Calculator.net) give raw installation estimates but provide no financial context or resale payback analysis. The user has to leave the calculator to search for resale ROI statistics on bank or real estate blogs.
* **The Opportunity**: Integrating cost-vs-value recoupment directly inside the calculator output solves this "decision abandonment" problem, keeping users on the page longer and providing a better E-E-A-T experience.

---

### A.2 — Competitive Audit

1. **Zonda / Cost vs. Value Report** (`costvsvalue.com`)  
   * **What they do well**: Annual industry standard, hyper-local PDF reports.
   * **What they do poorly**: Gated behind lead-capture forms, non-interactive PDF layout, no custom sizing/materials adjustments.
   * **Our Advantage**: Free, interactive, no email gated, adjusts dynamically based on the user's custom material choices.
2. **Zillow / Homelight / Bankrate**  
   * **What they do well**: High authority articles summarizing the data.
   * **What they do poorly**: Static text tables with no calculation capability.
   * **Our Advantage**: Real-time side-by-side ROI overlay inside the actual budgeting tool.

---

### A.3 — Data Source Audit

We will vend Zonda's national average resale recoupment percentages as static JSON data:
* **Storage Path**: `src/data/cost-vs-value.json`
* **Dataset mapping**:
  * `deck-wood`: 82.3%
  * `deck-composite`: 68.2%
  * `bathroom-midrange`: 71.0%
  * `kitchen-minor`: 85.7%
  * `roofing-asphalt`: 61.1%
  * `siding-vinyl`: 80.2%
  * `patio-concrete`: 67.2%
* **Citations & Disclaimers**: Cite "Zonda / Remodeling Magazine Cost vs. Value Report" with a link, and show the standard disclaimer that resale recoupment is highly dependent on local real estate market conditions, timing, and home starting valuation.

---

### A.4 — Technical Feasibility Pass

* **i18n & Locales**: English-only display since Zonda's data is strictly US-centric. Other locales will fall back to hiding the Cost vs Value panel.
* **Component Integration**: We will render a sub-card inside the calculator results dashboard for the matching calculators.
