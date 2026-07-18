import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  computeSlab, computeSubBase,
  type SlabDesignInput, type SlabResults, type SlabShape, type FinishType,
  type ReinforcementType, type SubBaseMaterial, type RebarGrid, VAPOR_BARRIER_OVERLAP,
} from "../../lib/concreteSlabEngine";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useProjects } from "../../lib/useProjects";
import AddToProjectCard from "../ui/AddToProjectCard";
import CostEstimatorWidget from "../ui/CostEstimatorWidget";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";


const SHAPE_ICONS: Record<SlabShape, string> = {
  rect: "M3 3h18v18H3z",
  "l-shape": "M3 3h18v12H15v6H3z",
  circle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
};

const FINISH_LABELS: Record<FinishType, string> = {
  broom: "Broom Finish",
  smooth: "Smooth Trowel",
  stamped: "Stamped Pattern",
  exposed: "Exposed Aggregate",
  colored: "Integral Color",
};

const SUBBASE_LABELS: Record<SubBaseMaterial, string> = {
  gravel: "Pea Gravel",
  "crushed-stone": "Crushed Stone (#57)",
  sand: "Compactable Sand",
};

let idCounter = Date.now();
function genId(): string { return `id-${idCounter++}`; }

function DimensionArrow({ x1, y1, x2, y2, label, onClick }: {
  x1: number; y1: number; x2: number; y2: number; label: string; onClick?: () => void;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;
  const off = 18;
  const ax1 = x1 + nx * off;
  const ay1 = y1 + ny * off;
  const ax2 = x2 + nx * off;
  const ay2 = y2 + ny * off;
  const amx = (ax1 + ax2) / 2;
  const amy = (ay1 + ay2) / 2;
  return (
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      {/* Invisible touch buffer overlay */}
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke="transparent" strokeWidth="24" />
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke="#1c1917" strokeWidth="1.5" />
      <line x1={ax1} y1={ay1} x2={ax1 + nx * 5 - ny * 5} y2={ay1 + ny * 5 + nx * 5} stroke="#1c1917" strokeWidth="1" />
      <line x1={ax1} y1={ay1} x2={ax1 + nx * 5 + ny * 5} y2={ay1 + ny * 5 - nx * 5} stroke="#1c1917" strokeWidth="1" />
      <line x1={ax2} y1={ay2} x2={ax2 + nx * 5 - ny * 5} y2={ay2 + ny * 5 + nx * 5} stroke="#1c1917" strokeWidth="1" />
      <line x1={ax2} y1={ay2} x2={ax2 + nx * 5 + ny * 5} y2={ay2 + ny * 5 - nx * 5} stroke="#1c1917" strokeWidth="1" />
      <text x={amx + nx * 14} y={amy + ny * 14} textAnchor="middle" dominantBaseline="middle" fill="#1c1917" fontSize="11" fontWeight="600" fontFamily="monospace">
        {label}
      </text>
    </g>
  );
}

function OverheadView({
  shape, lengthA, widthA, lengthB, widthB, diameter,
  rebarGrid, showRebar, showJoints, controlJoints,
  results, onDimensionClick,
}: {
  shape: SlabShape; lengthA: number; widthA: number; lengthB?: number; widthB?: number;
  diameter?: number; rebarGrid: RebarGrid | null; showRebar: boolean; showJoints: boolean;
  controlJoints: { spacingX: number; spacingY: number; jointsAlongLength: number; jointsAlongWidth: number; totalLinearFt: number };
  results: SlabResults; onDimensionClick?: (dim: string) => void;
}) {
  const l = Math.max(lengthA, 1);
  const w = Math.max(widthA, 1);
  const maxDim = Math.max(shape === "circle" ? (diameter ?? l) : l, w, 1);
  const scale = 360 / maxDim;
  const pad = 60;

  const sl = l * scale;
  const sw = w * scale;
  const ox = pad;
  const oy = pad;

  const wbVal = (shape === "l-shape" && widthB) ? Math.max(widthB, 0) * scale : 0;
  const maxH = sw + wbVal;

  const rLines: React.ReactNode[] = [];
  if (showRebar && rebarGrid) {
    const spacingFt = rebarGrid.spacing / 12;
    const barsCountX = Math.ceil((sl / scale) / spacingFt) + 1;
    for (let i = 0; i < barsCountX; i++) {
      const x = ox + i * spacingFt * scale;
      if (x > ox + sl) break;
      rLines.push(<line key={`rl-${i}`} x1={x} y1={oy} x2={x} y2={oy + maxH} stroke="#999" strokeWidth="0.3" strokeDasharray="2 1" />);
    }
    const barsCountY = Math.ceil((maxH / scale) / spacingFt) + 1;
    for (let i = 0; i < barsCountY; i++) {
      const y = oy + i * spacingFt * scale;
      if (y > oy + maxH) break;
      rLines.push(<line key={`rw-${i}`} x1={ox} y1={y} x2={ox + sl} y2={y} stroke="#999" strokeWidth="0.3" strokeDasharray="2 1" />);
    }
  }

  const jLines: React.ReactNode[] = [];
  if (showJoints) {
    const spacingPt = controlJoints.spacingX * scale;
    const jointsCountX = Math.max(0, Math.ceil((sl / scale) / controlJoints.spacingX) - 1);
    for (let i = 1; i <= jointsCountX; i++) {
      const x = ox + i * spacingPt;
      jLines.push(<line key={`jx-${i}`} x1={x} y1={oy} x2={x} y2={oy + maxH} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6 3" />);
    }
    const jointsCountY = Math.max(0, Math.ceil((maxH / scale) / controlJoints.spacingY) - 1);
    for (let i = 1; i <= jointsCountY; i++) {
      const y = oy + i * spacingPt;
      jLines.push(<line key={`jy-${i}`} x1={ox} y1={y} x2={ox + sl} y2={y} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6 3" />);
    }
  }

  let slabPath: React.ReactNode;
  let clipElement: React.ReactNode = null;

  if (shape === "circle") {
    const d = (diameter ?? lengthA) * scale;
    const cx = ox + sl / 2;
    const cy = oy + sw / 2;
    const r = d / 2;
    const circleR = Math.min(r, 180);
    slabPath = <circle cx={cx} cy={cy} r={circleR} fill="none" stroke="#1c1917" strokeWidth="2" />;
    clipElement = <circle cx={cx} cy={cy} r={circleR} />;
  } else {
    let pathStr = "";
    if (shape === "rect") {
      pathStr = `M${ox} ${oy}h${sl}v${sw}h-${sl}z`;
      clipElement = <rect x={ox} y={oy} width={sl} height={sw} />;
    } else if (shape === "l-shape" && lengthB && widthB) {
      const lb = Math.max(lengthB, 0) * scale;
      const wb = Math.max(widthB, 0) * scale;
      pathStr = `M${ox} ${oy}h${sl}v${sw + wb}h-${lb}v-${wb}h-${sl - lb}z`;
      clipElement = <path d={pathStr} />;
    }
    slabPath = <path d={pathStr} fill="none" stroke="#1c1917" strokeWidth="2" />;
  }


  const areaLabel = `${results.area.toFixed(1)} sq ft`;

  return (
    <svg viewBox="0 0 480 400" className="w-full h-auto" role="img" aria-label="Concrete slab overhead plan view">
      <defs>
        <clipPath id="slab-clip">
          {clipElement}
        </clipPath>
      </defs>
      <rect x="0" y="0" width="480" height="400" fill="transparent" />
      {slabPath}
      <g clipPath="url(#slab-clip)">
        {rLines}
        {jLines}
      </g>
      {shape === "rect" && (
        <>
          <DimensionArrow x1={ox} y1={oy - 5} x2={ox + sl} y2={oy - 5} label={`${lengthA}ft`} onClick={() => onDimensionClick?.("length")} />
          <DimensionArrow x1={ox - 5} y1={oy} x2={ox - 5} y2={oy + sw} label={`${widthA}ft`} onClick={() => onDimensionClick?.("width")} />
        </>
      )}
      <text x={ox + sl / 2} y={oy + sw / 2} textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="12" fontWeight="600" fontFamily="monospace">
        {areaLabel}
      </text>
    </svg>
  );
}

function CrossSectionView({
  results, input,
}: {
  results: SlabResults; input: SlabDesignInput;
}) {
  const totalDepth = results.layers.reduce((s, l) => s + l.depthIn, 0) || 6;
  const scale = 60 / totalDepth;
  let y = 10;

  return (
    <svg viewBox="0 0 460 80" className="w-full h-auto" role="img" aria-label="Concrete slab cross-section view">
      <rect x="0" y="0" width="460" height="80" fill="transparent" />
      {results.layers.map((layer, i) => {
        const h = Math.max(layer.depthIn * scale, 4);
        const yy = y;
        y += h;
        const colors: Record<string, string> = {
          "sub-base": "#c0b8a0",
          "vapor-barrier": "#4682b4",
          concrete: "#d0d0d0",
          sealer: "#88cc88",
        };
        const labels: Record<string, string> = {
          "sub-base": `${input.subBaseMaterial.replace("-", " ")} base ${input.subBaseDepth}"`,
          "vapor-barrier": `Vapor barrier ${Math.round(results.area * (1 + VAPOR_BARRIER_OVERLAP))} sq ft`,
          concrete: `Concrete ${input.thickness}"`,
          sealer: `Sealer ${input.finish}`,
        };
        return (
          <g key={layer.type}>
            <rect x="20" y={yy} width="400" height={h} fill={colors[layer.type] ?? "#eee"} stroke="#333" strokeWidth="0.5" />
            <text x="430" y={yy + h / 2} dominantBaseline="middle" fill="#444" fontSize="8" fontFamily="sans-serif">
              {labels[layer.type] ?? layer.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface ConcreteSlabDesignerProps {
  initialLength?: string;
  initialWidth?: string;
  initialThickness?: string;
  initialShape?: SlabShape;
  initialFinish?: FinishType;
  initialReinforcement?: ReinforcementType;
  projectId?: string;
  onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: any[]) => void;
}

function ConcreteSlabDesigner({
  initialLength, initialWidth, initialThickness,
  initialShape, initialFinish, initialReinforcement,
  projectId, onCalculate,
}: ConcreteSlabDesignerProps = {}) {
  const { t } = useI18n();
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shape, setShape] = useState<SlabShape>(() => (getUrlParam("shape", initialShape ?? "rect") as SlabShape));
  const [lengthA, setLengthA] = useState(() => getUrlParam("len", initialLength ?? "10"));
  const [widthA, setWidthA] = useState(() => getUrlParam("wid", initialWidth ?? "12"));
  const [lengthB, setLengthB] = useState(() => getUrlParam("lb", "6"));
  const [widthB, setWidthB] = useState(() => getUrlParam("wb", "4"));
  const [diameter, setDiameter] = useState(() => getUrlParam("dia", "10"));
  const [thickness, setThickness] = useState(() => getUrlParam("thk", initialThickness ?? "4"));
  const [subBaseMaterial, setSubBaseMaterial] = useState<SubBaseMaterial>(() => (getUrlParam("sub", "crushed-stone") as SubBaseMaterial));
  const [subBaseDepth, setSubBaseDepth] = useState(() => getUrlParam("sbd", "4"));
  const [reinforcement, setReinforcement] = useState<ReinforcementType>(() => (getUrlParam("reinf", initialReinforcement ?? "none") as ReinforcementType));
  const [rebarSize, setRebarSize] = useState<"#3" | "#4" | "#5">(() => (getUrlParam("rbs", "#4") as "#3" | "#4" | "#5"));
  const [rebarSpacing, setRebarSpacing] = useState(() => getUrlParam("rsp", "18"));
  const [finish, setFinish] = useState<FinishType>(() => (getUrlParam("fin", initialFinish ?? "broom") as FinishType));
  const [vaporBarrier, setVaporBarrier] = useState(() => getUrlParam("vb", false));
  const [wasteFactor, setWasteFactor] = useState(() => getUrlParam("waste", "10"));
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">(() => (getUrlParam("bag", "80lb") as "40lb" | "50lb" | "60lb" | "80lb"));
  const [showRebar, setShowRebar] = useState(true);
  const [showJoints, setShowJoints] = useState(true);

  const lengthRef = useRef<HTMLInputElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);
  const thicknessRef = useRef<HTMLInputElement>(null);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("concrete-slab-designer", "Concrete Slab & Patio Designer");

  const input: SlabDesignInput = {
    shape,
    lengthA: parseFloat(lengthA) || 0,
    widthA: parseFloat(widthA) || 0,
    lengthB: parseFloat(lengthB) || 0,
    widthB: parseFloat(widthB) || 0,
    diameter: parseFloat(diameter) || 0,
    thickness: parseFloat(thickness) || 4,
    subBaseMaterial,
    subBaseDepth: parseFloat(subBaseDepth) || 4,
    reinforcement,
    rebarSize,
    rebarSpacing: parseInt(rebarSpacing) || 18,
    finish,
    vaporBarrier,
    wasteFactor: parseFloat(wasteFactor) || 10,
    bagSize,
  };

  const results = computeSlab(input);

  const costItems = [
    {
      key: `concrete_${bagSize}_bag`,
      name: `${bagSize} Concrete Mix`,
      quantity: results.bagCount,
      unit: "bags",
      defaultPrice: bagSize === "80lb" ? 6.25 : bagSize === "60lb" ? 5.45 : bagSize === "50lb" ? 4.85 : 4.25,
    },
    ...(results.rebarGrid ? [
      {
        key: "rebar_stick_10ft",
        name: "Rebar #4 (10ft Stick)",
        quantity: results.rebarGrid.sticksCount * 2,
        unit: "sticks",
        defaultPrice: 8.50,
      }
    ] : []),
    ...(reinforcement === "mesh" ? [
      {
        key: "wire_mesh_roll",
        name: "Welded Wire Mesh (Roll)",
        quantity: Math.ceil(results.area / 500),
        unit: "rolls",
        defaultPrice: 115.00,
      }
    ] : []),
    {
      key: subBaseMaterial === "sand" ? "sand_ton" : "gravel_ton",
      name: subBaseMaterial === "sand" ? "Bedding Sand Base" : "Crushed Gravel Base",
      quantity: Math.ceil(computeSubBase(results.area, input.subBaseDepth, input.subBaseMaterial).tons),
      unit: "tons",
      defaultPrice: subBaseMaterial === "sand" ? 38.00 : 45.00,
    },
    ...(vaporBarrier ? [
      {
        key: "vapor_barrier_roll",
        name: "6mil Vapor Barrier (Roll)",
        quantity: Math.ceil((results.area * (1 + VAPOR_BARRIER_OVERLAP)) / 1000),
        unit: "rolls",
        defaultPrice: 75.00,
      }
    ] : []),
  ];


  useEffect(() => {
    if (onCalculate) {
      onCalculate(
        { shape, lengthA, widthA, thickness, reinforcement, finish },
        { area: results.area, volumeCuYd: results.volumeCuYd, bagCount: results.bagCount, weightLbs: results.weightLbs },
        results.materialList,
      );
    }
  }, [results.area, results.volumeCuYd, results.bagCount, results.weightLbs, results.materialList, onCalculate]);

  // Sync state to URL query params for shareable links
  useEffect(() => {
    setUrlParams(
      { shape, len: lengthA, wid: widthA, lb: lengthB, wb: widthB, dia: diameter,
        thk: thickness, sub: subBaseMaterial, sbd: subBaseDepth,
        reinf: reinforcement, rbs: rebarSize, rsp: rebarSpacing,
        fin: finish, vb: vaporBarrier, waste: wasteFactor, bag: bagSize },
      { shape: "rect", len: "10", wid: "12", lb: "6", wb: "4", dia: "10",
        thk: "4", sub: "crushed-stone", sbd: "4",
        reinf: "none", rbs: "#4", rsp: "18",
        fin: "broom", vb: false, waste: "10", bag: "80lb" },
    );
  }, [shape, lengthA, widthA, lengthB, widthB, diameter, thickness, subBaseMaterial,
    subBaseDepth, reinforcement, rebarSize, rebarSpacing, finish, vaporBarrier, wasteFactor, bagSize]);

  const handleDimensionClick = useCallback((dim: string) => {
    if (dim === "length") { lengthRef.current?.focus(); lengthRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }
    if (dim === "width") { widthRef.current?.focus(); widthRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }
    if (dim === "thickness") { thicknessRef.current?.focus(); thicknessRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }
  }, []);

  const projectInputs = { shape, length: input.lengthA, width: input.widthA, thickness: input.thickness };
  const projectResults = { area: results.area, volumeCuYd: results.volumeCuYd, bagCount: results.bagCount, weight: results.weightLbs };
  const projectMaterials = results.materialList;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* SVG Canvas Column */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Overhead Plan View</span>
            <div className="flex gap-2 text-xs">
              {input.reinforcement !== "none" && (
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={showRebar} onChange={(e) => setShowRebar(e.target.checked)} className="accent-[var(--accent)]" />
                  Rebar
                </label>
              )}
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={showJoints} onChange={(e) => setShowJoints(e.target.checked)} className="accent-[var(--accent)]" />
                Joints
              </label>
            </div>
          </div>
          <OverheadView
            shape={shape} lengthA={input.lengthA} widthA={input.widthA}
            lengthB={input.lengthB} widthB={input.widthB} diameter={input.diameter}
            rebarGrid={results.rebarGrid} showRebar={showRebar} showJoints={showJoints}
            controlJoints={results.controlJoints} results={results}
            onDimensionClick={handleDimensionClick}
          />
          <div className="flex gap-4 text-[10px] text-[var(--fg-muted)] mt-1 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#1c1917] inline-block" /> Slab Edge</span>
            {input.reinforcement !== "none" && showRebar && (
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#999] inline-block" /> Rebar Grid</span>
            )}
            {showJoints && (
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#dc2626] inline-block border-dashed" /> Control Joint</span>
            )}
          </div>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2 block">Cross-Section</span>
          <CrossSectionView results={results} input={input} />
        </Card>
      </div>

      {/* Controls Column */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Shape Selector */}
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Slab Shape</h3>
          <div className="flex gap-2">
            {(["rect", "l-shape", "circle"] as SlabShape[]).map((s) => (
              <button
                key={s} type="button"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  shape === s ? "bg-[var(--accent)] text-white shadow-sm" : "bg-[var(--bg-muted)] text-[var(--fg)] hover:bg-[var(--bg-inset)]"
                }`}
                onClick={() => setShape(s)}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d={SHAPE_ICONS[s]} />
                </svg>
                {s === "rect" ? "Rectangular" : s === "l-shape" ? "L-Shape" : "Circular"}
              </button>
            ))}
          </div>
        </Card>

        {/* Dimensions */}
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Dimensions</h3>
          <div className="grid grid-cols-2 gap-3">
            {shape !== "circle" ? (
              <>
                <Input ref={lengthRef} label="Length (ft)" name="length" type="number" inputMode="decimal"
                  value={lengthA} onChange={(e) => setLengthA(e.target.value)} min="0" step="any" />
                <Input ref={widthRef} label="Width (ft)" name="width" type="number" inputMode="decimal"
                  value={widthA} onChange={(e) => setWidthA(e.target.value)} min="0" step="any" />
              </>
            ) : (
              <div className="col-span-2">
                <Input label="Diameter (ft)" name="diameter" type="number" inputMode="decimal"
                  value={diameter} onChange={(e) => setDiameter(e.target.value)} min="0" step="any" />
              </div>
            )}
            <Input ref={thicknessRef} label="Thickness (in)" name="thickness" type="number" inputMode="decimal"
              value={thickness} onChange={(e) => setThickness(e.target.value)} min="2" max="48" step="0.5" />
            <div>
              <label className="text-xs font-medium text-[var(--fg-secondary)] mb-1.5 block">Waste: {wasteFactor}%</label>
              <input type="range" aria-label="Waste factor percentage" min="0" max="30" step="1"
                value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)}
                className="w-full h-1.5 bg-[var(--bg-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
            </div>
          </div>
        </Card>

        {/* Construction */}
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Construction</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--fg-secondary)] mb-1.5 block">Sub-base Material</label>
              <select value={subBaseMaterial} onChange={(e) => setSubBaseMaterial(e.target.value as SubBaseMaterial)}
                className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-2 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
                {(["gravel", "crushed-stone", "sand"] as SubBaseMaterial[]).map((m) => (
                  <option key={m} value={m}>{SUBBASE_LABELS[m]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--fg-secondary)] mb-1.5 block">Sub-base Depth: {subBaseDepth}"</label>
              <input type="range" aria-label="Sub-base depth" min="2" max="12" step="1"
                value={subBaseDepth} onChange={(e) => setSubBaseDepth(e.target.value)}
                className="w-full h-1.5 bg-[var(--bg-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--fg-secondary)] mb-1.5 block">Finish</label>
              <select value={finish} onChange={(e) => setFinish(e.target.value as FinishType)}
                className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-2 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
                {(["broom", "smooth", "stamped", "exposed", "colored"] as FinishType[]).map((f) => (
                  <option key={f} value={f}>{FINISH_LABELS[f]}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer self-end pb-1">
              <input type="checkbox" checked={vaporBarrier} onChange={(e) => setVaporBarrier(e.target.checked)}
                className="accent-[var(--accent)] w-4 h-4" />
              Vapor Barrier
            </label>
          </div>
        </Card>

        {/* Reinforcement */}
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Reinforcement</h3>
          <div className="flex gap-2 mb-3">
            {(["none", "mesh", "rebar"] as ReinforcementType[]).map((r) => (
              <button key={r} type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  reinforcement === r ? "bg-[var(--accent)] text-white shadow-sm" : "bg-[var(--bg-muted)] text-[var(--fg)] hover:bg-[var(--bg-inset)]"
                }`}
                onClick={() => setReinforcement(r)}
              >
                {r === "none" ? "None" : r === "mesh" ? "Wire Mesh" : "Rebar"}
              </button>
            ))}
          </div>
          {reinforcement === "rebar" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--fg-secondary)] mb-1.5 block">Bar Size</label>
                <select value={rebarSize} onChange={(e) => setRebarSize(e.target.value as "#3" | "#4" | "#5")}
                  className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-2 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
                  <option value="#3">#3 (3/8")</option>
                  <option value="#4">#4 (1/2")</option>
                  <option value="#5">#5 (5/8")</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--fg-secondary)] mb-1.5 block">Spacing: {rebarSpacing}" OC</label>
                <input type="range" aria-label="Rebar spacing" min="6" max="36" step="1"
                  value={rebarSpacing} onChange={(e) => setRebarSpacing(e.target.value)}
                  className="w-full h-1.5 bg-[var(--bg-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
              </div>
            </div>
          )}
        </Card>

        {/* Bag Size */}
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Bag Size</h3>
          <div className="flex gap-2">
            {(["80lb", "60lb", "50lb", "40lb"] as const).map((s) => (
              <button key={s} type="button"
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  bagSize === s ? "bg-[var(--accent)] text-white shadow-sm" : "bg-[var(--bg-muted)] text-[var(--fg)] hover:bg-[var(--bg-inset)]"
                }`}
                onClick={() => setBagSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        {/* Results */}
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Material Results</h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-inset)] p-3 rounded-lg">
                <span className="text-[10px] text-[var(--fg-muted)] block">Volume</span>
                <span className="text-xl font-bold tabular-nums">{results.volumeCuYd.toFixed(2)}</span>
                <span className="text-[10px] text-[var(--fg-muted)] ml-1">cu yd</span>
              </div>
              <div className="bg-[var(--bg-inset)] p-3 rounded-lg">
                <span className="text-[10px] text-[var(--fg-muted)] block">{bagSize} Bags</span>
                <span className="text-xl font-bold tabular-nums">{results.bagCount}</span>
                <span className="text-[10px] text-[var(--fg-muted)] ml-1">bags</span>
              </div>
              <div className="bg-[var(--bg-inset)] p-3 rounded-lg">
                <span className="text-[10px] text-[var(--fg-muted)] block">Area</span>
                <span className="text-xl font-bold tabular-nums">{results.area.toFixed(0)}</span>
                <span className="text-[10px] text-[var(--fg-muted)] ml-1">sq ft</span>
              </div>
              <div className="bg-[var(--bg-inset)] p-3 rounded-lg">
                <span className="text-[10px] text-[var(--fg-muted)] block">Weight</span>
                <span className="text-xl font-bold tabular-nums">{results.weightLbs.toFixed(0)}</span>
                <span className="text-[10px] text-[var(--fg-muted)] ml-1">lbs</span>
              </div>
            </div>

            {results.rebarGrid && (
              <div className="bg-[var(--bg-inset)] p-3 rounded-lg">
                <span className="text-[10px] text-[var(--fg-muted)] block">Rebar {results.rebarGrid.barSize}</span>
                <span className="text-lg font-bold tabular-nums">{results.rebarGrid.sticksCount}</span>
                <span className="text-[10px] text-[var(--fg-muted)] ml-1">sticks (20ft)</span>
                <span className="text-xs text-[var(--fg-muted)] ml-2">
                  {results.rebarGrid.totalLinearFt.toFixed(0)} linear ft
                </span>
              </div>
            )}

            <div className="text-xs text-[var(--fg-muted)] leading-relaxed space-y-1">
              <p>Control joints: {results.controlJoints.totalLinearFt.toFixed(0)} linear ft at {results.controlJoints.spacingX}ft spacing</p>
              <p>Sub-base: {computeSubBase(results.area, input.subBaseDepth, input.subBaseMaterial).volumeCuYd.toFixed(1)} cu yd ({input.subBaseMaterial})</p>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Shopping List</span>
              <div className="mt-2 space-y-1">
                {results.materialList.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs py-1">
                    <span className="text-[var(--fg)]">{item.name}</span>
                    <span className="text-[var(--fg-muted)] font-mono">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`https://www.lowes.com/search?searchTerm=concrete+mix+${bagSize}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center px-3 py-2 text-xs font-semibold rounded-lg bg-[#004990]/10 hover:bg-[#004990]/20 text-[#004990] transition-colors"
                >
                  Shop Lowe's
                </a>
                <a
                  href="/calculators/payload/"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--bg-inset)] text-[var(--fg)] transition-colors"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  Check Payload
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <button type="button" onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                  Print Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyShareUrl().then((ok) => {
                      if (ok) { setShareSuccess(true); setTimeout(() => setShareSuccess(false), 2000); }
                    });
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--bg-inset)] text-[var(--fg)] transition-colors"
                  aria-label="Copy shareable link"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  {shareSuccess ? "Copied!" : "Share"}
                </button>
                <div className="flex-1">
                  <AddToProjectCard
                    projects={projects}
                    onAdd={(pid) => { clearSuccess(); addToProject(pid, projectInputs, projectResults, projectMaterials); }}
                    successMessage={projectSuccess}
                  />
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[var(--fg-muted)] text-center pt-1">
              Est. material cost: ${results.totalCost.toFixed(0)} &middot; Ready-mix: ~${results.readyMixCost.toFixed(0)}
            </div>
          </div>
        </Card>

        <CostEstimatorWidget
          items={costItems}
          defaultLaborHours={Math.max(4, Math.round(results.bagCount / 10))}
        />

        {/* All Bag Sizes */}
        <Card>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">All Bag Sizes</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {results.bags.map((b) => (
              <div key={b.size} className="bg-[var(--bg-inset)] p-2 rounded-lg">
                <div className="font-bold text-sm">{b.count}</div>
                <div className="text-[var(--fg-muted)]">{b.size}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-xs text-[var(--fg-secondary)] leading-relaxed no-print">
          <span className="font-bold flex items-center gap-1.5 mb-1.5 text-[var(--fg)]">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Professional Verification Recommended
          </span>
          This is a planning and layout estimator tool. Load-bearing structural elements (including concrete footings, columns, and poured slabs) are subject to localized building codes, wind/snow loads, and soil conditions. Always verify specifications with a certified structural engineer or licensed contractor before purchase or installation.
        </div>
      </div>
    </div>
  );
}

export default withI18n<ConcreteSlabDesignerProps>(ConcreteSlabDesigner);
