# Phase A Research: Permit-Reality Content Pages
**Feature Slug: permit-reality**

This document gathers official municipal code sources, structural permit triggers, and SEO mapping for building permit requirements across CA, TX, FL, NY, and MT.

---

### A.1 — Demand & Intent Verification

#### Search Intent & Query Patterns
Homeowners often search for exact permit exemptions to avoid municipal fees and inspect timelines before starting a project:
1. `do i need a permit for a deck in california` `[VERIFIED: Google Autocomplete]`
2. `do you need a permit to pour a concrete patio in texas` `[VERIFIED: Google Autocomplete]`
3. `florida reroof permit requirements` `[VERIFIED: Google SERP]`
4. `building permit exemptions new york state` `[VERIFIED: Google SERP]`
5. `montana deck building permit height rules` `[VERIFIED: Google Autocomplete]`
6. `what projects don't require a permit` `[VERIFIED: Reddit r/DIY]`

#### Search Engine Result Page (SERP) Gap
* **The Problem**: Official city/state websites present this information in dry, hard-to-read PDFs or nested building codes. Blog posts are often thin listicles containing outdated generalities.
* **The Opportunity**: Create a single, premium interactive hub page at `/planning/permit-guides/` that groups these regulations in a searchable/filterable table, backed by deep-dive breakdowns of the 5 target states with citations.

---

### A.2 — Competitive Audit

1. **PermitCalculator.com / City Building Sites**  
   * **What they do well**: Give raw code citations.
   * **What they do poorly**: Hard to navigate, no project-specific comparisons (e.g. deck vs concrete).
   * **Our Advantage**: Interactive project selector mapping state regulations dynamically.
2. **Reddit r/DIY & Contractor Forums**  
   * **What they do well**: Real-world perspective on enforcement.
   * **What they do poorly**: Lack citation reliability or authority.
   * **Our Advantage**: High E-E-A-T citations to official building divisions.

---

### A.3 — Vetted State-by-State Rules & Primary Sources

#### 1. California (CA)
* **Primary Source**: California Building Code (CBC) Title 24, Section 105.2.
* **Deck Triggers**: Permit required if deck is attached to a dwelling, OR deck floor is >30" above grade, OR total deck area is >200 sq ft.
* **Concrete Patio Triggers**: Exempt if on-grade flatwork, <30" above grade, and not supporting any structural posts/structures.
* **Roof Triggers**: Building permit required for all reroofing to check ventilation and sheathing structural integrity.

#### 2. Texas (TX)
* **Primary Source**: Texas Local Government Code, Section 214.901 (cities adopt IRC/IBC).
* **Deck Triggers**: Permit required if >30" above grade, or attached toDwelling, or >200 sq ft.
* **Concrete Patio**: Exempt if on-grade flatwork, not supporting structures, and not violating impervious cover zoning regulations.
* **Roof Triggers**: Permit required for replacement in major cities (Houston, Dallas, Austin) to verify sheathing and ice/water shields.

#### 3. Florida (FL)
* **Primary Source**: Florida Building Code (FBC), Section 105.2.
* **Deck Triggers**: Permit strictly required for all attached decks and almost all detached decks due to wind-load engineering requirements (FBC Chapter 16).
* **Concrete Patio**: Often exempt if <30" above grade, but zoning review is required to verify boundary setbacks.
* **Roof Triggers**: Product approval forms and permits strictly required for all reroofing.

#### 4. New York (NY)
* **Primary Source**: NYS Uniform Fire Prevention and Building Code, 19 NYCRR Part 1203.
* **Deck Triggers**: Permit required if attached to dwelling, or >30" above grade, or >200 sq ft.
* **Concrete Patio**: Exempt if less than 30" off grade, no roof or load-bearing support.
* **Roof Triggers**: Permit required if replacing structural rafters or laying a third layer of shingles.

#### 5. Montana (MT)
* **Primary Source**: Montana Administrative Rules (ARM) 24.301.154.
* **Deck Triggers**: Follows standard IRC exemptions (exempt if detached, <30" above grade, <200 sq ft, and not serving the exit door).
* **Concrete Patio**: Exempt if on-grade flatwork.
* **Roof Triggers**: Exempt from state permits in minor jurisdictions, but major cities (Missoula, Billings) require permits.

---

### A.4 — Technical Feasibility Pass

* **i18n & Locales**: English-only content.
* **Format**: A master interactive page `/planning/permit-guides/index.astro`. It will leverage a React component `PermitStateGuides.tsx` that allows selecting a state or project type to see rules and disclaimers.
* **YMYL & Disclaimer Safeguards**: Carry high-visibility notices explaining that municipal codes override state guidelines and link to the primary sources.
