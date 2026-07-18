import React, { useState, useMemo, useEffect } from "react";
import { Card } from "../ui/Card";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import {
  getMaterialsByCategory,
  getDefaultWeights,
  compareMaterials,
  computeLifecycleCost,
  encodeComparisonState,
  decodeComparisonState,
  type ComparisonCategory,
  type ComparisonWeights,
  type ComparisonMaterialData,
} from "../../lib/compareEngine";
import { buildAffiliateUrl } from "../../lib/affiliates";

type MaterialWiseProps = {
  initialCategory?: ComparisonCategory;
  initialM1?: string;
  initialM2?: string;
  initialM3?: string;
  initialSqft?: number;
  initialWeights?: Partial<ComparisonWeights>;
};

const ALL_CATEGORIES: { id: ComparisonCategory; label: string }[] = [
  { id: "flooring", label: "Flooring" },
  { id: "countertops", label: "Countertops" },
  { id: "roofing", label: "Roofing" },
  { id: "siding", label: "Siding" },
  { id: "decking", label: "Decking" },
];

function MaterialWise({
  initialCategory,
  initialM1,
  initialM2,
  initialM3,
  initialSqft,
  initialWeights,
}: MaterialWiseProps = {}) {
  const { t } = useI18n();

  const [category, setCategory] = useState<ComparisonCategory>(initialCategory || "flooring");
  const [m1Id, setM1Id] = useState(initialM1 || "");
  const [m2Id, setM2Id] = useState(initialM2 || "");
  const [m3Id, setM3Id] = useState(initialM3 || "");
  const [sqft, setSqft] = useState(initialSqft ? String(initialSqft) : "200");
  const [weights, setWeights] = useState<ComparisonWeights>(() => {
    if (initialWeights) {
      return { ...getDefaultWeights(), ...initialWeights };
    }
    return getDefaultWeights();
  });

  const [copied, setCopied] = useState(false);

  const sqftNum = useMemo(() => {
    const n = parseFloat(sqft);
    return Number.isNaN(n) || n <= 0 ? 200 : n;
  }, [sqft]);

  // Restore state from URL query parameters on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const decoded = decodeComparisonState(window.location.search);
      if (decoded) {
        if (decoded.m1) setM1Id(decoded.m1);
        if (decoded.m2) setM2Id(decoded.m2);
        if (decoded.m3) setM3Id(decoded.m3);
        if (decoded.weights) setWeights(decoded.weights);
        if (decoded.sqft) setSqft(String(decoded.sqft));
      }
    }
  }, []);

  // Sync state parameters to URL query string dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && window.history.replaceState && m1Id && m2Id) {
      const encoded = encodeComparisonState({
        m1: m1Id,
        m2: m2Id,
        m3: m3Id || undefined,
        weights,
        sqft: sqftNum,
      });
      const newUrl = `${window.location.pathname}?${encoded}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [category, m1Id, m2Id, m3Id, weights, sqftNum]);

  const availableMaterials = useMemo(() => getMaterialsByCategory(category), [category]);

  useEffect(() => {
    if (!initialCategory) return;
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (m1Id && availableMaterials.find((m) => m.id === m1Id)) return;
    if (availableMaterials.length > 0) {
      setM1Id(availableMaterials[0].id);
      if (availableMaterials.length > 1) {
        setM2Id(availableMaterials[1].id);
      }
      if (availableMaterials.length > 2) {
        setM3Id("");
      }
    }
  }, [category]);

  useEffect(() => {
    if (!m1Id && availableMaterials.length > 0) {
      setM1Id(availableMaterials[0].id);
    }
    if (!m2Id && availableMaterials.length > 1) {
      setM2Id(availableMaterials.length > 1 ? availableMaterials[1].id : availableMaterials[0].id);
    }
  }, [availableMaterials]);

  const mat1 = useMemo(() => availableMaterials.find((m) => m.id === m1Id), [availableMaterials, m1Id]);
  const mat2 = useMemo(() => availableMaterials.find((m) => m.id === m2Id), [availableMaterials, m2Id]);
  const mat3 = useMemo(() => availableMaterials.find((m) => m.id === m3Id), [availableMaterials, m3Id]);

  const selectedMaterials = useMemo(() => {
    const result: ComparisonMaterialData[] = [];
    if (mat1) result.push(mat1);
    if (mat2) result.push(mat2);
    if (mat3) result.push(mat3);
    return result;
  }, [mat1, mat2, mat3]);



  const comparisonResult = useMemo(() => {
    if (selectedMaterials.length < 2) return null;
    return compareMaterials(selectedMaterials, weights, sqftNum);
  }, [selectedMaterials, weights, sqftNum]);

  const lifecycleCosts = useMemo(() => {
    const result: Record<string, { year1: number; year5: number; year10: number; year25: number }> = {};
    for (const mat of selectedMaterials) {
      const c1 = computeLifecycleCost(mat, sqftNum, 1);
      const c5 = computeLifecycleCost(mat, sqftNum, 5);
      const c10 = computeLifecycleCost(mat, sqftNum, 10);
      const c25 = computeLifecycleCost(mat, sqftNum, 25);
      result[mat.id] = {
        year1: c1.total,
        year5: c5.total,
        year10: c10.total,
        year25: c25.total,
      };
    }
    return result;
  }, [selectedMaterials, sqftNum]);

  const maxLifecycleCost = useMemo(() => {
    let max = 0;
    for (const lc of Object.values(lifecycleCosts)) {
      if (lc.year25 > max) max = lc.year25;
    }
    return max || 1;
  }, [lifecycleCosts]);

  const shareUrl = useMemo(() => {
    if (!m1Id || !m2Id) return "";
    const encoded = encodeComparisonState({
      m1: m1Id,
      m2: m2Id,
      m3: m3Id || undefined,
      weights,
      sqft: sqftNum,
    });
    return `/compare/${category}/?${encoded}`;
  }, [category, m1Id, m2Id, m3Id, weights, sqftNum]);

  function setWeight(key: keyof ComparisonWeights, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }));
  }

  function formatCurrency(value: number): string {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  function renderTexturePattern(mat: ComparisonMaterialData, id: string): React.ReactNode {
    const colors = mat.svgColors;
    const c1 = colors[0] || "#C0C0C0";
    const c2 = colors[1] || "#A0A0A0";
    const c3 = colors[2] || "#808080";
    const cat = mat.category;

    if (cat === "flooring") {
      if (mat.id === "hardwood" || mat.id === "bamboo" || mat.id === "cork") {
        return (
          <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill={c1} />
            <line x1="0" y1="4" x2="20" y2="4" stroke={c2} strokeWidth="0.5" />
            <line x1="0" y1="10" x2="20" y2="10" stroke={c2} strokeWidth="0.3" />
            <line x1="0" y1="16" x2="20" y2="16" stroke={c3} strokeWidth="0.5" />
          </pattern>
        );
      }
      if (mat.id === "laminate") {
        return (
          <pattern id={id} width="24" height="16" patternUnits="userSpaceOnUse">
            <rect width="24" height="16" fill={c1} />
            <rect x="0" y="0" width="24" height="14" fill={c2} />
            <line x1="0" y1="14" x2="24" y2="14" stroke="#888" strokeWidth="0.5" />
          </pattern>
        );
      }
      if (mat.id === "luxury-vinyl") {
        return (
          <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill={c1} />
            <rect x="2" y="2" width="12" height="12" rx="2" fill={c2} />
          </pattern>
        );
      }
      if (mat.id === "carpet") {
        return (
          <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill={c1} />
            <circle cx="1" cy="1" r="0.8" fill={c2} />
            <circle cx="3" cy="3" r="0.8" fill={c3} />
          </pattern>
        );
      }
      if (mat.id === "ceramic-tile") {
        return (
          <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill={c1} />
            <rect x="1" y="1" width="14" height="14" rx="1" fill={c2} />
          </pattern>
        );
      }
    }

    if (cat === "countertops") {
      if (mat.id === "granite") {
        return (
          <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill={c1} />
            <circle cx="5" cy="5" r="1.5" fill={c2} opacity="0.6" />
            <circle cx="14" cy="10" r="1" fill={c3} opacity="0.5" />
            <circle cx="8" cy="16" r="1.2" fill={c2} opacity="0.4" />
            <circle cx="17" cy="3" r="0.8" fill={c3} opacity="0.5" />
          </pattern>
        );
      }
      if (mat.id === "marble") {
        return (
          <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill={c1} />
            <path d="M0 10 Q15 5 30 12" stroke={c2} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M5 25 Q18 20 30 28" stroke={c3} strokeWidth="0.5" fill="none" opacity="0.3" />
          </pattern>
        );
      }
      if (mat.id === "butcher-block") {
        return (
          <pattern id={id} width="10" height="12" patternUnits="userSpaceOnUse">
            <rect width="10" height="12" fill={c1} />
            <line x1="0" y1="6" x2="10" y2="6" stroke={c2} strokeWidth="0.3" />
            <line x1="5" y1="0" x2="5" y2="12" stroke={c3} strokeWidth="0.4" />
          </pattern>
        );
      }
    }

    if (cat === "roofing") {
      if (mat.id === "asphalt-shingles") {
        return (
          <pattern id={id} width="20" height="12" patternUnits="userSpaceOnUse">
            <rect width="20" height="12" fill={c1} />
            <rect x="1" y="1" width="18" height="10" rx="2" fill={c2} />
            <rect x="3" y="3" width="14" height="6" rx="1" fill={c3} opacity="0.3" />
          </pattern>
        );
      }
      if (mat.id === "metal-standing-seam" || mat.id === "metal-siding") {
        return (
          <pattern id={id} width="8" height="20" patternUnits="userSpaceOnUse">
            <rect width="8" height="20" fill={c1} />
            <rect x="1" y="0" width="2" height="20" fill={c2} />
            <rect x="5" y="0" width="1" height="20" fill="#888" opacity="0.3" />
          </pattern>
        );
      }
      if (mat.id === "slate" || mat.id === "synthetic-slate") {
        return (
          <pattern id={id} width="16" height="14" patternUnits="userSpaceOnUse">
            <rect width="16" height="14" fill={c1} />
            <rect x="1" y="1" width="14" height="12" rx="1" fill={c2} />
            <line x1="0" y1="7" x2="16" y2="7" stroke={c3} strokeWidth="0.5" />
          </pattern>
        );
      }
    }

    if (mat.id === "vinyl") {
      return (
        <pattern id={id} width="12" height="8" patternUnits="userSpaceOnUse">
          <rect width="12" height="8" fill={c1} />
          <line x1="0" y1="4" x2="12" y2="4" stroke={c2} strokeWidth="0.5" />
          <line x1="6" y1="0" x2="6" y2="8" stroke={c3} strokeWidth="0.3" />
        </pattern>
      );
    }

    return (
      <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill={c1} />
        <rect x="2" y="2" width="12" height="12" rx="2" fill={c2} opacity="0.7" />
      </pattern>
    );
  }

  const dimensionLabels: Record<string, string> = {
    durability: "Durability",
    waterResistance: "Water Resistance",
    scratchResistance: "Scratch Resistance",
    easeMaintenance: "Ease of Maintenance",
    ecoFriendly: "Eco-Friendly",
    resaleValue: "Resale Value",
    warmthComfort: "Warmth & Comfort",
    soundAbsorption: "Sound Absorption",
    costPerSqFt: "Cost per sq. ft.",
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-tight">MaterialWise Comparison</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Category</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ComparisonCategory);
                setM1Id("");
                setM2Id("");
                setM3Id("");
              }}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
              aria-label="Material Category"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Material 1</span>
            <select
              value={m1Id}
              onChange={(e) => setM1Id(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
              aria-label="First material to compare"
            >
              {availableMaterials.map((m) => (
                <option key={m.id} value={m.id} disabled={m.id === m2Id || m.id === m3Id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Material 2</span>
            <select
              value={m2Id}
              onChange={(e) => setM2Id(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
              aria-label="Second material to compare"
            >
              {availableMaterials.map((m) => (
                <option key={m.id} value={m.id} disabled={m.id === m1Id || m.id === m3Id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Material 3 (optional)</span>
            <select
              value={m3Id}
              onChange={(e) => setM3Id(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
              aria-label="Third material to compare (optional)"
            >
              <option value="">— None —</option>
              {availableMaterials.map((m) => (
                <option key={m.id} value={m.id} disabled={m.id === m1Id || m.id === m2Id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-[var(--fg-secondary)]">Room Size (sq ft)</span>
          <input
            type="number"
            min="1"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
            className="w-24 bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium text-sm"
            aria-label="Room size in square feet"
          />
          <button
            onClick={() => window.print()}
            className="print:hidden ml-auto bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--fg)] font-bold px-3 py-2 rounded-lg text-center transition-all cursor-pointer text-xs"
          >
            Print
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-4 order-2 lg:order-1">
          <Card className="p-4">
            <div className="rounded-lg bg-[var(--bg-inset)] border border-[var(--border)] p-4">
              <svg width="100%" height="160" viewBox="0 0 560 160" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Material comparison swatches">
                <defs>
                  {mat1 && renderTexturePattern(mat1, "tex-mat1")}
                  {mat2 && renderTexturePattern(mat2, "tex-mat2")}
                  {mat3 && renderTexturePattern(mat3, "tex-mat3")}
                </defs>
                {mat1 && (
                  <g>
                    <rect x="10" y="10" width="160" height="100" rx="6" fill={`url(#tex-mat1)`} stroke="var(--border-strong)" strokeWidth="1" />
                    <text x="90" y="130" textAnchor="middle" className="text-xs" fill="var(--fg)" fontSize="11">{mat1.name}</text>
                    <text x="90" y="143" textAnchor="middle" className="text-xs" fill="var(--fg-muted)" fontSize="10">${mat1.costPerUnit.avg}/sq ft</text>
                    {comparisonResult?.winnerId === mat1.id && (
                      <text x="90" y="28" textAnchor="middle" fill="#ea580c" fontSize="11" fontWeight="bold">★ Winner</text>
                    )}
                  </g>
                )}
                {mat2 && (
                  <g>
                    <rect x="200" y="10" width="160" height="100" rx="6" fill={`url(#tex-mat2)`} stroke="var(--border-strong)" strokeWidth="1" />
                    <text x="280" y="130" textAnchor="middle" className="text-xs" fill="var(--fg)" fontSize="11">{mat2.name}</text>
                    <text x="280" y="143" textAnchor="middle" className="text-xs" fill="var(--fg-muted)" fontSize="10">${mat2.costPerUnit.avg}/sq ft</text>
                    {comparisonResult?.winnerId === mat2.id && (
                      <text x="280" y="28" textAnchor="middle" fill="#ea580c" fontSize="11" fontWeight="bold">★ Winner</text>
                    )}
                  </g>
                )}
                {mat3 && (
                  <g>
                    <rect x="390" y="10" width="160" height="100" rx="6" fill={`url(#tex-mat3)`} stroke="var(--border-strong)" strokeWidth="1" />
                    <text x="470" y="130" textAnchor="middle" className="text-xs" fill="var(--fg)" fontSize="11">{mat3.name}</text>
                    <text x="470" y="143" textAnchor="middle" className="text-xs" fill="var(--fg-muted)" fontSize="10">${mat3.costPerUnit.avg}/sq ft</text>
                    {comparisonResult?.winnerId === mat3.id && (
                      <text x="470" y="28" textAnchor="middle" fill="#ea580c" fontSize="11" fontWeight="bold">★ Winner</text>
                    )}
                  </g>
                )}
              </svg>
            </div>
          </Card>

          <Card>
            <h4 className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">Lifecycle Cost Comparison ({sqftNum} sq ft)</h4>
            <svg width="100%" height="160" viewBox="0 0 520 160" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Lifecycle cost bar chart">
              {lifecycleCosts[mat1?.id || ""] && (
                <g>
                  <text x="20" y="20" fill="var(--fg)" fontSize="10">{mat1?.name}</text>
                  <rect x="0" y="25" width="160" height="15" rx="3" fill={mat1?.svgColors[0] || "#888"} />
                  <text x="165" y="37" fill="var(--fg)" fontSize="9" className="tabular-nums">1yr: {formatCurrency(lifecycleCosts[mat1!.id].year1)}</text>
                  <rect x="0" y="45" width="160" height="15" rx="3" fill={mat1?.svgColors[1] || "#888"} />
                  <text x="165" y="57" fill="var(--fg)" fontSize="9" className="tabular-nums">5yr: {formatCurrency(lifecycleCosts[mat1!.id].year5)}</text>
                  <rect x="0" y="65" width="160" height="15" rx="3" fill={mat1?.svgColors[2] || "#888"} />
                  <text x="165" y="77" fill="var(--fg)" fontSize="9" className="tabular-nums">10yr: {formatCurrency(lifecycleCosts[mat1!.id].year10)}</text>
                  <rect x="0" y="85" width="160" height="15" rx="3" fill="#ea580c" />
                  <text x="165" y="97" fill="var(--fg)" fontSize="9" className="tabular-nums">25yr: {formatCurrency(lifecycleCosts[mat1!.id].year25)}</text>
                </g>
              )}
              {lifecycleCosts[mat2?.id || ""] && (
                <g transform="translate(260, 0)">
                  <text x="20" y="20" fill="var(--fg)" fontSize="10">{mat2?.name}</text>
                  <rect x="0" y="25" width="160" height="15" rx="3" fill={mat2?.svgColors[0] || "#888"} />
                  <text x="165" y="37" fill="var(--fg)" fontSize="9" className="tabular-nums">1yr: {formatCurrency(lifecycleCosts[mat2!.id].year1)}</text>
                  <rect x="0" y="45" width="160" height="15" rx="3" fill={mat2?.svgColors[1] || "#888"} />
                  <text x="165" y="57" fill="var(--fg)" fontSize="9" className="tabular-nums">5yr: {formatCurrency(lifecycleCosts[mat2!.id].year5)}</text>
                  <rect x="0" y="65" width="160" height="15" rx="3" fill={mat2?.svgColors[2] || "#888"} />
                  <text x="165" y="77" fill="var(--fg)" fontSize="9" className="tabular-nums">10yr: {formatCurrency(lifecycleCosts[mat2!.id].year10)}</text>
                  <rect x="0" y="85" width="160" height="15" rx="3" fill="#ea580c" />
                  <text x="165" y="97" fill="var(--fg)" fontSize="9" className="tabular-nums">25yr: {formatCurrency(lifecycleCosts[mat2!.id].year25)}</text>
                </g>
              )}
              {lifecycleCosts[mat3?.id || ""] && (
                <g transform="translate(130, 115)">
                  <text x="20" y="12" fill="var(--fg)" fontSize="10">{mat3?.name}</text>
                  <rect x="0" y="17" width="120" height="12" rx="2" fill={mat3?.svgColors[0] || "#888"} />
                  <text x="125" y="27" fill="var(--fg)" fontSize="8" className="tabular-nums">1yr: {formatCurrency(lifecycleCosts[mat3!.id].year1)}</text>
                  <rect x="0" y="33" width="120" height="12" rx="2" fill={mat3?.svgColors[1] || "#888"} />
                  <text x="125" y="43" fill="var(--fg)" fontSize="8" className="tabular-nums">5yr: {formatCurrency(lifecycleCosts[mat3!.id].year5)}</text>
                </g>
              )}
            </svg>
          </Card>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4 order-1 lg:order-2">
          <Card className="p-5">
            <h4 className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-4">Your Priorities</h4>
            <div className="flex flex-col gap-3">
              {([
                { key: "cost" as const, label: "Low Cost" },
                { key: "durability" as const, label: "Durability" },
                { key: "maintenance" as const, label: "Low Maintenance" },
                { key: "lifespan" as const, label: "Long Lifespan" },
                { key: "ecoFriendly" as const, label: "Eco-Friendly" },
                { key: "aesthetics" as const, label: "Aesthetics" },
              ]).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs w-24 text-[var(--fg-secondary)] shrink-0">{label}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[key]}
                    onChange={(e) => setWeight(key, parseInt(e.target.value, 10))}
                    className="flex-1 accent-[var(--accent)] h-1.5"
                    aria-label={`Priority for ${label}`}
                  />
                  <span className="text-xs tabular-nums w-6 text-right text-[var(--fg-muted)]">{weights[key]}</span>
                </div>
              ))}
            </div>
          </Card>

          {comparisonResult && (
            <Card className={`p-5 ${comparisonResult.materials[0].winner ? 'border-t-4 border-t-[var(--accent)]' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Winner</span>
                <span className="text-sm font-bold text-[var(--fg)]">{comparisonResult.materials[0].materialName}</span>
                <span className="text-xs text-[var(--fg-muted)] ml-auto tabular-nums">{comparisonResult.materials[0].totalScore}/100</span>
              </div>
              <p className="text-xs text-[var(--fg-secondary)] leading-relaxed mb-3">
                {comparisonResult.recommendation}
              </p>
            </Card>
          )}
        </div>
      </div>

      {comparisonResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonResult.materials.map((mat, idx) => {
            const materialData = selectedMaterials.find((m) => m.id === mat.materialId);
            return (
              <Card key={mat.materialId}
                className={`p-5 flex flex-col gap-3 ${idx === 0 ? 'border-t-4 border-t-[var(--accent)] ring-1 ring-[var(--accent)]/20' : ''}`}
              >
                {idx === 0 && (
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Winner</span>
                )}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--fg)]">{mat.materialName}</h4>
                  <span className="text-xs font-semibold tabular-nums">{mat.totalScore}/100</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {Object.entries(mat.dimensionScores).map(([key, score]) => {
                    const label = dimensionLabels[key] || key;
                    const barWidth = typeof score === "number" ? Math.min(score * 10, 100) : 0;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[10px] w-24 text-[var(--fg-muted)] shrink-0 leading-tight">{label}</span>
                        <div className="flex-1 h-1.5 bg-[var(--bg-inset)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums w-3 text-right text-[var(--fg-muted)]">{typeof score === "number" ? Math.round(score) : 0}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[var(--border)] pt-3 mt-1">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-[var(--fg-muted)]">Upfront Cost</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(mat.upfrontCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-[var(--fg-muted)]">25-Year TCO</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(mat.lifecycleCost.total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--fg-muted)]">Upfront +{materialData ? ` $${materialData.costPerUnit.avg}/sf` : ""}</span>
                    <span className="font-semibold tabular-nums">{materialData ? `$${materialData.costPerUnit.avg}/sq ft` : ""}</span>
                  </div>
                </div>

                {materialData?.affiliateLinks.lowes && (
                  <div className="flex flex-col gap-1.5 mt-3">
                    <p className="text-[9px] text-[var(--fg-muted)] leading-normal italic">
                      {t('compare.affiliate_disclaimer')}
                    </p>
                    <a
                      href={buildAffiliateUrl("lowes", materialData.affiliateLinks.lowes)}
                      target="_blank"
                      rel="sponsored nofollow"
                      className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold px-3 py-2 rounded-lg text-center transition-all cursor-pointer"
                    >
                      Buy {mat.materialName} at Lowe's
                    </a>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!comparisonResult && (
        <Card className="p-5 bg-[var(--bg-subtle)] border border-dashed border-[var(--border)]">
          <p className="text-xs text-[var(--fg-muted)] text-center">
            Select two or three materials to compare.
          </p>
        </Card>
      )}

      <div className="print:hidden flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl p-4 gap-4 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[var(--fg)]">Share This Comparison</span>
          <span className="text-[var(--fg-secondary)]">Copy the link to share your exact comparison and priorities.</span>
        </div>
        <div className="flex items-center gap-3">
          {shareUrl && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}${shareUrl}`)
                  .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  })
                  .catch(() => {});
              }}
              className="bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--fg)] font-bold px-4 py-2 rounded-lg text-center transition-all cursor-pointer min-w-32"
            >
              {copied ? "Copied!" : "Copy Share Link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default withI18n<MaterialWiseProps>(MaterialWise);
