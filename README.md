# HomePlanningHub

Free construction and home improvement planning calculators built with Astro.js.

**Live:** https://homeplanninghub.com

## Calculators

- **Concrete:** Slab, Footing, Column, Wall, Tube, Steps, Curb & Gutter, Rebar, Block Fill, Mix Ratio
- **Roofing:** Shingles, Metal, Plywood Deck, Pitch, Ice & Water Shield, Snow Load
- **Paint:** Interior paint coverage with door/window deductions
- **Tile:** Floor tile with layout pattern waste factors

## Features

- Workspace: Save room dimensions across all calculators (browser localStorage)
- Compare: Side-by-side material comparison matrix
- Guides: In-depth planning guides
- Planner: End-to-end project workflow
- Dark mode, metric/imperial toggle, accessible UI

## Tech Stack

- **Framework:** Astro 7 (Static Site Generation)
- **Interactive:** React 19 Islands
- **Styling:** Tailwind CSS v4
- **Hosting:** Cloudflare Pages

## Development

```sh
npm run dev       # Start dev server (localhost:4321)
npm run build     # Production build to ./dist/
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── calculators/     # React calculator components (islands)
│   └── ui/              # Reusable UI components
├── content/guide/       # Markdown guide content
├── layouts/             # Page layout templates
├── lib/                 # Shared utilities (geometry, material engine, storage, SEO)
└── pages/              # Astro pages (routes)
```

## Architecture

All calculators use a shared formula engine (`lib/geometry.ts` + `lib/materialEngine.ts`) for consistent math. React components hydrate on client scroll (`client:visible`) for optimal performance. AdSense is lazy-loaded via IntersectionObserver.

No tracking cookies by default. All user data stays in browser localStorage.
