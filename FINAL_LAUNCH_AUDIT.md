# FINAL PRE-LAUNCH QUALITY ASSURANCE AUDIT

**Project:** HomePlanningHub (homeplanninghub.com)  
**Audit Date:** July 4, 2026  
**Build:** 247 pages, 0 errors, 2.08s  
**Review Board:** Principal Architect, Sr Astro.js Engineer, QA Automation, Staff Frontend, UX Researcher, SEO Consultant, Accessibility Expert, Product Manager

---

## 1. Executive Summary

HomePlanningHub is a comprehensive home improvement calculator platform with 247 static pages across 6 locales, 60+ interactive calculators, maintenance planning tools, a renovation budget planner, and embeddable widgets.

**The application is structurally sound but has one P0 blocker and six P1 issues that must be resolved before production deployment.**

The P0 blocker — multiple `<title>` elements in the document `<head>` caused by SVG `<title>` tags — directly impacts search engine ranking and social sharing. Three React components will produce hydration mismatch warnings in every user's browser console. The site is missing keyboard accessibility for dropdown menus and has a critical screen reader gap on the calculators hub page.

With these issues fixed, the platform is ready for launch.

---

## 2. Overall Launch Score

**69 / 100**

| Category | Score | Notes |
|----------|-------|-------|
| Functionality | 85 | All calculators work, all routes resolve, zero broken links |
| Reliability | 70 | 3 hydration mismatches, 2 Date() SSR issues |
| UX | 80 | Clean, well-organized, natural discovery paths |
| Accessibility | 45 | Multiple WCAG failures (4.1.2, 2.1.1, 1.1.1, 1.3.1) |
| SEO | 75 | P0 title pollution, solid structured data on English pages |
| Performance | 88 | 718KB total JS/CSS, reasonable bundle splits |
| Product Completeness | 82 | Core features solid, some polish gaps |
| Competitiveness | 72 | Strong calculator depth, weaker UX than Omni/Inch Calculator |

---

## 3. Functional Testing Results

### ✅ PASS — All features functional

| Feature | Status | Notes |
|---------|--------|-------|
| Navigation (header) | ✅ | Desktop + mobile, locale-aware labels, dropdowns |
| Footer | ✅ | All links valid, locale-aware |
| Theme toggle | ✅ | Light/dark, persists to localStorage, no flash |
| Language switcher | ✅ | 6 locales, persists preference, hreflang links |
| Calculator inputs | ✅ | All 60+ calculators accept input, compute results |
| Unit conversions | ✅ | Imperial/metric toggles work |
| Input validation | ✅ | `min="0"`, `type="number"`, `inputMode="decimal"` |
| Maintenance Planner | ✅ | Task checklists, progress tracking, localStorage |
| Cost Estimator | ⚠️ | Works but has hydration mismatch (P1) |
| Maintenance Calendar | ⚠️ | Works but has hydration mismatch (P1) |
| Renovation budget planner | ✅ | CRUD plans, line items, localStorage |
| Saved measurements | ✅ | localStorage CRUD |
| Interactive House Explorer | ✅ | SVG click regions, aria-live updates |
| Material comparisons | ✅ | Side-by-side calculator tools |
| Project planner | ✅ | Create/save projects with calculator results |
| Embed widgets | ✅ | 31 iframe embed pages |
| 404 page | ✅ | Full layout, nav, footer, 28KB |
| 500 page | ✅ | Exists, has content |

### ❌ FAIL — Issues found

| Test Case | Result | Severity |
|-----------|--------|----------|
| Edge: empty calculator inputs | ⚠️ Shows 0/false results, no error state | P2 |
| Edge: negative values via JS | ⚠️ No client-side guard beyond `min="0"` | P2 |
| Edge: localStorage cleared mid-session | ✅ Graceful fallback to defaults | — |
| Edge: multiple tabs | ✅ Independent localStorage per tab | — |
| Console errors on load | ❌ 3 components throw hydration warnings | **P1** |

---

## 4. Edge Case Testing

| Scenario | Result | Notes |
|----------|--------|-------|
| Zero values in calculators | ⚠️ Returns 0 or NaN in some tools | Not all calculators handle 0 gracefully |
| Extremely large values (1e9) | ✅ Doesn't crash, returns large results | |
| Tiny values (0.001) | ✅ Works | |
| Metric ↔ Imperial switching | ✅ All calculators tested | |
| Disabled JavaScript | ✅ Static HTML renders (SSR), but calculators non-functional | Expected for an SPA-enhanced site |
| Mobile viewport (375px) | ✅ Responsive layout, hamburger nav | |
| Landscape mode | ✅ No layout breakage | |
| Screen zoom 200% | ✅ Content readable, no overflow | |
| Reduced motion enabled | ✅ `prefers-reduced-motion` respected | |
| VoiceOver/Screen reader | ❌ 64/70 SVGs on calculators hub not hidden | **P1** |
| Browser back button | ✅ Works correctly | |
| Copy/paste into inputs | ✅ Works | |

---

## 5. UX Review

### Strengths
- First-time homeowner can immediately understand the value prop (hero section + 3 clear CTAs)
- Calculator discovery is natural (search + category filter on hub page)
- Breadcrumbs on every content page
- Language switcher persists preference
- Theme toggle (dark mode) works without flash
- Skip-to-content link for keyboard users
- FAQ sections on all major pages

### Weaknesses
- **Homepage `h1` is "Build with Precision, Estimate with Confidence"** — a tagline, not a descriptive H1. Users scanning the page don't immediately know this is a calculator site. The H1 should include target keywords (e.g., "Free Home Improvement Calculators & Project Planning").
- **Calculator pages lack a "next steps" workflow** — After calculating, the user sees results but no guided next action (save, add to project, related calculator). This reduces engagement.
- **No progress indicator on multi-step forms** — The renovation budget planner creates a plan in one long form. Users don't know how many steps remain.
- **Embed page UX** — `/embed/concrete-slab/` renders a stripped-down calculator but has no context or "visit full site" link. The iframe has no `title` attribute. Users inside an iframe cannot navigate back to the main site.

---

## 6. Accessibility Review

### WCAG Violations Found

| # | WCAG SC | Issue | Pages Affected | Severity |
|---|---------|-------|----------------|----------|
| 1 | 4.1.2 | `aria-expanded` on desktop dropdowns never updates (always "false") | All | **P1** |
| 2 | 2.1.1 | Desktop dropdown menus lack Arrow/Escape keyboard navigation | All | **P1** |
| 3 | 1.1.1 | 64/70 decorative SVGs on calculators hub missing `aria-hidden` | Calculators hub | **P1** |
| 4 | 1.3.1 | Heading level skip: h1 → h3 (no h2 before "Slab Parameters") | All calculator pages | P2 |
| 5 | 1.3.1, 4.1.2 | Waste Factor range slider has no label association (no `id`, no `aria-label`) | Slab calculator | **P1** |
| 6 | 3.3.1 | `aria-invalid` hardcoded to "false", never dynamically set | All calculator forms | P2 |
| 7 | 3.3.1 | No error messages or `aria-describedby` for validation errors | All calculator forms | P2 |
| 8 | 1.3.1 | Two `<footer>` elements (one inside `<main>`) on homepage | Homepage | P3 |

### What's done well
- Skip-to-content link present and focus-visible styled
- All `<nav>` elements have descriptive `aria-label`
- Interactive SVGs have `tabindex`, `role`, and `aria-label`
- Mobile nav has Escape-to-close with focus return
- `prefers-reduced-motion` respected
- All calculator inputs have both `<label>` and `aria-label`
- FAQ uses semantic `<details>`/`<summary>`
- Schema includes `isAccessibleForFree`

---

## 7. SEO Review

### ✅ PASS

| Check | Status | Details |
|-------|--------|---------|
| Unique meta descriptions | ✅ | All 17 audited pages have unique descriptions |
| Canonical tags | ✅ | All pages, correct URLs |
| H1 tags | ✅ | Exactly one per page |
| Open Graph tags | ✅ | 10 tags per page, locale-aware `og:locale` |
| Twitter Cards | ✅ | `summary_large_image` on all pages |
| BreadcrumbList schema | ✅ | English pages have full BreadcrumbList |
| FAQPage schema | ✅ | On calculators hub, homepage, maintenance |
| MathSolver schema | ✅ | On calculator tool pages (MathSolver + HowTo) |
| HTML lang attribute | ✅ | Correct per locale |
| hreflang links | ✅ | 6 locales on all pages |
| robots.txt | ✅ | Present, disallows correct paths |
| Sitemap | ✅ | 105 URLs, no locale pages |
| Image alt text | ✅ | All meaningful SVGs have `aria-label` |

### ❌ FAIL

| # | Issue | Severity | Business Impact |
|---|-------|----------|-----------------|
| 1 | **23 pages with multiple `<title>` elements** — SVG `<title>` tags leak into document `<head>`. Homepage has 6 titles incl. "Driveway, Patio & Garden", "Roofing System" | **P0** | Google may pick wrong title for SERPs. If "Concrete Foundation & Slabs" becomes the title, CTR drops for branded search |
| 2 | **Polish privacy page has English title/H1/description** — `pl/privacy/` shows "Privacy Policy \| HomePlanningHub" (untranslated) | P1 | Poor UX for Polish users; negative SEO signal for Polish SERPs |
| 3 | **Non-English pages lack rich JSON-LD** — Only `Organization` + `ContactPoint`. Missing `BreadcrumbList`, `WebPage`, `FAQPage` | P1 | Non-English results get less rich SERP display (no breadcrumbs, no FAQ rich results) |
| 4 | **Guides, Disclaimer, 404 pages have minimal schema** — Only `Organization` + `ContactPoint` | P2 | Missed opportunity for enhanced SERP features |
| 5 | **`og:image:alt` hardcoded in English** — Same alt text on Spanish/German/Polish pages | P2 | Accessibility gap for social sharing on non-English pages |
| 6 | **No `x-default` hreflang tag** | P3 | Recommended per Google docs |

---

## 8. Performance Review

### Bundle Analysis

| Asset | Size | Notes |
|-------|------|-------|
| `client.B2InhVG0.js` | 184 KB | React framework + runtime |
| `Layout.CFFej3xm.css` | 67 KB | Tailwind-generated CSS |
| `InteractiveHouseExplorer.*.js` | 32 KB | Homepage interactive map |
| `ConcreteSlabCalc.*.js` | 25 KB | Largest calculator bundle |
| `maintenanceStorage.*.js` | 20 KB | Shared storage layer |
| `ProjectDashboard.*.js` | 16 KB | Project listing |
| `BudgetPlanView.*.js` | 16 KB | Budget plan viewer |
| Other calculator bundles | 9-11 KB each | 30+ individual calculator chunks |
| **Total JS** | **~530 KB** | Across 80 files |
| **Total CSS** | **67 KB** | Single CSS file |
| **Grand total** | **~718 KB** | |

### Recommendations

| Optimization | Effort | Impact | Notes |
|-------------|--------|--------|-------|
| Lazy-load non-critical React components | Low | Medium | `InteractiveHouseExplorer` (32KB) loads on every homepage visit. Lazy below-fold. |
| Preload critical calculator bundles | Low | Medium | `ConcreteSlabCalc` is the most-visited calculator — preload its chunk |
| Remove unused CSS | Medium | Low-Medium | 67KB Tailwind output likely has unused classes |
| Add `loading="lazy"` to iframe embeds | Low | Low | Embed pages reference no images, but iframes can be lazy |
| Consider streaming SSR for long pages | High | Low | SSG sites don't benefit |

### Core Web Vitals (estimated)

| Metric | Estimate | Verdict |
|--------|----------|---------|
| LCP | < 1.5s | Good (static HTML, no render-blocking JS) |
| INP | < 100ms | Good (minimal client JS on content pages) |
| CLS | < 0.05 | Good (no layout shifts, explicit dimensions) |

---

## 9. Competitor Comparison

| Feature | HomePlanningHub | Calculator.net | Inch Calculator | Omni Calculator | Homewyse |
|---------|----------------|----------------|-----------------|-----------------|----------|
| Calculator count | 60+ | 300+ | 250+ | 400+ | N/A (cost focus) |
| Calculator depth | High (visible formulas, examples, assumptions) | Medium (results only) | Medium (results only) | Medium (results only) | Low |
| Project planning | ✅ Full planner + budget | ❌ | ❌ | ❌ | ✅ Cost estimates |
| Maintenance tools | ✅ Checklists + calendar + cost estimator | ❌ | ❌ | ❌ | ❌ |
| Multilingual | ✅ 6 languages | ❌ | ❌ | ✅ ~20 languages | ❌ |
| Embed widgets | ✅ 31 embeddable calculators | ❌ | ❌ | ✅ "Embed" feature | ❌ |
| Interactive visuals | ✅ House explorer, 3D diagrams | ❌ | ❌ | ❌ | ❌ |
| Structured data | ✅ MathSolver + HowTo + FAQ | ❌ | ❌ | ✅ MathSolver | ❌ |
| No-sign-up | ✅ | ✅ | ✅ | ✅ | ❌ Requires account |
| Mobile experience | ✅ Responsive | ✅ Responsive | ✅ Responsive | ✅ Responsive | ⚠️ Desktop-focused |
| Dark mode | ✅ | ❌ | ❌ | ❌ | ❌ |

### Competitive Advantages
1. **Project planning integration** — No competitor ties calculator results to a project planning workflow
2. **Visible formulas** — Users can verify calculations, building trust (competitors hide math)
3. **Maintenance tools** — Unique seasonal checklists + cost estimator combo
4. **Multilingual out of the box** — 6 languages with no extra infrastructure
5. **Dark mode** — Differentiator vs all major competitors

### Competitive Disadvantages
1. **Fewer calculators** — 60 vs 300+ for Calculator.net. However, depth per calculator is higher (formulas, examples, assumptions, project integration).
2. **Brand recognition** — Zero at launch. SEO will be the primary acquisition channel.
3. **No mobile app** — Omni Calculator has a native app. However, the PWA shell (manifest + responsive) partially addresses this.

---

## 10. Bugs Found

| # | Page/Component | Bug | Severity | Reproduction |
|---|----------------|-----|----------|-------------|
| 1 | All pages (23 affected) | SVG `<title>` tags leak into document `<title>`. Results in 2-16 `<title>` elements per page | **P0** | Open any calculator tool page in devtools, inspect `<head>` |
| 2 | CostEstimator.tsx:24 | `localStorage` read during render causes hydration mismatch. SSR saves `null`, client reads real data | **P1** | Open `/maintenance/cost-estimator/`, check console for hydration warnings |
| 3 | MaintenanceCalendar.tsx:44 | `useState(() => getCompletedIds())` reads `localStorage` during SSR, produces different state on client | **P1** | Open `/maintenance/calendar/`, check console |
| 4 | Quiz.tsx:27 | `Math.random()` in `useState` initializer shuffles questions differently on SSR vs client | **P1** | Open `/quizzes/stone-weight/`, check console |
| 5 | Calculators hub | 64/70 decorative SVGs lack `aria-hidden="true"` | **P1** | Use VoiceOver on `/calculators/`, hear every icon path |
| 6 | All pages | Desktop dropdown `aria-expanded` always "false" (never dynamically updated) | **P1** | Inspect Calculators dropdown button, check `aria-expanded` when dropdown is open |
| 7 | All pages | Desktop dropdown menus lack Arrow/Escape keyboard navigation | **P1** | Tab to Calculators button, press Enter, try Arrow keys — no response |
| 8 | Calculator pages | Waste Factor range slider has no `id`, no `aria-label`, no label association | **P1** | Use VoiceOver on concrete slab calculator, tab to waste factor slider — no label announced |
| 9 | pl/privacy/ | English title/H1/description on Polish page | **P1** | Visit `/pl/privacy/` |
| 10 | Non-English locale pages | Missing `BreadcrumbList`, `WebPage`, `FAQPage` schema | **P1** | Check JSON-LD on `/es/calculators/` |
| 11 | Calculator pages | Heading skip: `h1` → `h3` on all calculator tool pages | P2 | Inspect heading outline on `/calculators/concrete/slab/` |
| 12 | Calculator forms | `aria-invalid` hardcoded to `"false"`, never dynamically set | P2 | Enter negative number in concrete slab calculator, check `aria-invalid` attribute |
| 13 | Calculator forms | No error messages via `aria-describedby` | P2 | Submit empty form, no error announcement |
| 14 | MaintenancePlanner.tsx:52 | `new Date()` during render may differ between SSR and client | P2 | Visit at month boundary (e.g., Mar 31 11:59pm server, Apr 1 client) |
| 15 | MaintenanceCalendar.tsx:41 | Same `new Date()` issue as above | P2 | Same as above |
| 16 | Homepage | Two `<footer>` elements (one inside `<main>`) | P3 | Inspect DOM — `<main>` contains a `<footer>` element |
| 17 | storage.ts:74 | Module-level side effect (`migrateOldRooms()` called at import time) | P3 | Import `storage.ts` — runs migration immediately |
| 18 | All pages | No `x-default` hreflang tag | P3 | Check `<head>` for `hreflang="x-default"` |

---

## 11. Missing High-Impact Features

Evaluated against criteria: organic traffic, user satisfaction, retention, moat, monetization.

### ✅ RECOMMENDED (meets criteria)

| # | Feature | Rationale | Effort | Impact |
|---|---------|-----------|--------|--------|
| 1 | **Cross-calculator comparison view** — "Compare concrete vs pavers" is a full page. Add an inline comparison toggle on individual calculator pages ("See how this compares to alternatives") | Increases page depth, internal linking, time on site | Low | Medium |
| 2 | **Calculator result permalink** — Shareable URL with query params (`?length=10&width=12`) | Enables sharing, bookmarking, backlinks, and SEO for specific calculations | Low | High |
| 3 | **Recent calculations widget** — Show last 5 calculator results with quick "re-calculate" | Improves retention, reduces friction for returning users | Low | Medium |

### ❌ REJECTED (does not meet criteria)

| Feature | Rejection Reason |
|---------|------------------|
| User accounts / login | No monetization model that requires accounts. Adds friction. |
| Native mobile app | Low ROI for initial launch. PWA is sufficient. |
| Community forums | High moderation cost, low SEO value for a calculator site. |
| Cost database (contractor pricing) | Rejected previously — YMYL risk, maintenance burden. |
| AR/3D visualization | High engineering cost, low user impact for calculator use case. |

---

## 12. P0 Issues (Launch Blocker)

### P0-1: Multiple `<title>` elements in `<head>`

**Evidence:** 23 pages have 2-16 `<title>` elements. Homepage: 6 titles. Spiral staircase calculator: 16 titles. Caused by SVG `<title>` tags inside React interactive components rendering alongside the document `<title>`.

**Why it matters:** Google's title selector algorithm may pick any `<title>` element from the `<head>`. If it selects "Driveway, Patio & Garden" instead of "HomePlanningHub — Professional-Grade Construction Calculators", the homepage loses its brand SERP presence. Calculator pages with 16 titles are at high risk of showing irrelevant snippets.

**Business impact:** Direct CTR reduction on organic search results. Could be 30-50% CTR loss on branded queries if Google picks the wrong title.

**Fix:** Remove `<title>` from SVG elements. Replace with `aria-label` on the SVG root or `<span class="sr-only">` for accessible text. SVG `<title>` is only needed for complex data visualizations where screen reader users need element-specific descriptions — not for decorative or simple icon SVGs.

---

## 13. P1 Issues (Must Fix Before Launch)

### P1-1: Hydration mismatch — CostEstimator.tsx

**File:** `src/components/maintenance/CostEstimator.tsx:24`  
**Evidence:** `loadSaved()` reads `localStorage` at module/component level (not inside `useEffect`). SSR returns `null`, client returns saved data.  
**Fix:** Initialize state with defaults, move localStorage read into `useEffect`.

### P1-2: Hydration mismatch — MaintenanceCalendar.tsx

**File:** `src/components/maintenance/MaintenanceCalendar.tsx:44`  
**Evidence:** `useState<Set<string>>(getCompletedIds)` calls `getCompletedIds()` which reads `localStorage`. SSR returns `Set()`, client returns saved tasks.  
**Fix:** Initialize with `new Set()`, populate in `useEffect`.

### P1-3: Hydration mismatch — Quiz.tsx

**File:** `src/components/Quiz.tsx:27`  
**Evidence:** `useState(() => shuffleArray(questions))` runs `Math.random()` during SSR and again on client, producing different question order.  
**Fix:** Initialize with original order, shuffle in `useEffect`.

### P1-4: Decorative SVGs missing `aria-hidden`

**Pages:** All pages, worst on calculators hub (64/70 SVGs)  
**Evidence:** All category icons, chevrons, decorative shapes on the calculators hub and calculator tool pages lack `aria-hidden="true"`. Screen readers announce every SVG path.  
**Fix:** Add `aria-hidden="true"` to all purely decorative SVGs.

### P1-5: Desktop dropdown keyboard accessibility

**Pages:** All pages  
**Evidence:** `aria-expanded` never updates beyond "false". No Arrow key or Escape key handling for dropdown menus.  
**Fix:** Add JavaScript to toggle `aria-expanded` on mouseenter/focusin/mouseleave/focusout. Add ArrowDown/ArrowUp/Escape key handlers following WAI-ARIA Menu pattern.

### P1-6: Waste Factor range slider missing label

**Pages:** All calculator pages with waste factor input  
**Evidence:** The `<input type="range">` for waste factor has no `id`, no `aria-label`, no `aria-labelledby`, and no `<label for="">` association. The adjacent text "Waste Factor: 10%" is not programmatically associated.  
**Fix:** Add `id` to the range input and associate with a `<label for="">`, or add `aria-label="Waste Factor percentage"`.

---

## 14. P2 Issues (Fix After Launch)

| # | Issue | Recommended Fix |
|---|-------|-----------------|
| P2-1 | Heading skip (h1→h3) on calculator pages | Promote "Slab Parameters" / input section heading to `h2` |
| P2-2 | `aria-invalid` never dynamically set | Add validation logic that sets `aria-invalid="true"` on error |
| P2-3 | No error messages / `aria-describedby` | Add error message elements with `id` and `aria-describedby` on inputs |
| P2-4 | `new Date()` during render in MaintenancePlanner + Calendar | Move `new Date()` into `useEffect` |
| P2-5 | Non-English pages lack rich JSON-LD | Add `getBreadcrumbSchema()`, `getWebPageSchema()` to locale route template |
| P2-6 | Polish privacy page English | Translate or keep English (legal pages often stay in original language) |
| P2-7 | `og:image:alt` hardcoded in English | Pass locale-specific alt text via `tr('meta.og_image_alt')` |

---

## 15. P3 Issues (Nice to Have)

| # | Issue | Notes |
|---|-------|-------|
| P3-1 | Homepage has two `<footer>` elements | One is a content section misusing `<footer>`. Change to `<section>`. |
| P3-2 | Module-level side effect in `storage.ts` | Wrap `migrateOldRooms()` call in a function that runs on first access |
| P3-3 | No `x-default` hreflang tag | Add `<link rel="alternate" hreflang="x-default" href="https://homeplanninghub.com/">` |
| P3-4 | Guides, Disclaimer, 404 have minimal schema | Add `WebPage` + `BreadcrumbList` at minimum |

---

## 16. Final Recommendation

## ⚠️ DEPLOY AFTER FIXING P0/P1 ISSUES

**The application is structurally ready for production.** The build succeeds (0 errors, 247 pages), all routes resolve correctly, the 404/500 error pages are styled, internal linking is complete, and the core functionality (60+ calculators, maintenance tools, budget planner, embed widgets) works correctly.

**However, launching with the current P0 and P1 issues would cause:**

1. **Poor search engine presentation** — Google may display the wrong page title for 23 pages, including the homepage
2. **Console errors for every user** — 3 React hydration mismatches will log warnings in every browser
3. **Screen reader inaccessibility** — Calculator hub is nearly unusable with a screen reader (64/70 SVGs announced)
4. **Keyboard navigation gap** — Dropdown menus inaccessible to keyboard-only users
5. **Waste factor slider invisible to assistive tech** — No label association

### Pre-Launch Checklist

- [ ] Fix SVG `<title>` pollution (P0)
- [ ] Fix CostEstimator hydration (P1)
- [ ] Fix MaintenanceCalendar hydration (P1)
- [ ] Fix Quiz hydration (P1)
- [ ] Add `aria-hidden` to decorative SVGs (P1)
- [ ] Add dropdown keyboard accessibility + `aria-expanded` (P1)
- [ ] Add range slider label association (P1)
- [ ] Build + verify 0 hydration warnings
- [ ] Spot-check console on top 5 pages
- [ ] Run VoiceOver on calculators hub

### Estimated fix time: 4-6 hours
