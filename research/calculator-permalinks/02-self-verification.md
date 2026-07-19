# Phase B Self-Verification: Calculator Result Permalinks
**Feature Slug: calculator-permalinks**

This document challenges the assumptions of Phase A to identify potential SEO penalties, code regression risks, and implementation bottlenecks.

---

### 1. Steelman the Null Hypothesis
* **The Argument**: Adding dynamic query parameters to standard calculators is not worth the effort because:
  1. Standard calculators are already served by highly polished, statically pre-rendered programmatic pages for popular sizes (e.g. 10x10 slab). These pages rank well on Google.
  2. Indexing arbitrary user parameters (e.g. `?length=10.235&width=8.45`) results in "parameter bloat." If crawled, these pages will be flagged by Google as duplicate or thin content, actively harming the domain's topical authority.
  3. Sharing links to standard calculations (like a basic paint calculation) has low organic sharing volume compared to full blueprints (which are already shareable in the visual designers).
* **The Refutation**: While arbitrary parameters should not be indexed, they are highly useful for direct sharing (copy/paste link) between users (homeowners sharing with contractors or spouses). We will prevent indexing bloat by enforcing a strict `noindex` policy on all parameterized URLs.

---

### 2. Source Quality Check
* **Claim**: Omni Calculator dynamically generates parameterized shareable links.
  * *Verification*: `[VERIFIED: Live site inspection]` Omni Calculator uses URL hashing and search parameter parameters (e.g., `?v=2`) to reload inputs during hydration.
* **Claim**: Calculator.net does not support query-parameter pre-loading.
  * *Verification*: `[VERIFIED: Live site inspection]` Visiting `calculator.net` with query parameters does not pre-fill form fields, and their share button only copies the base page URL.

---

### 3. Fabrication Check
* No search volume statistics or direct CTR numbers were invented. All search query patterns were verified using live autocomplete and related search queries from Google and Reddit search behavior.

---

### 4. Policy / YMYL Check
* **The Risk**: Sharing a specific calculation URL with incorrect dimensions or custom parameters could lead to under-ordering materials.
* **Mitigation**: Every shared calculation page will carry the standard warning widget linking to the site disclaimer. Because arbitrary parameters are served client-side and `noindex` is applied, there is no threat to Google Quality Rater trust policies.

---

### 5. Scope Check
* **Feasibility**: We will implement this for the top 5 most frequently used standard calculators:
  1. `ConcreteSlabCalc.tsx` (Concrete)
  2. `RoofShingleCalc.tsx` (Roofing)
  3. `DrywallCalc.tsx` (Drywall)
  4. `PaintCalc.tsx` (Paint)
  5. `TileCalc.tsx` (Tile)
* It uses the existing `src/lib/urlState.ts` utilities. No backend or database is added, fully complying with standard client-side boundaries.

---

### 6. Regression Check
* **Hydration Mismatch Risk**: Reading URL search parameters during initial rendering causes hydration mismatches because the server (Astro SSG) pre-renders default values, while the client hydrates with URL-specified values.
* **Prevention Strategy**: Initialize state with static default values first, and read search parameters inside a `useEffect` hook on mount (or use a loading/initialized state guard). This ensures that the server-rendered HTML and client-rendered HTML match exactly on the first paint, eliminating any hydration mismatch console warnings.

---

### Verdict: GO WITH CHANGES
* **Revised Scope**: 
  * Only serialize inputs for the top 5 core calculators listed above.
  * Apply `noindex, follow` tags to the page header dynamically (in Astro) if query parameters are present in the request.
  * Initialize inputs in `useEffect` on the client to avoid hydration errors.
