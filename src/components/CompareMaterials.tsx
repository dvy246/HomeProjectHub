import { useState } from "react";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { calculateRectArea, calculateVolume, cuFeetToCuYards } from "../lib/geometry";
import { applyWasteFactor } from "../lib/materialEngine";
import { buildAffiliateUrl } from "../lib/affiliates";
import { useI18n } from "./i18n/I18nProvider";

export default function CompareMaterials() {
  const { t } = useI18n();
  const [length, setLength] = useState<string>("20");
  const [width, setWidth] = useState<string>("10");
  const [thickness, setThickness] = useState<string>("4");

  const parseInput = (val: string) => {
    const num = parseFloat(val);
    return Number.isNaN(num) || num < 0 ? 0 : num;
  };

  const lenNum = parseInput(length);
  const widNum = parseInput(width);
  const thickNum = parseInput(thickness);

  const areaSqFt = calculateRectArea(lenNum, widNum);
  const thicknessFt = thickNum / 12;
  const volumeCuFt = calculateVolume(areaSqFt, thicknessFt);

  const concreteVolumeCuYd = cuFeetToCuYards(applyWasteFactor(volumeCuFt, 0.10));
  const paversSqFt = applyWasteFactor(areaSqFt, 0.05);
  const gravelVolumeCuYd = cuFeetToCuYards(applyWasteFactor(volumeCuFt, 0.10));

  const materials = [
    {
      name: t('compare.poured_concrete') ?? "Poured Concrete",
      subtitle: t('compare.poured_concrete_sub') ?? "Solid monolith slab",
      quantity: concreteVolumeCuYd.toFixed(2),
      unit: t('units.cu_yd') ?? "cu yd",
      durability: { label: t('compare.durability_high') ?? "High", color: "var(--success)" },
      maintenance: t('compare.maintenance_low_seal') ?? "Low — seal every 3 years",
      difficulty: { label: t('compare.difficulty_hard') ?? "Hard", color: "var(--error)", note: t('compare.pro_help') ?? "Pro help recommended" },
      lifespan: t('compare.lifespan_30_50') ?? "30–50 years",
    },
    {
      name: t('compare.concrete_pavers') ?? "Concrete Pavers",
      subtitle: t('compare.pavers_sub') ?? "Interlocking brick grid",
      quantity: Math.ceil(paversSqFt).toString(),
      unit: t('units.sq_ft') ?? "sq ft",
      durability: { label: t('compare.durability_high') ?? "High", color: "var(--success)" },
      maintenance: t('compare.maintenance_medium_weed') ?? "Medium — weed control",
      difficulty: { label: t('compare.difficulty_medium') ?? "Medium", color: "var(--warning)", note: t('compare.great_diy') ?? "Great DIY project" },
      lifespan: t('compare.lifespan_25_50') ?? "25–50 years",
    },
    {
      name: t('compare.pea_gravel') ?? "Pea Gravel",
      subtitle: t('compare.gravel_sub') ?? "Loose aggregate",
      quantity: gravelVolumeCuYd.toFixed(2),
      unit: t('units.cu_yd') ?? "cu yd",
      durability: { label: t('compare.durability_medium') ?? "Medium", color: "var(--fg-muted)" },
      maintenance: t('compare.maintenance_high_raking') ?? "High — raking & replenishment",
      difficulty: { label: t('compare.difficulty_easy') ?? "Easy", color: "var(--success)", note: t('compare.perfect_beginners') ?? "Perfect for beginners" },
      lifespan: t('compare.lifespan_indefinite') ?? "Indefinite (needs top-off)",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h3 className="text-sm font-semibold tracking-tight mb-4">{t('compare.project_dimensions') ?? 'Project Dimensions'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label={t('fields.length_ft') ?? "Length (ft)"} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder={t('common.placeholder')?.replace('{value}', '20') ?? "e.g. 20"} />
          <Input label={t('fields.width_ft') ?? "Width (ft)"} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder={t('common.placeholder')?.replace('{value}', '10') ?? "e.g. 10"} />
          <Input label={t('fields.thickness_in') ?? "Depth (inches)"} type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder={t('common.placeholder')?.replace('{value}', '4') ?? "e.g. 4"} />
        </div>
      </Card>

      {/* Comparison cards — responsive, no horizontal scroll */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {materials.map((mat) => (
          <div key={mat.name} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 card-elevated flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold tracking-tight">{mat.name}</h4>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">{mat.subtitle}</p>
            </div>

            <div className="py-3 border-y border-[var(--border)]">
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('compare.quantity_needed') ?? 'Quantity Needed'}</span>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-2xl font-bold tracking-tight animate-fade-in-up">{mat.quantity}</span>
                <span className="text-xs text-[var(--fg-muted)]">{mat.unit}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">{t('compare.durability') ?? 'Durability'}</span>
                <span className="font-semibold" style={{ color: mat.durability.color }}>{mat.durability.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">{t('compare.maintenance') ?? 'Maintenance'}</span>
                <span className="text-[var(--fg-secondary)] text-right">{mat.maintenance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">{t('compare.diy_difficulty') ?? 'DIY Difficulty'}</span>
                <span className="font-semibold" style={{ color: mat.difficulty.color }}>{mat.difficulty.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">{t('compare.lifespan') ?? 'Lifespan'}</span>
                <span className="text-[var(--fg-secondary)]">{mat.lifespan}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <p className="md:col-span-3 text-[10px] text-[var(--fg-muted)] leading-relaxed">
          {t('compare.affiliate_disclaimer') ?? 'Shopping links are optional and may be affiliate links. Always verify product coverage, availability, delivery fees, and local code requirements before buying.'}
        </p>
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">{t('compare.concrete_sourcing') ?? 'Concrete Sourcing'}</h4>
            <p className="text-xs text-[var(--fg-secondary)] mb-4 text-pretty">{t('compare.concrete_sourcing_desc') ?? 'Best for permanent patios. Order ready-mix delivery for projects over 1.5 cubic yards.'}</p>
          </div>
          <a href={buildAffiliateUrl("lowes", "/search?searchTerm=concrete+mix+80lb")} target="_blank" rel="nofollow sponsored noopener" className="inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 bg-transparent text-[var(--fg)] border border-[var(--border-strong)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-muted)] px-3 py-1.5 text-xs h-8 w-full">
            {t('compare.shop_lowes') ?? "Shop at Lowe's"}
          </a>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">{t('compare.paver_sourcing') ?? 'Paver Sourcing'}</h4>
            <p className="text-xs text-[var(--fg-secondary)] mb-4 text-pretty">{t('compare.paver_sourcing_desc') ?? 'Perfect for modular patio setups. Order individually or by the pallet.'}</p>
          </div>
          <a href={buildAffiliateUrl("lowes", "/search?searchTerm=concrete+pavers")} target="_blank" rel="nofollow sponsored noopener" className="inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 bg-transparent text-[var(--fg)] border border-[var(--border-strong)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-muted)] px-3 py-1.5 text-xs h-8 w-full">
            {t('compare.shop_lowes') ?? "Shop at Lowe's"}
          </a>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">{t('compare.gravel_sourcing') ?? 'Gravel Sourcing'}</h4>
            <p className="text-xs text-[var(--fg-secondary)] mb-4 text-pretty">{t('compare.gravel_sourcing_desc') ?? 'Low-cost pathway option. Pick up bags locally or order bulk delivery.'}</p>
          </div>
          <a href={buildAffiliateUrl("lowes", "/search?searchTerm=pea+gravel")} target="_blank" rel="nofollow sponsored noopener" className="inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 bg-transparent text-[var(--fg)] border border-[var(--border-strong)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-muted)] px-3 py-1.5 text-xs h-8 w-full">
            {t('compare.shop_lowes') ?? "Shop at Lowe's"}
          </a>
        </Card>
      </div>
    </div>
  );
}
