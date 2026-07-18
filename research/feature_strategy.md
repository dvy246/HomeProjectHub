# HomePlanningHub: Feature Strategy Report

Based on a deep analysis of the existing Astro/React architecture, combined with market research into what professionals and homeowners are asking for on Reddit and Google, here are the 3 highest-leverage differentiating features to build next.

All features strictly adhere to the technical constraints: **Astro SSG + client-side React + localStorage (No Server DB).**

---

## Feature 1: The "Anti-Homewyse" Transparent Bid Builder

**Feature Name:** Transparent Contractor Bid & DIY Estimate Builder

### Target Queries
1. homewyse alternative
2. local renovation cost spreadsheet
3. customizable contractor quote template
4. true cost of bathroom remodel
5. interactive remodeling budget tracker
6. adjustable material cost calculator
7. accurate home addition estimator
8. remodeling labor rates by zip code alternative
9. transparent construction cost breakdown
10. remodeling project tracker app free

### Why Competitors Can't Replicate It
Sites like Homewyse and HomeAdvisor use opaque "black box" algorithms that frustrate users because they cannot see the math or adjust specific local material assumptions. Our tool is entirely transparent — functioning like a clean, interactive spreadsheet. We already have `material-prices.json` and the `CostEstimatorWidget`. We expose the exact formula, waste factors, and line items, allowing users to override any price point.

### Programmatic SEO Expansion
Generate hundreds of intent-based estimate pages: `/cost-estimator/[project-type]`. For example:
- `/cost-estimator/kitchen-remodel`
- `/cost-estimator/12x20-deck`
- `/cost-estimator/bathroom-remodel-keeping-same-layout`

Each page loads a React island pre-populated with average baseline data, ready for immediate user customization.

### Link-Bait Mechanism
Professionals and DIY bloggers consistently recommend "custom spreadsheets" over Homewyse on Reddit. Market this as "The open-source spreadsheet alternative to Homewyse." Contractors will link to it as a fair way to show clients how costs break down. Bloggers will share it because it doesn't hide the math.

### Retention Moat
When a user updates the baseline cost of `stud_2x4_8ft` or `labor_hourly_rate`, we save those overrides in `localStorage`. On their next visit, the tool automatically uses their localized, calibrated pricing. Their browser becomes their personalized pricing database.

### Technical Feasibility
100% feasible. Extend the existing `CostEstimatorWidget.tsx` and expand the typed `localStorage` wrapper in `storage.ts` to hold a `user_local_prices` object. The React island merges `material-prices.json` defaults with `localStorage` overrides.

### Revenue Impact
Direct injection of highly targeted affiliate links within line items (e.g., Lowe's affiliate link next to the 2x4 stud line item). High AdSense RPM due to high commercial intent.

---

## Feature 2: Climate-Aware Material Matchmaker

**Feature Name:** Climate-Driven Material Matchmaker & Comparison Engine

### Target Queries
1. best deck material for cold climate
2. best siding for coastal homes
3. sun fade resistant decking materials
4. flooring for high humidity areas
5. freeze thaw resistant hardscape materials
6. best countertops for outdoor kitchen in heat
7. composite vs wood deck in snow
8. mold resistant flooring for basement
9. what roofing is best for high winds and rain
10. material selector tool for home renovation climate

### Why Competitors Can't Replicate It
Competitors rely on static listicles. We have a robust, expert-vetted JSON database of 29 materials with 9 scoring dimensions and an existing `compareEngine.ts`. We can map specific climate challenges (e.g., "Freezing Winters" or "Coastal Salt Air") to our existing score weights — heavily weighting `waterResistance` and `durability` as appropriate.

### Programmatic SEO Expansion
Massively expand our existing 846 programmatic compare pages by adding climate modifiers:
- `/best/decking/for/freezing-weather`
- `/best/flooring/for/high-humidity`
- `/best/roofing/for/high-wind`
- `/compare/composite-vs-wood-deck/cold-climate`

Scales to 2,000+ pages using existing `getStaticPaths()` patterns.

### Link-Bait Mechanism
A dynamic, highly visual climate quiz that outputs a personalized, data-backed recommendation. Users copy a dynamically encoded URL (already supported via `encodeComparisonState()`) to share on Reddit or with their contractor: "The engine says use Luxury Vinyl instead of Laminate because of the humidity."

### Retention Moat
The shareable URL natively acts as a retention loop. Sharing with a partner or contractor brings a second user into the ecosystem, and the bookmarkability of the encoded URL ensures they return to exactly where they left off.

### Technical Feasibility
Highly feasible. Build a React island quiz interface that outputs to the existing `MaterialWise.tsx` component. Add a "Climate Profile" toggle that automatically adjusts the `ComparisonWeights` (e.g., `waterResistance`, `durability`) passed into `computeWeightedScore()`.

### Revenue Impact
Directly funnels high-intent, ready-to-buy users into Lowe's and Amazon affiliate links for the winning materials at the exact moment of purchase decision.

---

## Feature 3: DIY Risk & Sunk-Cost Analyzer

**Feature Name:** DIY vs. Pro Risk & ROI Analyzer (Expanded)

### Target Queries
1. should I diy my bathroom remodel
2. contractor versus diy cost calculator
3. how much do diy mistakes cost
4. renovation ROI calculator by project
5. hidden costs of diy renovation
6. is it worth it to hire a pro for flooring
7. diy concrete slab vs hiring out
8. cost of fixing diy plumbing mistakes
9. home improvement skill level assessment
10. contractor markup versus diy savings

### Why Competitors Can't Replicate It
Almost all calculators assume flawless DIY execution, making DIY always look cheaper. Our `diyVsProEngine.ts` is uniquely positioned because it already factors in skill-adjusted waste and rework. We can visualize this data to show the "breaking point" — the exact moment where a DIY project becomes more expensive than hiring a pro due to mistakes, tool rentals, and time.

### Programmatic SEO Expansion
Create pages per project type:
- `/diy-vs-pro/stair-stringer-cost-comparison`
- `/diy-vs-pro/bathroom-tile-floor`
- `/diy-vs-pro/deck-framing`
- `/diy-vs-pro/drywall-installation`

Each page uses specific material weights and difficulty metrics for that project type.

### Link-Bait Mechanism
High emotional resonance. Contractors will aggressively share this on social media to justify their quotes ("See? This is why you hire a pro!"). DIY bloggers will share it to help their audience decide which projects are safe to tackle. High virality potential in home improvement communities.

### Retention Moat
Users save a "DIY Skill Profile" in `localStorage` (e.g., Beginner in Plumbing, Intermediate in Carpentry). As they browse different project pages, their personalized skill profile automatically adjusts the waste and mistake factors on every calculator they view — creating a deeply personalized browsing experience that encourages exploration of more projects.

### Technical Feasibility
Fully supported by existing SSG + React architecture. Expand `diyVsProEngine.ts` to accept a granular skill profile from `localStorage` and output a "Risk Meter" SVG visualization in the React island.

### Revenue Impact
Bridges the gap between DIYers and professional services. Prime opportunity to monetize via "Find a Local Contractor" lead gen widget for users whose results show "High Risk" of DIY failure, alongside display ads.
