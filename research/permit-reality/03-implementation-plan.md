# Implementation Plan: Permit-Reality Content Pages
**Feature Slug: permit-reality**

This plan outlines the files to be created and modified to implement Feature 3: Interactive Permit Master Guide.

---

## 1. Create React Component: PermitStateGuides.tsx
We will create `src/components/calculators/PermitStateGuides.tsx` which contains:
- Selected state state selector (`activeState`: "CA" | "TX" | "FL" | "NY" | "MT").
- Selected project type selector (`activeProject`: "deck" | "concrete" | "roof").
- Detailed rules text, primary source citation link, and a warning note for the selected combination.
- Standard disclaimers and outbound references.
- Link to the relevant calculator on HomePlanningHub.

---

## 2. Create Astro Route: src/pages/planning/permit-guides/index.astro
We will create a new route at `/planning/permit-guides/index.astro`:
- Page title: "Do You Need a Building Permit? State-by-State Rules & Triggers"
- Page description: "Check if your home improvement project requires a building permit. Vetted triggers and building code guidelines for California, Texas, Florida, New York, and Montana."
- Render the interactive `<PermitStateGuides client:load />` component.
- Build schema validation: BreadcrumbList (Home > Planning > Permit Guides), WebApplication schema, HowTo schema.
- Exclude from non-English locales or add canonical settings.

---

## 3. Navbar and Sitemap Configurations
- Add link to Permit Guides in `src/layouts/Layout.astro` header.
- Ensure the route `/planning/permit-guides/` is added to sitemaps and crawled weekly by robots.txt.
