# Phase B Self-Verification: Permit-Reality Content Pages
**Feature Slug: permit-reality**

This document challenges the assumptions of Phase A to verify code licensing, YMYL compliance, and page layout architecture.

---

### 1. Steelman the Null Hypothesis
* **The Argument**: Building permit regulations change at the town/county level, not just the state level. A state-level guide is too generic to be helpful and could mislead a homeowner in a strict municipality (like LA county vs rural CA).
* **The Refutation**: While local codes vary, state-level building standards (like California's Title 24 or Florida's FBC) establish the structural baseline that all municipal building departments must follow. We will make it explicitly clear in the UI that local codes override state baselines and provide a clear directory of what to ask your local building inspector.

---

### 2. Google Doorway Page Risk Audit
* **The Risk**: Creating 50 thin pages (like `/permit/montana`, `/permit/texas`) with nearly identical layouts will trigger Google's doorway pages spam filter, leading to domain demotion.
* **The Mitigation**: Instead of separate files, we will implement a single rich, interactive master page at `/planning/permit-guides/` that holds all state data in a single clean layout. This consolidates link equity, provides a comprehensive resource, and eliminates doorway page risk entirely.

---

### 3. Localization Safety
* **Exclusion**: The `/planning/permit-guides/` route will be English-only. If accessed in non-English locales, it will redirect to the English path or show an overlay explaining that building codes are US-centric.

---

### 4. Technical Feasibility
* We will define the state rules array inside a React component `PermitStateGuides.tsx` loaded at `/planning/permit-guides/index.astro`.
* This React island will let users filter by state (CA, TX, FL, NY, MT) and project type (Deck, Concrete, Roof) to show the rules, citations, and links to our calculators.
