# Competitor UX Audit & SEO Gap Analysis: Home Improvement Platforms

## 1. Competitor-by-Competitor UX Audit

### Calculator.net (Concrete Calculator)
*   **Input → Output:** Users input dimensions (length, width, thickness, quantity). Output is total cubic yards, cubic meters, and equivalent pre-mixed bags (e.g., 60lb, 80lb).
*   **Decision Abandonment:** Once the user knows they need 45 bags of concrete, the site stops. It fails to answer: "Is it cheaper to get this delivered in a ready-mix truck or buy bags?", "How much water do I need?", or "What kind of base do I need?"
*   **Missing 'Next Step' Content:** No local pricing widget, no truck vs. bag logistical comparison (unlike HomePlanningHub's BulkVsBaggedCalc), no links to buy.
*   **Saved State:** None.
*   **Affiliate Integration:** None. Monetized purely through standard AdSense (which causes CLS).

### Homewyse (Renovation Cost Estimator)
*   **Input → Output:** Users enter Zip Code, project size/type, and select 'Basic' to 'Premium' quality. Output is a low-to-high cost bracket for labor and materials.
*   **Decision Abandonment:** It gives a rigid price but doesn't explain *why* costs vary. It abandons the user by not breaking down the specific materials needed (the Bill of Materials) and hides the math in a "black box," frustrating users (as seen on Reddit).
*   **Missing 'Next Step' Content:** Fails to let users override specific material prices or labor rates to match quotes they actually received.
*   **Saved State:** None for free users.
*   **Affiliate Integration:** Focuses on lead gen (contractor matching) rather than retail material affiliate links.

### Omni Calculator (Decking Calculators)
*   **Input → Output:** Users input deck dimensions and board sizes. Output is the total number of decking boards and fasteners.
*   **Decision Abandonment:** Omni offers disparate calculators (e.g., Decking, Spindle Spacing, Floor Joist) but doesn't connect them. A user has to manually copy numbers between tools to plan a full deck. It also provides no guidance on material choice (e.g., composite vs. pressure-treated wood based on climate or TCO).
*   **Missing 'Next Step' Content:** No holistic blueprint generation (unlike HPH's SVG blueprints), no unified project workspace.
*   **Saved State:** Stateless. URL parameters exist but there is no overarching "Saved Room/Project" concept.
*   **Affiliate Integration:** No direct retailer integrations for purchasing the calculated boards.

### Bankrate (Renovation Cost)
*   **Input → Output:** Editorial content outlining average costs (e.g., $50k for a remodel) and explaining financing options (HELOCs, Personal Loans).
*   **Decision Abandonment:** Provides purely static, generalized averages with no interactive sizing tools to fit the user's specific dimensions or material grades.
*   **Missing 'Next Step' Content:** Lacks a dynamic budgeting tool where a user can toggle materials to see how it affects their loan requirement.
*   **Saved State:** None.
*   **Affiliate Integration:** Highly optimized for financial product affiliates (loans), but misses out on the actual construction material purchases.

### Houzz (Renovation Calculator & Real Cost Finder)
*   **Input → Output:** Provides cost ranges based on community data and specific project scopes.
*   **Decision Abandonment:** Acts more as a directory and inspiration board. The calculators are high-level and lead straight into professional contractor matchmaking. It abandons the DIYer who wants a granular material breakdown.
*   **Missing 'Next Step' Content:** No interactive, granular takeoffs or DIY material planners.
*   **Saved State:** Has saved "Ideabooks" for photos, but no saved mathematical state for interactive budget planning (like HPH's ScopeBinder).
*   **Affiliate Integration:** Monetized via Houzz Pro software subscriptions and marketplace sales, but the calculators themselves are funnels, not standalone utilities.

---

## 2. The 'Decision Abandonment' Matrix

| Stage | Goal | Calculator.net | Homewyse | Omni Calc | Houzz | HomePlanningHub |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Research** | Compare materials (e.g., wood vs composite) | ❌ | ❌ | ❌ | ✅ | **✅ (MaterialWise Compare)** |
| **2. Measure** | Calculate physical quantities / takeoffs | ✅ | ❌ | ✅ | ❌ | **✅ (Dynamic SVGs)** |
| **3. Plan** | Logistics (Truck vs Bags, Waste factor) | ❌ | ❌ | ❌ | ❌ | **✅ (Logistics/Waste Engine)** |
| **4. Budget** | Apply local/custom pricing & tax | ❌ | ⚠️ (Rigid) | ❌ | ⚠️ (Averages) | **✅ (CostEstimatorWidget)** |
| **5. Execute** | Save project, generate blueprint, buy | ❌ | ❌ | ❌ | ❌ | **✅ (localStorage + Affiliates)** |

---

## 3. Missed Long-Tail Traffic (Unserved Queries)

No competitor currently offers interactive, saved-state tools for these specific, high-intent queries:

1.  "composite vs wood deck long term cost calculator"
2.  "concrete delivery truck vs bags cost calculator"
3.  "bathroom remodel cost breakdown calculator keeping same layout"
4.  "tile layout visualizer and waste calculator"
5.  "deck building permit cost estimator by state"
6.  "stair stringer calculator with IRC code warnings"
7.  "diy vs contractor cost difference calculator for basement"
8.  "how much weight can my truck carry gravel calculator"
9.  "wainscoting panel layout calculator visualizer"
10. "closet shelving cut list and cost calculator"

---

## 4. The 'Returning User' Problem

**The Issue:** Competitor sites are "one-and-done." Users visit to get a single number, write it down on paper, and close the tab. Because the sites are stateless, there is zero incentive to return when planning the next phase of the project.

**The Differentiation:** By using `localStorage` to save "Rooms" and dimensions (like HPH's auto-save functionality), we create a persistent workspace. A user who calculates their basement drywall will return to HPH for their basement flooring because their room dimensions are already saved — creating a powerful retention loop.

---

## 5. Affiliate & Monetization Gaps

**Leaving Money on the Table:**
*   Competitors (like Omni and Calculator.net) output material quantities (e.g., "You need 120 studs") but fail to provide a "Buy Now" link to retailers like Lowe's or Home Depot.
*   They monetize purely through high-density programmatic ads, which degrade user experience (CLS issues).
*   **HPH Advantage:** By integrating direct affiliate URLs (via `affiliates.ts` for Lowe's and Amazon) directly into the Bill of Materials output, HPH captures high-intent purchasing traffic right at the moment of decision. Furthermore, by using lazy-loaded, fixed-height ad slots, HPH avoids the CLS penalties that plague competitors.
