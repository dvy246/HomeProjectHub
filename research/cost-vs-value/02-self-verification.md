# Phase B Self-Verification: Cost-vs-Value Payback Integration
**Feature Slug: cost-vs-value**

This document challenges the assumptions of Phase A to verify licensing, i18n localization safety, and project lifecycle updates.

---

### 1. Steelman the Null Hypothesis
* **The Argument**: Adding Cost vs. Value ROI widgets is unnecessary because:
  1. Financial ROI numbers are highly localized. A deck in California may recoup 100% of its cost, while a deck in a cold northern state may recoup less than 50%. Giving a single national average of 82.3% is misleading and violates YMYL safety principles.
  2. The data shifts every year. If the database is hardcoded, it will drift and become outdated.
* **The Refutation**: While local ROI varies, providing a vetted national benchmark from a trusted industry source (Zonda Media) is vastly superior to leaving the user with zero guidance. To ensure YMYL compliance, we will add an explicit notice explaining this variation and include a prominent link to Zonda's regional estimator page.

---

### 2. Trademark & Legal Check
* **The Risk**: "Cost vs. Value" is a registered trademark of Zonda Media. Hardcoding their report results could raise licensing concerns.
* **Mitigation**: We must explicitly credit Zonda Media and include the trademark notice: *"Cost vs. Value is a registered trademark of Zonda Media. Figures represent national midrange averages from the annual Cost vs. Value report."*

---

### 3. Localization (i18n) Strategy
* **The Risk**: Displaying US-centric resale data on localized German or Polish pages feels disjointed and confusing.
* **Mitigation**: The widget will verify the active language using the `locale` from the `useI18n` hook. If `locale !== "en"`, the widget will return `null` and remain hidden.

---

### 4. Regression & Layout Check
* The widget will render below the materials list or cost estimates. We must ensure it fits within the side-by-side design grids without breaking mobile layout bounds (simulating 375px widths).
* We will use a standard responsive flexbox or card grid layout with appropriate padding.
