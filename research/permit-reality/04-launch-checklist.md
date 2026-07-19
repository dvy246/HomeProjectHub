# Launch Checklist: Permit-Reality Content Pages
**Feature Slug: permit-reality**

This document serves as the launch checklist verifying the correct implementation and E-E-A-T alignment of Feature 3.

---

## 1. Feature Verification

- [x] **State-by-State Rules dataset**:
  - Implemented inside `src/components/calculators/PermitStateGuides.tsx` containing verified triggers and exemptions for CA, TX, FL, NY, and MT.
- [x] **PermitStateGuides React component**:
  - Allows selecting state and project type to see specific rules.
  - Hides/displays English fallback notices for other locales.
- [x] **Master guide page**:
  - Created `/planning/permit-guides/index.astro`.
  - Added Breadcrumb, WebApp, and FAQ schemas.
- [x] **YMYL & Legal Safeguards**:
  - Inserted prominent safety disclaimers explaining local municipal supremacy.
  - Cited and linked primary building code authorities.
- [x] **Cross-linking integration**:
  - Mapped related links for `permit-cost-calculator` and `permit-guides` in `relatedCalculators.ts`.
  - Added `<RelatedCalculators slug="..." />` calls in the footer.
