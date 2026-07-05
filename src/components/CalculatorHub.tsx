import { useState, useMemo, useEffect } from "react";
import { useI18n } from "./i18n/I18nProvider";

interface CalcEntry {
  slug: string;
  name: string;
  category: string;
  icon: string;
}

const ICONS: Record<string, string> = {
  ruler: "M3 12h18M3 6h18M3 18h18",
  cube: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  weight: "M12 3a3 3 0 0 0-3 3v1H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2V6a3 3 0 0 0-3-3z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  triangle: "M12 2L2 22h20z",
  layers: "M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  box: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  fence: "M4 3v18M9 3v18M14 3v18M19 3v18M2 9h20M2 15h20",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  paint: "M7 21h10M12 3v14M8 7l4 4M16 7l-4 4M4 11l8 8 8-8",
  droplet: "M12 2l-5 10a5 5 0 0 0 10 0z",
  pipe: "M4 20h16M4 4h16M4 4v16M20 4v16",
  stairs: "M3 21h18M3 3v18M15 3h6v6M3 9h6v6",
  lumber: "M6 3v18M10 3v18M14 3v18M18 3v18",
  drywall: "M4 6h16v12H4zM4 10h16M4 14h16",
  circle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
};

const CALCULATORS: CalcEntry[] = [
  { slug: "board-foot", name: "Board Foot", category: "Converters", icon: "lumber" },
  { slug: "cubic-yard", name: "Cubic Yard", category: "Converters", icon: "cube" },
  { slug: "gallons-per-sq-ft", name: "Gallons per Sq Ft", category: "Converters", icon: "droplet" },
  { slug: "size-to-weight", name: "Size to Weight", category: "Converters", icon: "weight" },
  { slug: "sq-ft-to-cu-yd", name: "Sq Ft to Cu Yd", category: "Converters", icon: "cube" },
  { slug: "square-footage", name: "Square Footage", category: "Converters", icon: "grid" },
  { slug: "square-yards", name: "Square Yards", category: "Converters", icon: "grid" },
  { slug: "concrete", name: "Concrete (index)", category: "Concrete", icon: "box" },
  { slug: "concrete/slab", name: "Concrete Slab", category: "Concrete", icon: "grid" },
  { slug: "concrete/footing", name: "Concrete Footing", category: "Concrete", icon: "box" },
  { slug: "concrete/column", name: "Concrete Column", category: "Concrete", icon: "circle" },
  { slug: "concrete/wall", name: "Concrete Wall", category: "Concrete", icon: "box" },
  { slug: "concrete/tube", name: "Concrete Tube", category: "Concrete", icon: "circle" },
  { slug: "concrete/steps", name: "Concrete Steps", category: "Concrete", icon: "stairs" },
  { slug: "concrete/mix-ratio", name: "Concrete Mix Ratio", category: "Concrete", icon: "droplet" },
  { slug: "concrete/curb-gutter", name: "Curb & Gutter", category: "Concrete", icon: "box" },
  { slug: "concrete/block-fill", name: "Block Fill", category: "Concrete", icon: "grid" },
  { slug: "concrete/rebar", name: "Rebar", category: "Concrete", icon: "lumber" },
  { slug: "roofing", name: "Roofing (index)", category: "Roofing", icon: "home" },
  { slug: "roofing/shingles", name: "Roof Shingles", category: "Roofing", icon: "layers" },
  { slug: "roofing/metal", name: "Metal Roofing", category: "Roofing", icon: "layers" },
  { slug: "roofing/plywood", name: "Roof Plywood", category: "Roofing", icon: "grid" },
  { slug: "roofing/pitch", name: "Roof Pitch", category: "Roofing", icon: "triangle" },
  { slug: "roofing/snow-load", name: "Snow Load", category: "Roofing", icon: "weight" },
  { slug: "roofing/ice-water-shield", name: "Ice & Water Shield", category: "Roofing", icon: "shield" },
  { slug: "aluminum-weight", name: "Aluminum Weight", category: "Weight", icon: "weight" },
  { slug: "glass-weight", name: "Glass Weight", category: "Weight", icon: "weight" },
  { slug: "log-weight", name: "Log Weight", category: "Weight", icon: "weight" },
  { slug: "metal-weight", name: "Metal Weight", category: "Weight", icon: "weight" },
  { slug: "pipe-weight", name: "Pipe Weight", category: "Weight", icon: "pipe" },
  { slug: "plate-weight", name: "Plate Weight", category: "Weight", icon: "weight" },
  { slug: "steel-weight", name: "Steel Weight", category: "Weight", icon: "weight" },
  { slug: "steel-plate-weight", name: "Steel Plate Weight", category: "Weight", icon: "weight" },
  { slug: "stone-weight", name: "Stone Weight", category: "Weight", icon: "weight" },
  { slug: "tonnage", name: "Tonnage", category: "Weight", icon: "weight" },
  { slug: "baluster", name: "Baluster", category: "Wall & Fence", icon: "fence" },
  { slug: "board-batten", name: "Board & Batten", category: "Wall & Fence", icon: "fence" },
  { slug: "brick", name: "Brick", category: "Wall & Fence", icon: "grid" },
  { slug: "framing", name: "Framing", category: "Wall & Fence", icon: "lumber" },
  { slug: "retaining-wall", name: "Retaining Wall", category: "Wall & Fence", icon: "box" },
  { slug: "spindle-spacing", name: "Spindle Spacing", category: "Wall & Fence", icon: "fence" },
  { slug: "vinyl-fence", name: "Vinyl Fence", category: "Wall & Fence", icon: "fence" },
  { slug: "vinyl-siding", name: "Vinyl Siding", category: "Wall & Fence", icon: "grid" },
  { slug: "gravel", name: "Gravel", category: "Landscaping", icon: "droplet" },
  { slug: "limestone", name: "Limestone", category: "Landscaping", icon: "droplet" },
  { slug: "rip-rap", name: "Rip Rap", category: "Landscaping", icon: "droplet" },
  { slug: "river-rock", name: "River Rock", category: "Landscaping", icon: "droplet" },
  { slug: "sand", name: "Sand", category: "Landscaping", icon: "droplet" },
  { slug: "mulch", name: "Mulch", category: "Landscaping", icon: "droplet" },
  { slug: "french-drain", name: "French Drain", category: "Landscaping", icon: "pipe" },
  { slug: "fire-glass", name: "Fire Glass", category: "Landscaping", icon: "circle" },
  { slug: "sealant", name: "Sealant", category: "Landscaping", icon: "droplet" },
  { slug: "sonotube", name: "Sonotube", category: "Landscaping", icon: "circle" },
  { slug: "decking", name: "Decking", category: "Specialty", icon: "lumber" },
  { slug: "drywall", name: "Drywall", category: "Specialty", icon: "drywall" },
  { slug: "lumber", name: "Lumber", category: "Specialty", icon: "lumber" },
  { slug: "shed-cost", name: "Shed Cost", category: "Specialty", icon: "home" },
  { slug: "spiral-staircase", name: "Spiral Staircase", category: "Specialty", icon: "stairs" },
  { slug: "paint", name: "Paint", category: "Paint", icon: "paint" },
  { slug: "tile", name: "Tile", category: "Tile", icon: "grid" },
  { slug: "renovation/bathroom", name: "Bathroom Renovation", category: "Renovation", icon: "paint" },
  { slug: "renovation/kitchen", name: "Kitchen Renovation", category: "Renovation", icon: "grid" },
  { slug: "renovation/basement", name: "Basement Finishing", category: "Renovation", icon: "drywall" },
  { slug: "renovation/garage", name: "Garage Remodel", category: "Renovation", icon: "home" },
  { slug: "renovation/patio", name: "Patio Cost", category: "Renovation", icon: "box" },
  { slug: "renovation/deck", name: "Deck Cost", category: "Renovation", icon: "lumber" },
  { slug: "renovation/flooring", name: "Flooring Cost", category: "Renovation", icon: "grid" },
  { slug: "renovation/fence", name: "Fence Cost", category: "Renovation", icon: "fence" },
];

const CATEGORIES = ["All", "Converters", "Concrete", "Roofing", "Weight", "Wall & Fence", "Landscaping", "Specialty", "Paint", "Tile", "Renovation"];

export default function CalculatorHub() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) {
        const matched = CATEGORIES.find((c) => c.toLowerCase() === cat.toLowerCase());
        if (matched) {
          setCategory(matched);
        }
      }
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return CALCULATORS.filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('calculator_hub.search_placeholder') ?? 'Search calculators...'} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 pl-10 pr-3 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors min-w-[140px]">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === 'All' ? (t('calculator_hub.all') ?? c) : (t(`calculator_hub.category_${c.toLowerCase().replace(/[ &]/g, '_')}`) ?? c)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((calc) => (
          <a key={calc.slug} href={`/calculators/${calc.slug}/`} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 hover:border-[var(--border-hover)] hover:bg-[var(--card-bg-hover)] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d={ICONS[calc.icon] || ICONS.ruler} />
              </svg>
            </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{t(`calculator_hub.calc_${calc.slug.replace(/\//g, '_')}`) ?? calc.name}</div>
                <div className="text-[10px] text-[var(--fg-muted)]">{calc.category === 'All' ? (t('calculator_hub.all') ?? calc.category) : (t(`calculator_hub.category_${calc.category.toLowerCase().replace(/[ &]/g, '_')}`) ?? calc.category)}</div>
              </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--fg-muted)] text-center py-8">{t('calculator_hub.no_results') ?? 'No calculators found matching your search.'}</p>
      )}

      <p className="text-xs text-[var(--fg-muted)]">{t('calculator_hub.count_shown')?.replace('{count}', String(filtered.length)) ?? `${filtered.length} calculator${filtered.length !== 1 ? "s" : ""} shown`}</p>
    </div>
  );
}
