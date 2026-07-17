# Technical Feasibility & Build Size Audit Report
**Feature**: Pre-Calculated Project Blueprint Library (5,000 - 10,000 pages)
**Date**: 2026-07-17T18:07:00+05:30
**Analyst**: Technical and Build Size Analyst

---

## 1. Observation

### Current Codebase Configurations & Source Files
- **Page Source Files**: Running `find src/pages -type f | wc -l` shows **131** files in the `src/pages` directory.
- **Content Collection Source Files**: Running `find src/content/guide -type f | wc -l` shows **31** markdown files in the `src/content/guide/` directory.
- **Astro Config**: The `astro.config.mjs` configures `@astrojs/react`, `@astrojs/sitemap` (with custom filtering/serialization rules), and `@tailwindcss/vite`.
- **i18n Structure**: There is a client-side dictionary structure in `src/i18n/` supporting 6 locales (`en`, `es`, `de`, `pt`, `pl`, `it`), but no static subdirectories exist under `src/pages/` for them.

### Build and Output File Counts
Running `ASTRO_TELEMETRY_DISABLED=1 ./node_modules/.bin/astro build` succeeded with the following results:
- **Build Output Summary**: `1654 page(s) built in 10.49s`
- **Total HTML Output Files**: `1,654` HTML files (verified using `find dist -name "*.html" | wc -l`).
- **Total Output Files in `dist/`**: `1,813` files (verified using `find dist -type f | wc -l`). This includes sitemaps, assets, CSS, and JS chunks.

### Dynamic Route Configurations
From analyzing the codebase, we found the following dynamic routes that generate the bulk of the current 1,654 pages:
1. `src/pages/calculators/stair-stringer-designer/[structure]/[height]-inch-rise.astro`:
   - **Structures**: 12 structures (e.g., `deck-stairs`, `basement-stairs`, etc.).
   - **Heights**: 109 heights (12" to 120" rise heights).
   - **Formulas**: `12 * 109 = 1,308` programmatic pages.
   - **Hydration**: Uses `<StairStringerDesigner client:load initialRise={height} initialStructure={structure} />`.
2. `src/pages/estimate/concrete-slab/[slug].astro`: 39 pages (backed by `CONCRETE_SLAB_SEEDS`).
3. `src/pages/estimate/paint-room/[slug].astro`: 25 pages (backed by `PAINT_ROOM_SEEDS`).
4. `src/pages/estimate/roof-shingles/[slug].astro`: 31 pages (backed by `ROOF_SHINGLE_SEEDS`).
5. `src/pages/estimate/square-footage/[slug].astro`: 31 pages (backed by `SQFT_SEEDS`).
6. `src/pages/estimate/tile-floor/[slug].astro`: 24 pages (backed by `TILE_FLOOR_SEEDS`).
7. `src/pages/guides/[...slug].astro`: 31 pages (backed by 31 markdown guides).
8. `src/pages/embed/[...calculator].astro`: 32 pages (backed by list of embeddable calculators).
9. `src/pages/planner/[workflow].astro`: 8 pages (backed by `workflows.json`).
10. `src/pages/playbook/[projectType].astro`: 8 pages (backed by `workflows.json`).

*Total Dynamic Pages:* `1,308 + 39 + 25 + 31 + 31 + 24 + 31 + 32 + 8 + 8 = 1,537` pages. The remaining **117** pages are standard static routes.

---

## 2. Logic Chain

### Compile Reliability for 5,000 - 10,000 Programmatic Pages
1. **Measured Generation Speed**: The Astro SSG builder compiles `1,654` pages in `10.49` seconds, which is ~**158 pages/second**.
2. **Projected Compile Time**:
   - Adding **5,000 pages** brings the total to `6,654` pages. Linear projection: `6,654 / 158 ≈ 42 seconds`.
   - Adding **10,000 pages** brings the total to `11,654` pages. Linear projection: `11,654 / 158 ≈ 74 seconds`.
   - *Verdict*: Generation speed is extremely fast. Astro's compiler (leveraging Rollup and Vite under the hood) is highly optimized and will compile 5,000 to 10,000 programmatic static pages reliably.

### Cloudflare Pages Free Tier Limit (20,000 Files)
1. **Cloudflare Limit**: Cloudflare Pages free tier limits the total number of files in a deployment to **20,000**.
2. **Current Baseline**: `1,813` files in `dist/`.
3. **Projected Counts (Single Locale)**:
   - **+5,000 Pages**: `1,813 + 5,000 = 6,813` files (~34.1% of limit).
   - **+10,000 Pages**: `1,813 + 10,000 = 11,813` files (~59.1% of limit).
4. **Projected Counts (Multi-Language Static SEO Routes)**:
   - The codebase has `es`, `de`, `pt`, `pl`, and `it` translation files. Although these are currently client-hydrated, any future plan to render static SEO pages for all 6 locales (en + 5 target languages) changes the mathematics:
     - Current pages scaled to 6 locales: `1,654 * 6 = 9,924` pages.
     - With **5,000 new pages**: `(1,654 + 5,000) * 6 = 39,924` pages (**Breached!** by 19,924 files).
     - With **10,000 new pages**: `(1,654 + 10,000) * 6 = 69,924` pages (**Breached!** by 49,924 files).
   - *Verdict*: If the blueprint library is English-only, it fits comfortably. If it is statically localized for multi-language SEO, it will immediately breach the 20,000 limit.

### Build-Time and Memory Limits
1. **Build Timeout**: Cloudflare Pages allows up to **20 minutes** (1,200 seconds) of build time. Our projected compilation time of ~1.25 minutes for 10k pages leaves an enormous safety margin.
2. **Memory Limit**: Building 10,000+ pages involves rendering React client islands server-side 10,000 times during the build. This can trigger a Node.js out-of-memory (OOM) error if JavaScript heap memory is not optimized, as Astro keeps route metadata cache.
3. *Verdict*: The build-time duration is safe, but memory allocations must be managed in the build runner.

---

## 3. Caveats

- **I18n Rendering Strategy**: This report assumes that translation routes (e.g., `/es/`, `/de/`) are not currently pre-rendered during build, as confirmed by our inspection of the current `dist/` structure. If we transition to static localized routes for indexable SEO, the file count will scale by a factor of 6.
- **Node.js Heap Allocation**: Memory limits in local development versus Cloudflare's build runners might differ. If memory leaks exist in React components (e.g. from global state variables or event listener leaks during SSR), building 10,000 pages will crash Node.js unless garbage collection is tuned.

---

## 4. Conclusion

1. **Compilation Feasibility**: Highly feasible. Astro will reliably compile 5,000 - 10,000 static pages in under 2 minutes.
2. **Cloudflare Pages Limit**:
   - **Feasible** (under 12,000 files) if the blueprint library remains English-only.
   - **Infeasible** (over 39,000 files) if translated static pages are pre-rendered for SEO in all 6 target locales.
3. **Primary Recommendation / Mitigation Strategy**:
   - **Astro Hybrid Rendering (SSR/SSG)**:
     - Install the `@astrojs/cloudflare` adapter.
     - Configure the project to use `output: 'hybrid'` in `astro.config.mjs`.
     - Mark the blueprint library routes and stair-stringer rise/run combinations as on-demand routes by setting `export const prerender = false;` in those specific `.astro` page templates.
     - This allows pages to be rendered dynamically on-demand using Cloudflare Workers, reducing the total static file count to less than **500 files**, eliminating any risk of hitting the 20,000 limit while maintaining near-instant build times (<10 seconds).
   - **Build Memory Tuning**:
     - Set the build command environment variable `NODE_OPTIONS="--max-old-space-size=4096"` in Cloudflare Pages to prevent V8 engine out-of-memory exceptions during large compilations.

---

## 5. Verification Method

To verify the codebase file and build limits independently:
1. **Count current source page files**:
   ```bash
   find src/pages -type f | wc -l
   ```
2. **Run a production build and count outputs**:
   ```bash
   ASTRO_TELEMETRY_DISABLED=1 ./node_modules/.bin/astro build
   find dist -type f | wc -l
   find dist -name "*.html" | wc -l
   ```
3. **Simulate programmatic page impact**:
   Modify the loop range in `src/pages/calculators/stair-stringer-designer/[structure]/[height]-inch-rise.astro` to generate 5,000 paths temporarily and run the build command to monitor memory usage and compile time.
