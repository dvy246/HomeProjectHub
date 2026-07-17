## 2026-07-17T18:30:34Z
Conduct a comprehensive SEO and Google Indexability audit of the HomePlanningHub Astro.js codebase (located at `/Users/divyyadav/developer/HomeProjectHub`).
You must:
1. Initialize your workspace at `/Users/divyyadav/developer/HomeProjectHub/.agents/explorer_seo_readiness_audit` and write `progress.md` updates.
2. Verify trailing-slash canonical URLs on all static pages (e.g. calculators, SEO pages) against sitemap.xml or sitemap-index.xml. Check if there are mismatches or invalid URLs.
3. Check `public/robots.txt` or `robots.txt` configuration to ensure it does not block `/privacy/`, `/terms/`, or `/disclaimer/` routes.
4. Verify structured schema validation (Breadcrumbs, WebApp, MathSolver, FAQ, HowTo JSON-LD graphs) across all designers and pages. Examine `src/lib/schema.ts` and the pages utilizing them.
5. Assess E-E-A-T alignment (author credentials, methodology pages, outbound disclaimer citations) against Google's Search Quality Rater Guidelines. Check who guides are credited to and where disclaimers link.
6. Review AdSense compliance (robots.txt accessibility, absence of empty placeholder content, cookie disclosures).
7. Document all findings, highlighting specific strengths and weaknesses in a handoff report at `/Users/divyyadav/developer/HomeProjectHub/.agents/explorer_seo_readiness_audit/handoff.md`.
