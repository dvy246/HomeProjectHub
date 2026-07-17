## 2026-07-17T13:12:48Z

You are a Feature Designer subagent for HomePlanningHub.
Working directory: /Users/divyyadav/developer/HomeProjectHub/.agents/teamwork_preview_explorer_feature_v2
Parent Conversation ID: eb80b190-282c-4fdb-b330-998904ca9035

Your task:
1. Initialize your progress.md under your working directory.
2. Review the competitor UX audit report at `/Users/divyyadav/developer/HomeProjectHub/.agents/teamwork_preview_explorer_competitor_v3/competitor_ux_audit.md` and the SEO report at `/Users/divyyadav/developer/HomeProjectHub/.agents/teamwork_preview_explorer_seo_v4/seo_adsense_audit.md`.
3. Propose exactly ONE high-ROI, low-complexity feature: an "Interactive Dynamic Material Cost & Takeoff Customizer Widget" (e.g. `TakeoffCostWidget.tsx`). This widget should:
   - Accept a list of materials, quantities, units, and default unit prices as props.
   - Render a card in the calculator results panel allowing the user to override unit costs.
   - Automatically save customized prices to browser `localStorage` under `home_project_hub_material_costs_v1` so they persist across calculators.
   - Expose a button to copy a shareable URL containing the custom prices as query parameters (e.g. `?concrete_bag_price=7.50`).
   - Fit into the layout rules of `Layout.astro` and have print-friendly CSS (hiding edit elements during window.print).
4. Review the codebase to find where this widget should be placed (e.g., `src/components/calculators/ConcreteSlabDesigner.tsx`, `src/components/calculators/DrywallCalc.tsx`, or as a reusable component in `src/components/ui/` or `src/components/calculators/`).
5. Write a detailed step-by-step execution roadmap in `/Users/divyyadav/developer/HomeProjectHub/.agents/teamwork_preview_explorer_feature_v2/feature_plan.md`. Detail the exact files to modify/create, code/JSON structures (interfaces, localStorage schemas), and verification steps.
6. When done, write a soft handoff in your working directory and notify the parent using send_message.
