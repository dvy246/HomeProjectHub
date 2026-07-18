import { useState, useEffect, useCallback } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import {
  computeInsulationPlan,
  encodeInsulationUrl,
  decodeInsulationUrl,
  getTargetR,
} from "../../lib/insulationEngine";
import type { ZoneInput, ZoneResult } from "../../lib/insulationEngine";
import {
  SURFACE_SPECS,
  MATERIAL_SPECS,
  STATE_LIST,
  STATE_ZONES,
  ZONE_REQUIREMENTS,
  IRA_TAX_CREDIT,
} from "../../data/insulation-zones";
import type { InsulationSurface, InsulationMaterial, ClimateZone } from "../../data/insulation-zones";
import { buildAffiliateUrl } from "../../lib/affiliates";

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------
const ACTIVE_SURFACES: InsulationSurface[] = [
  "attic",
  "exterior_wall",
  "floor_over_unconditioned",
  "crawl_space_wall",
  "basement_wall",
  "rim_joist",
];

const DEFAULT_MATERIAL: Record<InsulationSurface, InsulationMaterial> = {
  attic: "blown_in_cellulose",
  exterior_wall: "batt_fiberglass",
  floor_over_unconditioned: "batt_fiberglass",
  crawl_space_wall: "rigid_foam_xps",
  basement_wall: "rigid_foam_xps",
  rim_joist: "spray_foam_closed",
};

const ZONE_COLORS: Record<InsulationSurface, { fill: string; stroke: string; label: string }> = {
  attic: { fill: "#FEF3C7", stroke: "#F59E0B", label: "Attic" },
  exterior_wall: { fill: "#DBEAFE", stroke: "#3B82F6", label: "Walls" },
  floor_over_unconditioned: { fill: "#D1FAE5", stroke: "#10B981", label: "Floor" },
  crawl_space_wall: { fill: "#FCE7F3", stroke: "#EC4899", label: "Crawl" },
  basement_wall: { fill: "#EDE9FE", stroke: "#8B5CF6", label: "Basement" },
  rim_joist: { fill: "#FEE2E2", stroke: "#EF4444", label: "Rim" },
};

const AFFILIATE_PRODUCTS: Record<InsulationMaterial, { name: string; lowesPath: string; amazonPath: string; avgPrice: string }[]> = {
  blown_in_cellulose: [
    { name: "GreenFiber 25 lb Cellulose Bag (Pack of 10)", lowesPath: "/cellulose-insulation/", amazonPath: "/s?k=greenfiber+cellulose+insulation+25lb", avgPrice: "$145" },
    { name: "Lowe's Blower Machine Rental (1-Day)", lowesPath: "/insulation-blower-rental/", amazonPath: "/s?k=insulation+blower+machine", avgPrice: "$75/day" },
  ],
  blown_in_fiberglass: [
    { name: "Owens Corning AttiCat Expanding Blown-In Insulation (Pack of 10)", lowesPath: "/blown-in-insulation/atticat/", amazonPath: "/s?k=owens+corning+atticat+blown+in", avgPrice: "$189" },
    { name: "Lowe's Blower Machine Rental (1-Day)", lowesPath: "/insulation-blower-rental/", amazonPath: "/s?k=insulation+blower+machine", avgPrice: "$75/day" },
  ],
  batt_fiberglass: [
    { name: "Owens Corning R-13 Fiberglass Batt 15-in x 93-in (Bundle of 8)", lowesPath: "/fiberglass-insulation/r13/", amazonPath: "/s?k=owens+corning+r13+batt+insulation", avgPrice: "$49" },
    { name: "Owens Corning R-19 Fiberglass Batt 15-in x 93-in", lowesPath: "/fiberglass-insulation/r19/", amazonPath: "/s?k=owens+corning+r19+batt+insulation", avgPrice: "$62" },
  ],
  batt_mineral_wool: [
    { name: "Rockwool Safe'n'Sound 2-in x 15.25-in Mineral Wool Batt", lowesPath: "/mineral-wool-insulation/", amazonPath: "/s?k=rockwool+safensound+insulation+batt", avgPrice: "$79" },
    { name: "Rockwool Comfortbatt R-15 Mineral Wool (Bundle)", lowesPath: "/mineral-wool-insulation/r15/", amazonPath: "/s?k=rockwool+comfortbatt+r15", avgPrice: "$95" },
  ],
  rigid_foam_eps: [
    { name: "Owens Corning FOAMULAR 150 EPS 2-in x 4-ft x 8-ft Foam Board (R-8.3)", lowesPath: "/rigid-foam-insulation/eps/", amazonPath: "/s?k=eps+foam+board+insulation+4x8", avgPrice: "$32/sheet" },
  ],
  rigid_foam_xps: [
    { name: "Owens Corning FOAMULAR 250 XPS 2-in x 4-ft x 8-ft (R-10)", lowesPath: "/rigid-foam-insulation/xps/", amazonPath: "/s?k=xps+rigid+foam+board+insulation+foamular", avgPrice: "$38/sheet" },
    { name: "Owens Corning FOAMULAR 400 XPS 3-in x 4-ft x 8-ft (R-15)", lowesPath: "/rigid-foam-insulation/3-inch/", amazonPath: "/s?k=xps+foam+board+3+inch+insulation", avgPrice: "$56/sheet" },
  ],
  spray_foam_open: [
    { name: "Froth-Pak 650 2-Component Foam Sealant Kit", lowesPath: "/spray-foam-insulation/froth-pak/", amazonPath: "/s?k=froth+pak+650+spray+foam+kit", avgPrice: "$165" },
  ],
  spray_foam_closed: [
    { name: "Froth-Pak 200 Closed-Cell Spray Foam Sealant Kit (Rim Joist)", lowesPath: "/spray-foam-insulation/closed-cell/", amazonPath: "/s?k=froth+pak+closed+cell+spray+foam+200", avgPrice: "$110" },
  ],
};

// ----------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------
function ComplianceBadge({ isCompliant, meetsEnergyStar }: { isCompliant: boolean; meetsEnergyStar: boolean }) {
  if (meetsEnergyStar) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
        Energy Star
      </span>
    );
  }
  if (isCompliant) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
        Code Min
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
      Non-Compliant
    </span>
  );
}

// ----------------------------------------------------------------
// SVG House Cross-Section
// ----------------------------------------------------------------
function HouseSvg({
  activeSurfaces,
  onToggle,
}: {
  activeSurfaces: Set<InsulationSurface>;
  onToggle: (s: InsulationSurface) => void;
}) {
  const isActive = (s: InsulationSurface) => activeSurfaces.has(s);

  const zoneStyle = (s: InsulationSurface) => ({
    fill: isActive(s) ? ZONE_COLORS[s].fill : "#f5f5f4",
    stroke: isActive(s) ? ZONE_COLORS[s].stroke : "#d6d3d1",
    strokeWidth: isActive(s) ? 2 : 1,
    cursor: "pointer",
    transition: "all 0.2s ease",
    opacity: isActive(s) ? 1 : 0.65,
  });

  return (
    <svg
      viewBox="0 0 360 300"
      className="w-full max-w-md mx-auto"
      aria-label="Interactive house cross-section — click each zone to include it in your insulation plan"
      role="group"
    >
      {/* Background */}
      <rect x="0" y="0" width="360" height="300" fill="var(--bg-inset, #f9f7f5)" rx="12"/>

      {/* === ATTIC / ROOF === */}
      <g
        role="button"
        aria-pressed={isActive("attic")}
        aria-label="Attic zone"
        onClick={() => onToggle("attic")}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle("attic")}
      >
        {/* Roof slope left */}
        <polygon
          points="60,120 180,30 180,120"
          style={zoneStyle("attic")}
        />
        {/* Roof slope right */}
        <polygon
          points="180,30 300,120 180,120"
          style={zoneStyle("attic")}
        />
        {/* Attic floor / ceiling */}
        <rect x="60" y="115" width="240" height="10" style={{ fill: isActive("attic") ? "#D97706" : "#a8a29e", cursor: "pointer", transition: "fill 0.2s" }} onClick={() => onToggle("attic")} />
        {/* Label */}
        <text x="180" y="95" textAnchor="middle" fontSize="10" fontWeight="600" fill={isActive("attic") ? "#92400E" : "#78716c"}>Attic</text>
        {isActive("attic") && (
          <text x="180" y="108" textAnchor="middle" fontSize="8" fill="#92400E">✓ Selected</text>
        )}
      </g>

      {/* === EXTERIOR WALLS === */}
      <g
        role="button"
        aria-pressed={isActive("exterior_wall")}
        aria-label="Exterior walls zone"
        onClick={() => onToggle("exterior_wall")}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle("exterior_wall")}
      >
        {/* Left wall */}
        <rect x="60" y="125" width="20" height="100" style={zoneStyle("exterior_wall")} />
        {/* Right wall */}
        <rect x="280" y="125" width="20" height="100" style={zoneStyle("exterior_wall")} />
        {/* Labels */}
        <text x="70" y="180" textAnchor="middle" fontSize="8" fontWeight="600" fill={isActive("exterior_wall") ? "#1D4ED8" : "#78716c"} transform="rotate(-90, 70, 175)">Walls</text>
      </g>

      {/* === INTERIOR / LIVING SPACE === */}
      <rect x="80" y="125" width="200" height="100" fill={isActive("exterior_wall") ? "#EFF6FF" : "#fafaf9"} stroke="#e7e5e4" strokeWidth="0.5"/>
      <text x="180" y="178" textAnchor="middle" fontSize="11" fill="#a8a29e">Living Space</text>

      {/* === FLOOR OVER UNCONDITIONED === */}
      <g
        role="button"
        aria-pressed={isActive("floor_over_unconditioned")}
        aria-label="Floor over unconditioned space zone"
        onClick={() => onToggle("floor_over_unconditioned")}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle("floor_over_unconditioned")}
      >
        <rect x="60" y="225" width="240" height="14" style={zoneStyle("floor_over_unconditioned")} />
        <text x="180" y="235" textAnchor="middle" fontSize="8" fontWeight="600" fill={isActive("floor_over_unconditioned") ? "#065F46" : "#78716c"}>Floor / Ceiling Below</text>
      </g>

      {/* === RIM JOIST === */}
      <g
        role="button"
        aria-pressed={isActive("rim_joist")}
        aria-label="Rim joist zone"
        onClick={() => onToggle("rim_joist")}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle("rim_joist")}
      >
        {/* Left rim */}
        <rect x="60" y="239" width="20" height="16" style={zoneStyle("rim_joist")} />
        {/* Right rim */}
        <rect x="280" y="239" width="20" height="16" style={zoneStyle("rim_joist")} />
        <text x="50" y="250" textAnchor="middle" fontSize="7" fontWeight="600" fill={isActive("rim_joist") ? "#B91C1C" : "#78716c"} transform="rotate(-90, 50, 247)">Rim</text>
      </g>

      {/* === CRAWL SPACE WALL === */}
      <g
        role="button"
        aria-pressed={isActive("crawl_space_wall")}
        aria-label="Crawl space walls zone"
        onClick={() => onToggle("crawl_space_wall")}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle("crawl_space_wall")}
      >
        {/* Left crawl wall */}
        <rect x="60" y="255" width="20" height="30" style={zoneStyle("crawl_space_wall")} />
        {/* Right crawl wall */}
        <rect x="280" y="255" width="20" height="30" style={zoneStyle("crawl_space_wall")} />
        {/* Interior crawl space */}
        <rect x="80" y="255" width="200" height="30" fill={isActive("crawl_space_wall") ? "#FDF2F8" : "#fafaf9"} stroke="#e7e5e4" strokeWidth="0.5"/>
        <text x="180" y="272" textAnchor="middle" fontSize="8" fill="#a8a29e">Crawl Space</text>
      </g>

      {/* === BASEMENT WALL === */}
      <g
        role="button"
        aria-pressed={isActive("basement_wall")}
        aria-label="Basement walls zone"
        onClick={() => onToggle("basement_wall")}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle("basement_wall")}
      >
        {/* Foundation/basement hint at bottom */}
        <rect x="40" y="285" width="280" height="10" style={{ ...zoneStyle("basement_wall"), fill: isActive("basement_wall") ? "#F5F3FF" : "#e7e5e4" }} />
        <text x="180" y="293" textAnchor="middle" fontSize="8" fontWeight="600" fill={isActive("basement_wall") ? "#6D28D9" : "#78716c"}>Foundation / Basement Wall</text>
      </g>

      {/* Color legend — top right */}
      <g>
        {ACTIVE_SURFACES.map((s, i) => (
          <g key={s} transform={`translate(294, ${28 + i * 14})`} role="none">
            <rect width="8" height="8" rx="1.5" fill={activeSurfaces.has(s) ? ZONE_COLORS[s].fill : "#f5f5f4"} stroke={activeSurfaces.has(s) ? ZONE_COLORS[s].stroke : "#d6d3d1"} strokeWidth="1"/>
            <text x="11" y="7.5" fontSize="7" fill={activeSurfaces.has(s) ? ZONE_COLORS[s].stroke : "#a8a29e"} fontWeight={activeSurfaces.has(s) ? "600" : "400"}>
              {ZONE_COLORS[s].label}
            </text>
          </g>
        ))}
        <text x="294" y="18" fontSize="7" fill="#a8a29e" fontWeight="600">ZONES</text>
      </g>

      {/* Click prompt */}
      {activeSurfaces.size === 0 && (
        <text x="180" y="155" textAnchor="middle" fontSize="10" fill="#ea580c" fontWeight="600">
          ↑ Click a zone to start
        </text>
      )}
    </svg>
  );
}

export interface InsulationDesignerProps {
  initialState?: string;
  initialClimateZone?: ClimateZone;
  initialActiveSurfaces?: InsulationSurface[];
  initialAreas?: Partial<Record<InsulationSurface, number>>;
  initialMaterials?: Partial<Record<InsulationSurface, InsulationMaterial>>;
}

// ----------------------------------------------------------------
// Main Designer Component
// ----------------------------------------------------------------
function InsulationDesigner({
  initialState = "IL",
  initialClimateZone = 5,
  initialActiveSurfaces = ["attic", "exterior_wall", "rim_joist"],
  initialAreas = {},
  initialMaterials = {},
}: InsulationDesignerProps = {}) {
  const { t } = useI18n();

  // State
  const [selectedState, setSelectedState] = useState(initialState);
  const [climateZone, setClimateZone] = useState<ClimateZone>(initialClimateZone);
  const [useEnergyStarTarget, setUseEnergyStarTarget] = useState(false);
  const [activeSurfaces, setActiveSurfaces] = useState<Set<InsulationSurface>>(
    new Set(initialActiveSurfaces)
  );
  const [zoneInputs, setZoneInputs] = useState<Record<InsulationSurface, ZoneInput>>(() => {
    const initial: Record<string, ZoneInput> = {};
    for (const s of ACTIVE_SURFACES) {
      initial[s] = {
        surface: s,
        areaFt2: initialAreas[s] ?? SURFACE_SPECS[s].defaultArea,
        currentR: 0,
        material: initialMaterials[s] ?? DEFAULT_MATERIAL[s],
        useEnergyStarTarget: false,
      };
    }
    return initial as Record<InsulationSurface, ZoneInput>;
  });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<InsulationSurface | null>(null);

  // Restore from URL on mount
  useEffect(() => {
    const decoded = decodeInsulationUrl();
    if (decoded) {
      setClimateZone(decoded.zone);
      setSelectedState(decoded.state);
      setUseEnergyStarTarget(decoded.useEnergyStarTarget);
      const surfaces = new Set<InsulationSurface>();
      const inputMap: Record<string, ZoneInput> = { ...zoneInputs };
      for (const inp of decoded.inputs) {
        surfaces.add(inp.surface);
        inputMap[inp.surface] = { ...inp };
      }
      setActiveSurfaces(surfaces);
      setZoneInputs(inputMap as Record<InsulationSurface, ZoneInput>);
    }
  }, []);

  // Sync zone when state changes
  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    const entry = STATE_ZONES[stateCode];
    if (entry) setClimateZone(entry.primaryZone);
  };

  const toggleSurface = useCallback((s: InsulationSurface) => {
    setActiveSurfaces((prev) => {
      const next = new Set(prev);
      if (next.has(s)) {
        next.delete(s);
        if (activeTab === s) setActiveTab(null);
      } else {
        next.add(s);
        setActiveTab(s);
      }
      return next;
    });
  }, [activeTab]);

  const updateZoneInput = (surface: InsulationSurface, field: keyof ZoneInput, value: number | string | boolean) => {
    setZoneInputs((prev) => ({
      ...prev,
      [surface]: { ...prev[surface], [field]: value },
    }));
  };

  // Compute plan
  const activeInputs = ACTIVE_SURFACES
    .filter((s) => activeSurfaces.has(s))
    .map((s) => ({ ...zoneInputs[s], useEnergyStarTarget }));
  
  const plan = activeInputs.length > 0
    ? computeInsulationPlan(climateZone, activeInputs)
    : null;

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = encodeInsulationUrl({
      zone: climateZone,
      state: selectedState,
      inputs: activeInputs,
      useEnergyStarTarget,
    });
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const zoneReqs = ZONE_REQUIREMENTS[climateZone];
  const surfaceSpec = activeTab ? SURFACE_SPECS[activeTab] : null;
  const currentInput = activeTab ? zoneInputs[activeTab] : null;

  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[var(--border)] bg-[var(--bg-inset)] no-print">
        <div>
          <p className="text-xs text-[var(--fg-muted)] font-medium uppercase tracking-wider mb-0.5">
            IECC 2021 · Energy Star v3.2 · IRA §25C
          </p>
          <h2 className="text-sm font-bold text-[var(--fg)]">InsulationIQ — Whole-Home Zone Planner</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          {/* State selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="ins-state" className="text-xs text-[var(--fg-muted)] whitespace-nowrap">State:</label>
            <select
              id="ins-state"
              className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              {STATE_LIST.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          {/* Zone display */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 7v5l3 3"/></svg>
            <span className="text-xs font-bold text-amber-800">Climate Zone {climateZone}</span>
            {STATE_ZONES[selectedState]?.zones.length > 1 && (
              <select
                aria-label="Override climate zone"
                className="text-xs border-none bg-transparent text-amber-700 font-semibold focus:outline-none"
                value={climateZone}
                onChange={(e) => setClimateZone(parseInt(e.target.value) as ClimateZone)}
              >
                {STATE_ZONES[selectedState].zones.map((z) => (
                  <option key={z} value={z}>Zone {z}</option>
                ))}
              </select>
            )}
          </div>
          {/* Energy Star toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              className="rounded accent-[var(--accent)]"
              checked={useEnergyStarTarget}
              onChange={(e) => setUseEnergyStarTarget(e.target.checked)}
              id="ins-es-toggle"
            />
            <span className="text-xs text-[var(--fg-secondary)]">Energy Star targets</span>
          </label>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left: SVG Canvas + Zone Toggles */}
        <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex flex-col gap-4 no-print">
          <HouseSvg activeSurfaces={activeSurfaces} onToggle={toggleSurface} />

          {/* Zone selection chips */}
          <div className="flex flex-wrap gap-2">
            {ACTIVE_SURFACES.map((s) => {
              const active = activeSurfaces.has(s);
              const colors = ZONE_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={() => toggleSurface(s)}
                  aria-pressed={active}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all"
                  style={{
                    background: active ? colors.fill : "transparent",
                    borderColor: active ? colors.stroke : "var(--border)",
                    color: active ? colors.stroke : "var(--fg-muted)",
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: colors.stroke }} />
                  {SURFACE_SPECS[s].label.split(" ").slice(0, 2).join(" ")}
                </button>
              );
            })}
          </div>

          {/* Zone requirement reference for selected zone */}
          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl p-3 text-[10px] text-[var(--fg-secondary)]">
            <p className="font-bold text-[var(--fg)] text-xs mb-2">Zone {climateZone} R-Value Requirements</p>
            <div className="grid grid-cols-2 gap-1">
              {ACTIVE_SURFACES.map((s) => (
                <div key={s} className="flex justify-between gap-2 truncate">
                  <span className="truncate">{SURFACE_SPECS[s].label.replace(" Zone", "").replace(" / ", "/")}</span>
                  <span className="font-bold text-[var(--fg)] whitespace-nowrap">{zoneReqs[s].label}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[9px] text-[var(--fg-muted)]">Source: DOE IECC 2021 Table R402.1.2</p>
          </div>
        </div>

        {/* Right: Zone inputs + Results */}
        <div className="lg:col-span-7 flex flex-col">
          {activeSurfaces.size === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <svg className="w-12 h-12 mx-auto text-[var(--fg-muted)] mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <p className="text-sm font-semibold text-[var(--fg-secondary)]">Select zones on the house diagram</p>
                <p className="text-xs text-[var(--fg-muted)] mt-1">Click the attic, walls, floor, or other zones to begin your insulation plan.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--border)]">
              {/* Zone Tabs */}
              <div className="flex overflow-x-auto gap-1 p-2 bg-[var(--bg-inset)] no-print">
                {ACTIVE_SURFACES.filter((s) => activeSurfaces.has(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveTab(activeTab === s ? null : s)}
                    className="flex-shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: activeTab === s ? ZONE_COLORS[s].fill : "transparent",
                      color: activeTab === s ? ZONE_COLORS[s].stroke : "var(--fg-secondary)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: activeTab === s ? ZONE_COLORS[s].stroke : "transparent",
                    }}
                    aria-pressed={activeTab === s}
                  >
                    {SURFACE_SPECS[s].label.split(" ").slice(0, 2).join(" ")}
                  </button>
                ))}
              </div>

              {/* Active Zone Input Panel */}
              {activeTab && currentInput && (
                <div className="p-4 flex flex-col gap-3 no-print">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-[var(--fg)]">{SURFACE_SPECS[activeTab].label}</p>
                      <p className="text-xs text-[var(--fg-muted)] mt-0.5">{SURFACE_SPECS[activeTab].description}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded border"
                      style={{ background: ZONE_COLORS[activeTab].fill, borderColor: ZONE_COLORS[activeTab].stroke, color: ZONE_COLORS[activeTab].stroke }}
                    >
                      Zone {climateZone} → {useEnergyStarTarget ? zoneReqs[activeTab].energy_star : zoneReqs[activeTab].code_min}R required
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Area */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--fg-muted)] uppercase mb-1" htmlFor={`ins-area-${activeTab}`}>
                        Area (sq ft)
                      </label>
                      <input
                        id={`ins-area-${activeTab}`}
                        type="number"
                        min="1"
                        max="10000"
                        className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        value={currentInput.areaFt2}
                        onChange={(e) => updateZoneInput(activeTab, "areaFt2", Math.max(1, parseFloat(e.target.value) || 1))}
                      />
                    </div>
                    {/* Current R */}
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--fg-muted)] uppercase mb-1" htmlFor={`ins-curr-${activeTab}`}>
                        Current R-Value
                      </label>
                      <input
                        id={`ins-curr-${activeTab}`}
                        type="number"
                        min="0"
                        max="100"
                        className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        value={currentInput.currentR}
                        onChange={(e) => updateZoneInput(activeTab, "currentR", Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </div>
                    {/* Material */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-semibold text-[var(--fg-muted)] uppercase mb-1" htmlFor={`ins-mat-${activeTab}`}>
                        Material
                      </label>
                      <select
                        id={`ins-mat-${activeTab}`}
                        className="w-full text-xs border border-[var(--border)] rounded-lg px-2 py-2 bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        value={currentInput.material}
                        onChange={(e) => updateZoneInput(activeTab, "material", e.target.value as InsulationMaterial)}
                      >
                        {SURFACE_SPECS[activeTab].commonMaterials.map((m) => (
                          <option key={m} value={m}>{MATERIAL_SPECS[m].name}</option>
                        ))}
                        {/* Show all materials in an "Other" group */}
                        <optgroup label="Other materials">
                          {(Object.keys(MATERIAL_SPECS) as InsulationMaterial[])
                            .filter((m) => !SURFACE_SPECS[activeTab].commonMaterials.includes(m))
                            .map((m) => (
                              <option key={m} value={m}>{MATERIAL_SPECS[m].name}</option>
                            ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Material description */}
                  <p className="text-[10px] text-[var(--fg-muted)] bg-[var(--bg-inset)] rounded-lg px-3 py-2 border border-[var(--border)]">
                    {MATERIAL_SPECS[currentInput.material].description}
                  </p>
                </div>
              )}

              {/* Zone Results Summary */}
              {plan && (
                <div className="p-4 flex flex-col gap-3">
                  <p className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider">Zone-by-Zone Plan</p>
                  <div className="flex flex-col gap-2">
                    {plan.zones.map((z) => {
                      const spec = SURFACE_SPECS[z.surface];
                      const matSpec = MATERIAL_SPECS[zoneInputs[z.surface].material];
                      return (
                        <div
                          key={z.surface}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ZONE_COLORS[z.surface].stroke }} />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[var(--fg)] truncate">{spec.label}</p>
                              <p className="text-[10px] text-[var(--fg-muted)]">{matSpec.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:flex-nowrap">
                            {z.gapR > 0 ? (
                              <span className="text-xs font-bold text-[var(--fg)] whitespace-nowrap">
                                {z.unitsNeeded} {z.unitLabel} · {z.installedDepthIn}&Prime;
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--fg-muted)]">No upgrade needed</span>
                            )}
                            <ComplianceBadge isCompliant={z.isCompliant} meetsEnergyStar={z.meetsEnergyStar} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Warnings */}
                  {plan.warnings.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {plan.warnings.map((w, i) => (
                        <div key={i} className="flex gap-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Settling note */}
                  {plan.zones.some((z) => z.settlingNote) && (
                    <div className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <strong>Cellulose Settling Note:</strong> Cellulose insulation settles ~20% over time. The bag counts above already account for this — install to the labeled depth on the bag, not the theoretical calculated depth.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Results Summary Card ── */}
      {plan && (
        <div className="border-t border-[var(--border)] p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-[var(--bg-inset)] rounded-xl p-3 border border-[var(--border)]">
              <p className="text-[10px] text-[var(--fg-muted)] uppercase font-bold mb-1">Est. Material Cost</p>
              <p className="text-lg font-black text-[var(--fg)]">${plan.totalMaterialCost.toLocaleString()}</p>
              <p className="text-[9px] text-[var(--fg-muted)]">DIY materials only</p>
            </div>
            <div className="bg-[var(--bg-inset)] rounded-xl p-3 border border-[var(--border)]">
              <p className="text-[10px] text-[var(--fg-muted)] uppercase font-bold mb-1">Annual Savings</p>
              <p className="text-lg font-black text-emerald-600">${plan.totalAnnualSavings.toLocaleString()}</p>
              <p className="text-[9px] text-[var(--fg-muted)]">Energy cost reduction/yr</p>
            </div>
            <div className="bg-[var(--bg-inset)] rounded-xl p-3 border border-[var(--border)]">
              <p className="text-[10px] text-[var(--fg-muted)] uppercase font-bold mb-1">Payback Period</p>
              <p className="text-lg font-black text-[var(--fg)]">{plan.overallPaybackYears < 50 ? `${plan.overallPaybackYears} yr` : "—"}</p>
              <p className="text-[9px] text-[var(--fg-muted)]">Simple payback</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <p className="text-[10px] text-amber-700 uppercase font-bold mb-1">IRA §25C Credit</p>
              <p className="text-lg font-black text-amber-700">Up to ${plan.iraMaxCredit.toLocaleString()}</p>
              <p className="text-[9px] text-amber-600">30% tax credit (2023–2032)</p>
            </div>
          </div>

          {/* Compliance badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs font-semibold ${plan.allZonesCompliant ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {plan.allZonesCompliant ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
                All selected zones meet IECC 2021 code minimum requirements after upgrade.
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                One or more zones do not meet IECC 2021 code minimum. Increase current R-value or add more upgrade material.
              </>
            )}
          </div>

          {/* Affiliate Products */}
          {plan.zones.some((z) => z.unitsNeeded > 0) && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-1">Shop Materials</p>
              <p className="text-[9px] text-[var(--fg-muted)] leading-normal italic mb-2">
                {t('compare.affiliate_disclaimer')}
              </p>
              <div className="flex flex-col gap-2">
                {plan.zones
                  .filter((z) => z.unitsNeeded > 0)
                  .slice(0, 3)
                  .flatMap((z) => {
                    const mat = zoneInputs[z.surface].material;
                    return (AFFILIATE_PRODUCTS[mat] || []).slice(0, 1).map((p) => (
                      <div key={`${z.surface}-${p.name}`} className="flex items-center justify-between gap-3 px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-[var(--fg)] truncate">{p.name}</p>
                          <p className="text-[9px] text-[var(--fg-muted)]">
                            {SURFACE_SPECS[z.surface].label} · {z.unitsNeeded} {z.unitLabel} needed · ~{p.avgPrice}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <a
                            href={buildAffiliateUrl("lowes", p.lowesPath)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="text-[10px] font-bold px-2.5 py-1 bg-[#004990] text-white rounded-lg hover:bg-[#003a78] transition-colors"
                          >
                            Lowe&#39;s
                          </a>
                          <a
                            href={buildAffiliateUrl("amazon", p.amazonPath)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="text-[10px] font-bold px-2.5 py-1 bg-[#FF9900] text-black rounded-lg hover:bg-[#e68900] transition-colors"
                          >
                            Amazon
                          </a>
                        </div>
                      </div>
                    ));
                  })}
              </div>
            </div>
          )}

          {/* IRA Note */}
          <div className="text-[10px] text-[var(--fg-muted)] bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
            <strong className="text-amber-700">Federal Tax Credit (IRA §25C):</strong> {IRA_TAX_CREDIT.note}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print Contractor Binder
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-inset)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              {copied ? "Copied!" : "Share Plan"}
            </button>
            <a
              href="/calculators/diy-vs-pro/"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-inset)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              DIY vs Pro Cost
            </a>
          </div>

          {/* Disclaimer */}
          <p className="text-[9px] text-[var(--fg-muted)] mt-3 leading-relaxed">
            Cost estimates are for planning purposes only. Actual costs vary by region, product brand, and labor rates. Savings projections are approximations based on ASHRAE heat-flow models. Always consult a licensed energy auditor or insulation contractor for final specifications. See our <a href="/disclaimer/" className="underline">disclaimer</a>.
          </p>
        </div>
      )}

      {/* ── Print-Only Summary Table ── */}
      {plan && (
        <div className="hidden print:block border-t border-[var(--border)] p-6">
          <h2 className="text-xl font-bold mb-1">InsulationIQ — Whole-Home Insulation Binder</h2>
          <p className="text-sm text-gray-500 mb-4">
            Generated: {new Date().toLocaleDateString()} · State: {STATE_ZONES[selectedState]?.name} · IECC Climate Zone {climateZone} · Target: {useEnergyStarTarget ? "Energy Star v3.2" : "IECC 2021 Code Minimum"}
          </p>
          <table className="w-full text-xs border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Zone</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Area (sq ft)</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Current R</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Target R</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Gap R</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Material</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Units Needed</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Depth (in)</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Mat. Cost</th>
                <th className="border border-gray-300 px-3 py-2 text-right">IECC Status</th>
              </tr>
            </thead>
            <tbody>
              {plan.zones.map((z) => (
                <tr key={z.surface} className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-semibold">{SURFACE_SPECS[z.surface].label}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{z.areaFt2.toLocaleString()}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">R-{z.currentR}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold">R-{z.targetR}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{z.gapR > 0 ? `+R-${z.gapR}` : "None"}</td>
                  <td className="border border-gray-300 px-3 py-2">{MATERIAL_SPECS[zoneInputs[z.surface].material].name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold">{z.unitsNeeded > 0 ? `${z.unitsNeeded} ${z.unitLabel}` : "—"}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{z.installedDepthIn > 0 ? `${z.installedDepthIn}"` : "—"}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">${z.materialCostEst.toLocaleString()}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{z.meetsEnergyStar ? "Energy Star" : z.isCompliant ? "Code Min" : "Non-Compliant"}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-3 py-2">TOTAL</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{plan.zones.reduce((s, z) => s + z.areaFt2, 0).toLocaleString()}</td>
                <td colSpan={6} className="border border-gray-300 px-3 py-2"></td>
                <td className="border border-gray-300 px-3 py-2 text-right">${plan.totalMaterialCost.toLocaleString()}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{plan.allZonesCompliant ? "✓ Compliant" : "Review"}</td>
              </tr>
            </tbody>
          </table>
          <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
            <div className="border rounded p-3">
              <p className="font-bold">Annual Energy Savings Est.</p>
              <p className="text-lg font-black text-green-700">${plan.totalAnnualSavings.toLocaleString()}/yr</p>
            </div>
            <div className="border rounded p-3">
              <p className="font-bold">Simple Payback</p>
              <p className="text-lg font-black">{plan.overallPaybackYears < 50 ? `${plan.overallPaybackYears} years` : "N/A"}</p>
            </div>
            <div className="border rounded p-3">
              <p className="font-bold">IRA §25C Tax Credit (Est.)</p>
              <p className="text-lg font-black text-amber-700">Up to ${plan.iraMaxCredit.toLocaleString()}</p>
            </div>
          </div>
          <div className="border rounded p-3 mb-4 text-xs">
            <p className="font-bold mb-1">Contractor Notes</p>
            <div className="h-16 border-b border-dashed border-gray-300" />
          </div>
          <p className="text-[9px] text-gray-400">
            Cost and savings estimates are for planning purposes only. Verify final specifications with a licensed insulation contractor or energy auditor. Source: DOE IECC 2021, Energy Star v3.2, IRA §25C (IRS Form 5695). Generated by HomePlanningHub.com.
          </p>
        </div>
      )}
    </div>
  );
}

export default withI18n(InsulationDesigner);
