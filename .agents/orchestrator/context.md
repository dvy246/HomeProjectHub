# Context Checklist: Launch-Readiness Audit

## Tech Stack
- Astro 7.0.3 (SSG)
- React 19.0.0 Islands (client-hydrated)
- Tailwind CSS v4.0.0 (no tailwind.config.js, global.css imports tailwind)
- Cloudflare Pages hosting
- localStorage only, no database

## Guidelines & Constraints
- Zero-API, static-only deployment constraint.
- Never write or modify source code directly as the orchestrator.
- All guide pages attribution: Marcus Vance.
- Avoid Home Depot affiliate links; use Lowe's or Amazon Associates.
- Audit trailing-slash canonical URLs, structured schemas, E-E-A-T alignment, AdSense rules, mobile responsiveness, touch targets, state persistence, URL state sync, math edge cases, and printer styling.

## Directory / File Checklist
- `AGENTS.md` (Read: done)
- `ORIGINAL_REQUEST.md` (Read: done)
- `src/components/calculators/` (Audit: pending)
- `src/lib/` (Audit: pending)
- `src/pages/` (Audit: pending)
