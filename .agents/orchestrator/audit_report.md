# HomePlanningHub: Comprehensive Multi-Agent Research Audit Report

**Date:** July 17, 2026  
**Auditors:** Project Orchestrator, Competitor Feature Researcher, SEO & AdSense Consultant, UX & Layout Auditor  
**Workspace:** `/Users/divyyadav/developer/HomeProjectHub`

---

## 1. Executive Summary

This audit delivers a comprehensive evaluation of **HomePlanningHub**'s current codebase, user experience, search engine optimization (SEO) posture, and future monetization readiness. 

While the platform's Astro-based static site generation (SSG) shell produces exceptional load performance and perfect Core Web Vitals (representing a significant competitive ranking advantage over legacy competitors like Omni Calculator), the site currently suffers from several critical UI, crawlability, and functional gaps. 

By resolving multilingual routing 404s, correcting robots.txt compliance blocks, patching canonical trailing slash bugs, and addressing mobile stacking friction, we can establish an unbeatable SEO and product moat.

---

## 2. Competitor & Feature Gap Matrix (R1)

We audited HomePlanningHub against the top market incumbents: **Omni Calculator**, **Inch Calculator**, **Calculator.net**, and **Homewyse**.

| Competitor Feature | Omni Calculator | Inch Calculator | Calculator.net | Homewyse | HomePlanningHub (Current) | Gaps & Exploits |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Workspace Persistence** | ❌ Stateless | ❌ Stateless | ❌ Stateless | ❌ Stateless | **✅ Persistent Workspace** | **Exploit:** Leverage localStorage to keep user sizes and material lists persistent across calculators. |
| **Dynamic Unit Toggling** | ✅ Live Imperial/Metric toggles per field | ✅ Imperial/Metric toggles | ✅ Simple selectors | ❌ Fixed Imperial | ⚠️ English-only standard; interactive designers hardcoded to Imperial | **Gap:** Incumbents rank globally by supporting metric units. Our interactive designers are hardcoded to feet/inches. |
| **Shareable URL State** | ✅ Full query param string | ✅ URL parameter parsing | ✅ Simple permalinks | ❌ Multi-screen wizard | ⚠️ Spotty (only compare matrix & budget binder support URL params) | **Gap:** Users cannot share custom calculations (e.g. deck design, stair cut plans) via copy-pasting the URL. |
| **Embeddable Widgets** | ✅ High-performance iframe snippets | ✅ Copy-paste widget scripts | ❌ Direct link only | ❌ Opaque portals | ⚠️ /embed/ routes exist but lack UI widgets or discovery features | **Gap:** Bloggers and DIY forums cannot easily embed our tools, missing out on massive backlink-building flywheels. |
| **Step-by-Step Formulas** | ✅ Interactive logic breakdowns | ✅ Deep text-based articles | ✅ Formula summaries | ❌ Opaque black box | **✅ Expandable Math Report Deck** | **Exploit:** Our ReportEngine provides high E-E-A-T transparency by showing detailed mathematical steps. |
| **Localized Cost Estimates** | ❌ None | ❌ Standard regional estimates | ⚠️ Simple pricing templates | ✅ ZIP-code labor & material multipliers | ⚠️ Mixed (Shed/Baluster hardcoded; Slab allows overrides) | **Gap:** Users want cost, not just volume. Incumbents either lack cost or hardcode cost constants. |

### Reconciliation of Strategic Conflict
Prior audits presented a direct conflict between the **Pre-Calculated Project Blueprint Library** (5k-10k pages) and the **Static Localized Cost & BOM Engine** (~200 pages).
- **Verdict**: Build the **Curated/Hybrid Blueprint Library**; do NOT build the **Localized Cost Engine**.
- **Rationale**: Material volumes and structural dimensions are physical constants that require **zero maintenance**. Local retail supply and contractor labor costs are highly volatile and require real-time APIs to remain accurate. Programmatic file-limit bounds are safely resolved by utilizing Astro's hybrid rendering.

---

## 3. SEO & AdSense Optimization Review (R2)

### Crawl Gaps & Indexation Issues
1. **Robots.txt Blockage of Compliance Pages**: `public/robots.txt` disallows `/privacy/`, `/terms/`, and `/disclaimer/`. Because AdSense reviewer bots must scan these pages to verify compliance (cookie policies, liability disclaimers), this blockage triggers immediate AdSense disapproval.
2. **Canonical Link Prop Passing Bug**: Calculator pages (e.g., `concrete/slab.astro`) define trailing-slash canonical URLs (e.g., `.../calculators/aluminum-weight/`) in their frontmatter but invoke the `<Layout>` component without passing the canonical parameter. The layout falls back to the browser-accessed path, creating canonical mismatch errors in Google Search Console if accessed without a trailing slash.

### High-CPC Keyword & Volume Search Opportunities

Tailoring content to transactional and calculative queries yields the highest ad bids:

| Keyword / Search Query | Est. Volume (US/mo) | Est. CPC Range | Search Intent | Target URL |
| :--- | :--- | :--- | :--- | :--- |
| **"concrete slab cost calculator"** | 90,000+ | $2.00 – $4.50 | Calculative / Transactional | `/calculators/concrete/slab/` |
| **"metal roof cost calculator"** | 22,000 | $4.00 – $9.00 | Transactional | `/calculators/roofing/metal/` |
| **"bathroom remodel cost estimator"** | 27,000 | $15.00 – $35.00 | Commercial / Transactional | `/calculators/renovation/bathroom/` |
| **"drywall sheet calculator"** | 45,000 | $1.80 – $3.50 | Calculative | `/calculators/drywall/` |
| **"stair stringer calculator"** | 135,000+ | $1.50 – $3.00 | Calculative / Informational | `/calculators/stair-stringer-designer/` |

### Ad Placement & Core Web Vitals (CWV) Guidelines
To prevent Cumulative Layout Shift (CLS) from asynchronously loaded ads:
- **Leaderboard (`ad-top-leaderboard`)**: Place below navigation header, above H1. Pre-allocate slot height using a CSS wrapper (`min-h-[90px] sm:min-h-[100px]`).
- **In-Content Mid (`ad-in-content-mid`)**: Place between the calculator output card and the guide text. Pre-allocate wrapper height (`min-h-[250px] sm:min-h-[280px]`).
- **Mobile Sticky Anchor**: Enable bottom mobile anchors but enforce a `pb-16` body padding to prevent overlapping nav or inputs.
- **Lazy Load Script**: Load the core AdSense script using an `IntersectionObserver` on the `.ad-container` class to protect initial page-load speed.

---

## 4. Current UX/UI Layout Weaknesses (R1)

The following design and functional flaws reduce user dwell time, scroll depth, and international engagement:

1. **Desktop Navigation Menu Overflow (1024px-1440px)**: The header links demand ~`1410px` of horizontal space. When viewed on standard laptops (starting at `1024px`), navigation items wrap to multiple lines and overlap search inputs.
2. **Mobile Nav Scroll Trap**: The mobile navigation menu extends past the viewport height when submenus expand. Lacking a `max-height` boundary and scroll indicators, scrolling dragging the background page rather than the menu itself, trapping the user.
3. **Mobile Visualizer-First Stacking Order**: Widescreen layouts position the SVG visualizer on the left and controls on the right. Mobile collapses this to a single column, stacking the SVG canvas *above* the controls. Users must scroll down to edit inputs, losing real-time visual updates.
4. **Client-Side Locale Leakage & Hydration Warnings**: React components are hydrated without passing the current server-resolved locale prop. This results in console warnings and mismatched languages (e.g. Spanish text wrapped in an English layout).
5. **Print Layout Prose Pollution**: Printing worksheets or designs outputs 4–5 pages of text guides, FAQs, and ads due to missing `no-print` classes on prose containers.
6. **SVG Visualizer Loop Crash on Extreme Inputs**: Visualizer rendering loops (e.g., drawing rebar grids in `ConcreteSlabDesigner.tsx`) calculate scaling sizes. Large inputs (e.g., 100,000 ft) shrink the scaling factor to zero, forcing the drawing loops to iterate millions of times, freezing the client browser.
