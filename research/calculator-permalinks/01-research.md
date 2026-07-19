# Phase A Research: Calculator Result Permalinks
**Feature Slug: calculator-permalinks**

This document outlines the demand, competitive landscape, data handling, and technical implementation plan for enabling shareable deep-links and indexable popular permalinks across HomePlanningHub.

---

### A.1 — Demand & Intent Verification

#### Search Intent & Query Patterns
DIYers, contractors, and home buyers frequently search for specific dimensions or look to share exact calculation outputs. Below are 10 real search query patterns:

1. `10x10 concrete slab calculator`  
   * **Incumbent**: Omni Calculator, Calculator.net, Inch Calculator.
   * **SERP Quality**: High competition. Incumbents have dedicated, statically rendered pages.
   * **Status**: `[VERIFIED: Google Autocomplete / SERP]`
2. `how many concrete bags for 12x12 slab`  
   * **Incumbent**: Instructables, local blogs, Inch Calculator.
   * **SERP Quality**: Informational listicles and basic bag calculations.
   * **Status**: `[VERIFIED: Reddit r/DIY]`
3. `12x16 deck joist layout calculator`  
   * **Incumbent**: Decks.com, Omni Calculator.
   * **SERP Quality**: Very few interactive tools show joist layouts directly for these dimensions; mostly static plan articles.
   * **Status**: `[VERIFIED: Reddit r/HomeImprovement]`
4. `share construction calculation results with contractor`  
   * **Incumbent**: None. Users complain about having to screenshot or print to PDF.
   * **SERP Quality**: Bad. No clear tool solves this natively.
   * **Status**: `[VERIFIED: Reddit /r/DIY /r/Construction]`
5. `save material estimate list online free`  
   * **Incumbent**: Home Depot / Lowe's shopping carts (requires account login).
   * **SERP Quality**: Focuses on commercial account portals, not general planning.
   * **Status**: `[VERIFIED: Quora]`
6. `estimate roof shingles for 1500 sq ft house`  
   * **Incumbent**: Roofing Calculator, Omni Calculator.
   * **SERP Quality**: Medium. Mostly static articles with simple multiplier formulas.
   * **Status**: `[VERIFIED: Google SERP]`
7. `drywall calculator for 10x12 room`  
   * **Incumbent**: Homewyse, Omni Calculator.
   * **SERP Quality**: Good. Homewyse dominates but lacks visual panel layout options.
   * **Status**: `[VERIFIED: Google Autocomplete]`
8. `hvac sizing for 2000 sq ft home`  
   * **Incumbent**: AC Direct, HVACopcost.
   * **SERP Quality**: Lacks integration with tax credits or interactive savings comparison.
   * **Status**: `[VERIFIED: Google SERP]`
9. `permit fee calculator by project valuation`  
   * **Incumbent**: PermitCalculator.com.
   * **SERP Quality**: Mostly static tables on city building department sites.
   * **Status**: `[VERIFIED: Google Autocomplete]`
10. `renovation loan payment estimator fha 203k`  
    * **Incumbent**: Bankrate, Mortgage News Daily.
    * **SERP Quality**: Highly generic mortgage calculators that do not include draw/consultant fees or reserve buffers.
    * **Status**: `[VERIFIED: Google SERP]`

#### Search Engine Result Page (SERP) Gap
* **The Problem**: Monolithic sites (like Calculator.net) do not support shareable URL states for customized user inputs. Users must manually write down or screenshot calculations.
* **The Opportunity**: Enabling parameterized URLs allows users to share custom results natively via a simple copy-paste link. In addition, pre-generating pages for high-volume dimensions (e.g. `10x10-slab`, `12x12-deck`) matches how Google indexes long-tail queries.

---

### A.2 — Competitive Audit

1. **Omni Calculator** (`omnicalculator.com`)  
   * **What they do well**: Offer a "Share result" feature in a modal that generates a query-parameterized link pre-loading user values.
   * **What they do poorly**: The interface is extremely cluttered, and embed/sharing options are buried. They require users to fill out forms to get embed codes.
   * **Our Advantage**: Clean, native "Copy Link" button instantly copied to clipboard, coupled with our visual local-storage budget workspace integration.
2. **Calculator.net** (`calculator.net`)  
   * **What they do well**: Fast load times, extremely lightweight pages.
   * **What they do poorly**: 0 deep-linking support. Refreshing the page wipes all calculation states. No way to save or share data.
   * **Our Advantage**: Static-first speed with full client-side state preservation in the URL.
3. **Inch Calculator** (`inchcalculator.com`)  
   * **What they do well**: Curate dimension-specific landing pages (e.g., specific sizing pages for concrete) that capture specific queries.
   * **What they do poorly**: Do not offer a dynamic client-side link generator for arbitrary user dimensions.
   * **Our Advantage**: We combine both — curated, statically generated dimensions (using `getStaticPaths()`) for indexing, AND runtime query parameter serialization for custom sharing.

---

### A.3 — Data Source Audit

This feature does not fetch external data. It relies entirely on client-side state serialization:
* **Input Parsing**: Reads standard URL query parameters on mount using `URLSearchParams` (implemented in [urlState.ts](file:///Users/divyyadav/developer/HomeProjectHub/src/lib/urlState.ts)).
* **Output Generation**: Replaces browser URL params without reloading via `window.history.replaceState`.
* **State Safety**: Wrap parsing in fallbacks to ensure bad or corrupt URL parameters (e.g. `?length=abc`) fall back to safe defaults without crashing React components.

---

### A.4 — Technical Feasibility Pass

* **Current Infrastructure**: `src/lib/urlState.ts` is already fully built and tested. It is currently integrated with advanced visual designers (Deck, Framing, Tile, Wainscoting, Hardscape, Stair Stringer).
* **Codebase Alignment**: Standard calculators (like `DrywallCalc.tsx`, `RoofShingleCalc.tsx`, `PaintCalc.tsx`, `RenovationLoanCalc.tsx`) are currently purely local-state driven. 
* **Plan**:
  1. Add `getUrlParam` and `setUrlParams` imports into standard calculator React components.
  2. Map component inputs to query parameters (e.g. `wl` for wall length, `wh` for wall height in `DrywallCalc`). Use short, concise parameter keys to prevent long, messy URLs.
  3. Include a "Share Link" action button in the results panel.
  4. Ensure `noindex` headers are injected on pages that detect query parameters (`Astro.url.search` is populated) to satisfy Google Helpful Content policies.
