# Implementation Plan: Calculator Result Permalinks
**Feature Slug: calculator-permalinks**

This plan outlines the specific files to be created/modified to support URL parameter pre-filling, sharing, and indexing controls for the top 5 calculators.

---

## 1. Modifying Standard Calculators
We will modify the top 5 calculators under `src/components/calculators/`:
* `ConcreteSlabCalc.tsx`
* `RoofShingleCalc.tsx`
* `DrywallCalc.tsx`
* `PaintCalc.tsx`
* `TileCalc.tsx`

For each calculator:
1. Import `getUrlParam`, `setUrlParams`, and `copyShareUrl` from `../../lib/urlState`.
2. Convert default states to read from URL parameters on mount using `useEffect` or initial value state functions (avoiding hydration mismatches by keeping default values for initial state and overriding on mount if params are found).
3. Add a "Share Link" button next to results.
4. Sync input changes back to the URL search params using `setUrlParams`.

---

## 2. Dynamic noindex Configuration in Astro Router
To prevent duplicate content indexing by Google, we will insert a client-side script in the `<head>` of the 5 matching Astro pages to inject a `<meta name="robots" content="noindex, follow" />` header when the URL contains search query parameters.

Target Astro pages:
* `src/pages/calculators/concrete/slab.astro`
* `src/pages/calculators/roofing/shingles.astro`
* `src/pages/calculators/drywall/index.astro`
* `src/pages/calculators/paint/index.astro`
* `src/pages/calculators/tile/index.astro`

Snippet to add inside `<Layout>` header block:
```html
<script is:inline>
  if (window.location.search) {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, follow';
    document.head.appendChild(meta);
  }
</script>
```

---

## 3. Custom Share Link Button Component
To keep the UI premium and consistent, the share button will use this layout:
```tsx
<button
  type="button"
  onClick={handleShare}
  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--bg-inset)] text-[var(--fg)] transition-colors cursor-pointer"
>
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
  {shareSuccess ? "Copied!" : "Share Result"}
</button>
```
This button will render directly below or next to the results metrics.
