# project_plan.md
# HomeProjectHub: Comprehensive Engineering & SEO Blueprint v3.0

## 1. Executive Vision
**HomeProjectHub** is a homeowner planning platform powered by calculators. 

The objective is to capture high-intent search traffic in a highly contested niche with entrenched incumbents (such as Inch Calculator, Calculator.net, and Omni Calculator). We will differentiate not by hoping they are weak, but by focusing on under-built user experience moats: the **Compare Materials** matrix and a robust **saved-rooms/projects retention system**. Retention is achieved initially through browser-based saved measurements, with potential monetization through SaaS or premium features treated as a contingent long-term option only after establishing a massive, loyal user base.

### Competitive Reality (verified)
This is a **contested niche with entrenched incumbents**, not a weak-competitor market. Verified against live data:
*   **Inch Calculator** ships ~92 construction calculators *alone* (carpentry, concrete, deck/patio, driveway, fence, flooring, landscaping, measurement, plumbing/HVAC, roofing, siding, walls) plus 13 other top-level categories — **300+ tools total**, each with named expert authors, reviewer bios, references, mobile apps, and embeddable widgets.
*   **Calculator.net**, **Omnicalculator**, and **Homewyse** compound the difficulty with years of domain authority.

**Displacement strategy (not "weak competitor" capture):**
1.  **Niche down first** — launch a *deep cluster* on 1–2 material families (e.g., concrete + roofing) rather than thin breadth across all 20 materials. Rank in a sub-niche before expanding (topical authority > scattered coverage).
2.  **Compare Materials matrix** — the under-built differentiator incumbents lack.
3.  **Saved-rooms retention** — per-user state that AI Overviews cannot replicate.
4.  **Backlink acquisition** — original cost-by-state data studies + embeddable widgets (see §12). On-page SEO alone will not dislodge incumbents with thousands of referring domains.

Treat this as a **~24-month AdSense grind** (compressible via niching down), not an 18-month sprint or a quick SaaS pivot.

---

## 2. Technical Architecture & Project Structure

### Stack Specifications
*   **Framework:** Astro.js (Static Site Generation, Zero-JS by default)
*   **Styling:** TailwindCSS (Purged for minimal CSS footprint)
*   **Hosting/CDN:** Cloudflare Pages
*   **State Management:** Browser `localStorage` (Phase 1-4) -> Cloudflare D1 + Auth (Phase 5+)
*   **Logic:** Vanilla TypeScript (Islands architecture for interactive components)

### Directory Structure
```text
/
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── CalculatorUI.tsx       # Shared input/output UI
│   │   ├── SaveRoom.tsx           # localStorage handler
│   │   ├── CompareMaterials.tsx   # Material comparison matrix
│   │   └── AdSlot.astro           # Lazy-loaded AdSense wrapper
│   ├── data/
    │   │   ├── materials.json         # Configurations for 15-25 deep-cluster calculators
│   │   └── comparisons.json       # Material vs Material datasets
│   ├── layouts/
│   │   └── Layout.astro           # Base HTML, SEO meta tags, Header, Footer
│   ├── lib/
│   │   ├── geometry.ts            # Core math: area, volume, perimeter
│   │   ├── materialEngine.ts      # Applies waste factors, coverage rates
│   │   └── storage.ts             # localStorage CRUD operations
│   ├── pages/
│   │   ├── index.astro
│   │   ├── calculators/
│   │   │   ├── [material].astro   # Dynamic pillar pages
│   │   │   └── [material]/[use-case].astro # Programmatic long-tail pages
│   │   └── compare/
│   │       └── [mat1]-vs-[mat2].astro
│   └── content/
│       └── guides/                # MDX files for expert supporting content
└── astro.config.mjs
```

---

## 3. The Formula Engine (Deep Dive)

To prevent premature abstraction and keep initial development speed high, the core formula engine will start simple. We will build the 3-layer pipeline *after* 3 to 4 calculators have been successfully shipped and stabilized.

### Layer 1: Geometry Engine (`geometry.ts`)
Handles raw spatial dimensions. No material logic exists here.
*   `calculateArea(length, width)`
*   `calculateVolume(area, depth)`
*   `subtractOpenings(totalArea, doors[], windows[])` (Standard door = 21 sq ft, Standard window = 12 sq ft)
*   `convertUnits(value, fromUnit, toUnit)` (e.g., inches to feet, sq ft to cubic yards)

### Layer 2: Material Engine (`materialEngine.ts`)
Applies material-specific rules to the geometric output.
*   `applyWasteFactor(volume, percentage)` (e.g., +10% for tile cuts)
*   `calculateCoverage(area, coverageRate)` (e.g., 1 gallon of paint covers 350 sq ft)
*   `convertToPackaging(totalAmount, unitPerPackage)` (e.g., cubic yards to 60lb bags)

### Layer 3: Material Configurations (`materials.json`)
Every calculator is just a JSON object fed into the engine.
```json
{
  "slug": "tile",
  "name": "Tile Calculator",
  "geometryType": "area",
  "defaultWasteFactor": 0.10,
  "units": ["sq_ft", "sq_m"],
  "packagingOptions": [
    {"name": "Boxes", "unitPerPackage": 10.5, "unitType": "sq_ft"}
  ],
  "useCases": ["bathroom-floor", "shower-walls", "herringbone-pattern"]
}
```

---

## 4. Data Models & `localStorage` Schema

For Phase 1, we will de-over-engineer the storage model and ship a simple `localStorage` JSON structure. We will not pay early migration/design costs to mirror a relational DB layout; we will refactor to a relational schema only at Phase 5 once product-market fit and real user demand are proven.

### Save State Schema (Version 1.0)
```json
{
  "version": "1.0",
  "homes": [
    {
      "id": "uuid-123",
      "name": "Primary Residence",
      "rooms": [
        {
          "id": "uuid-456",
          "name": "Master Bathroom",
          "length": 12,
          "width": 10,
          "height": 8,
          "openings": [
            {"type": "door", "area": 21},
            {"type": "window", "area": 12}
          ]
        }
      ]
    }
  ]
}
```
**Rule:** Calculators must check for this schema on load. If a saved room matches the required geometry of the calculator, an "Apply to [Room Name]" button must appear.

---

## 5. SEO Architecture & URL Strategy

### URL Hierarchy
*   **Pillar:** `/calculators/[material]/` (e.g., `/calculators/concrete/`)
*   **Long-tail:** `/calculators/[material]/[use-case]/` (e.g., `/calculators/concrete/shed-slab/`)
*   **Comparison:** `/compare/[mat1]-vs-[mat2]/` (e.g., `/compare/concrete-vs-pavers/`)

### Template-Assisted Expert Content Requirements
No page will be published as just a calculator widget. Every page must render the following sections:
1.  **H1 & Intro:** 50-word unique introduction.
2.  **Interactive Calculator:** The primary utility.
3.  **"How to Calculate [Material]"**: Step-by-step text explanation of the formula (E-E-A-T signal).
4.  **Example Calculation:** A worked example (e.g., "If your patio is 10x10 ft at 4 inches deep...").
5.  **Common Mistakes:** 3 bullet points (e.g., "Forgetting to account for soil compaction").
6.  **FAQ Section:** 3-5 questions sourced from "People Also Ask" (Schema.org `FAQPage`).
7.  **Internal Links:** Links to 3 related calculators/comparisons.

### Technical SEO Rules
*   **Canonical Tags:** Self-referencing canonicals on all pages.
*   **Sitemaps:** Auto-generated XML sitemaps split into `/sitemap-calculators.xml` and `/sitemap-compare.xml`.
*   **Schema.org:** Implement `MathSolver` and `FAQPage` structured data.
*   **Anti-Spam Capping:** Long-tail `[material]/[use-case]` pages will only be generated for genuinely distinct use-cases that require unique calculation logic (e.g., herringbone tile repeats vs standard square tiles) — no combinatorial/templated spam pages. Depth and utility beat programmatic bulk.

---

## 5b. AI Overviews (SGE) Mitigation Strategy
Google's Search Generative Experience (SGE) / AI Overviews will inevitably erode CTR on simple informational queries (e.g., "how to calculate concrete volume"). To build a resilient moat:
1.  **Core Value is Interactive & Saved State:** The explainer text satisfies search engines, but our product moat is the interactive calculator and the saved room/project configuration. AI cannot replicate per-user state, project lists, and live comparisons.
2.  **Visual Comparisons:** The Compare Materials matrix is highly interactive and difficult for AI Overviews to scrape and present cleanly in a standard text/table response.

---

## 6. Core Web Vitals & Performance Checklist

To guarantee Lighthouse 100 and maximum AdSense viewability without speed loss:

1.  **Image Optimization:** Use `<Image />` from `astro:assets` for all images. Serve WebP/AVIF formats.
2.  **Font Loading:** Self-host fonts using `font-display: swap`. Preload critical font files.
3.  **CSS:** Purge unused Tailwind classes. Inline critical CSS in the `<head>`.
4.  **JavaScript:** Ship zero JS by default. Calculator components load as Astro Islands (`client:visible`) only when the user scrolls to them.
5.  **AdSense Lazy Loading:** Do not load AdSense scripts in the `<head>`.
    *   Implement Intersection Observer: Load the AdSense script only when the ad slot is 200px from the viewport.
    *   Use `data-full-width-responsive="true"` to prevent layout shift (CLS).

---

## 7. MVP Calculator Launch List (Deep Cluster: 15-25 Tools)

Revised from the original "20-30 scattered tools." Against ~92 construction tools at the top incumbent, *scattered breadth loses* — it neither signals topical authority nor differentiates. Instead, launch a **deep cluster** within 1-2 material families (concrete + roofing), with full 7-section content depth on every page. Topical depth in a sub-niche ranks faster than thin coverage across all materials. Expand to a new material family only after the first cluster ranks.

**Cluster 1 — Concrete (deep, ~15 tools):**
1. Concrete Slab (Rectangle) — Volume, Bags, Cubic Yards
2. Concrete Slab (Circle)
3. Concrete Footing / Trench
4. Concrete Column / Pier
5. Concrete Wall
6. Concrete Steps
7. Concrete Curb & Gutter
8. Concrete Mix Ratio
9. Concrete Block Fill
10. Rebar Material (length/count)
11. Rebar Weight & Size
12. Concrete Weight
13. Concrete Bags (50/60/80-lb) Coverage
14. Concrete Driveway (use-case page)
15. Concrete Shed Slab (use-case page)

**Cluster 2 — Roofing (deep, ~6 tools):**
16. Roofing Shingle Bundles + Underlayment + Waste
17. Metal Roofing Material
18. Roof Plywood / Sheathing
19. Roof Pitch Calculator
20. Ice & Water Shield
21. Roof Snow Load

*All 15-25 pages ship with the full 7-section template (§5). No thin pages — Helpful Content System compliance is non-negotiable.*

---

## 8. The "Compare Materials" Feature (Milestone 4)

This is the key differentiator from generic calculator sites.

### Workflow
1. User inputs a project dimension (e.g., 500 sq ft patio).
2. User selects "Compare Materials".
3. System generates a comparison matrix:

| Material | Volume Needed | Durability | Maintenance | Difficulty | Lifespan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Concrete** | 6.17 cu yds | High | Low | Hard (Pro) | 30-50 yrs |
| **Pavers** | 525 sq ft | High | Medium | Medium (DIY) | 25-50 yrs |
| **Gravel** | 6.17 cu yds | Medium | High | Easy (DIY) | Indefinite |

*Note: No prices are estimated. We educate on durability and maintenance.*

---

## 9. Monetization & Ad Placement Rules

**AdSense (Phase 1) - The 18-Month Reality:**
AdSense is the primary and only reliable revenue source for the first 18+ months.
*   **RPM Math:** Home improvement / construction calculators typically earn **$5 - $15 RPM** (per 1,000 pageviews) depending on traffic quality (US vs international).
*   **Revenue Estimates:**
    *   10,000 monthly pageviews ≈ $50 - $150/mo.
    *   100,000 monthly pageviews ≈ $500 - $1,500/mo.
*   **Ad Placement Rules:** 
    *   Desktop: 1x Leaderboard below H1/intro. 1x In-content (300x250 or Responsive) after the calculation result. 1x Sidebar (sticky on scroll).
    *   Mobile: 1x In-content before calculator. 1x In-content after result.
    *   Rule: Ads must never push the calculator input fields below the fold on initial load.

**Affiliate (Phase 3+):**
*   **⚠️ Discontinued Program Alert:** Note that the Home Depot affiliate program was discontinued around 2018–2019. We will NOT target Home Depot.
*   **Approved Alternatives:** Switch affiliates to Lowe's (via Impact Radius) or Amazon Associates. Verify eligibility and API access before coding CTAs.
*   **Implementation:** Calculator results output exact material quantities. Below the output: *"Need materials? Get [X] packages from [Lowe's/Amazon]."*
*   **Link Structure:** Append user-calculated quantity to affiliate URL where possible, or link to category pages with clear CTAs.

---

## 10. Milestone-Based Execution Roadmap

### Milestone 1: Launch (0 - 10k visits; 12–18 months)
*Realistic expectations: It takes 12–18 months to build enough SERP authority to hit 10k visits/month against entrenched domains.*
*   [ ] 10-12 core calculators live.
*   [ ] 10-12 high-quality, high-depth expert resource pages indexed.
*   [ ] Lighthouse score 95+ on all pages.
*   [ ] Google Search Console verified, sitemaps submitted.

### Milestone 2: Growth & Retention (10k - 30k Monthly Visitors)
*   [ ] Implement simple `localStorage` JSON storage schema.
*   [ ] Deploy "Save this Room" feature on all active calculators.
*   [ ] Deploy "My Saved Rooms" dashboard page (reads from localStorage).

### Milestone 3: Monetization & Expansion (30k - 50k Monthly Visitors)
*   [ ] Launch "Compare Materials" matrix for top 10 use-cases (e.g., Patio, Driveway, Roofing).
*   [ ] Implement Lowe's / Amazon Associates Affiliate CTA logic in Output Engine.
*   [ ] Slowly expand calculators catalog based on Search Console query data (adding 2–3 new high-quality tools per month).

### Milestone 4: Advanced Features (50k+ Monthly Visitors)
*   [ ] Upgrade local storage to "Projects" (Grouping rooms).
*   [ ] Implement "Shopping List" generation from saved projects.
*   [ ] A/B test AdSense placements for viewability without CLS.

### Milestone 5: Contingent Premium Option (The SaaS Pivot Gate)
*⚠️ **Critical Gate:** No SaaS development (D1/Auth/Paywalls) will be built unless the site hits 50,000+ monthly active returning users and demonstrates explicit demand.*
*   [ ] [Contingent] Introduce Clerk/Auth.
*   [ ] [Contingent] Introduce Cloudflare D1 database.
*   [ ] [Contingent] Migration script: Move local storage to D1.
*   [ ] [Contingent] Paywall: Unlimited Projects, PDF Shopping Lists, Cross-device Sync ($29/yr).

---

## 11. The Feature Filter (Guardrails)

Any feature proposed for Milestone 2+ must pass this checklist. It must satisfy at least 3 conditions:

*   [ ] Generates SEO pages.
*   [ ] Solves a recurring workflow.
*   [ ] Improves retention (Return visits).
*   [ ] Creates a moat (Switching costs).
*   [ ] Enables monetization.
*   [ ] Can be implemented without expensive APIs.

*Example: "Contractor Lead Generation" fails (No moat, requires expensive API, degrades retention via spam).*
*Example: "Compare Materials" passes (Generates SEO pages, improves retention, creates moat, no APIs needed).*