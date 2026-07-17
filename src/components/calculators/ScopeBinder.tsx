import { useState, useEffect } from "react";
import {
  computeScope,
  scopeRoomToParams,
  scopeRoomFromParams,
  type ScopeRoom,
  type ScopeOpening,
  type ScopeFinish,
  type ScopeResult,
} from "../../lib/scopeEngine";
import { Card } from "../ui/Card";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

type SurfaceKey = "floor" | "walls" | "ceiling";
type MaterialKey = "paint" | "drywall" | "laminate" | "hardwood" | "carpet" | "tile" | "vinyl";

interface MaterialOption {
  key: MaterialKey;
  label: string;
  coverageSqFt: number;
  unitLabel: string;
  wastePercent: number;
}

const MATERIAL_OPTIONS: Record<SurfaceKey, MaterialOption[]> = {
  floor: [
    { key: "laminate", label: "Laminate", coverageSqFt: 1, unitLabel: "sq ft", wastePercent: 0.1 },
    { key: "hardwood", label: "Hardwood", coverageSqFt: 1, unitLabel: "sq ft", wastePercent: 0.1 },
    { key: "carpet", label: "Carpet", coverageSqFt: 1, unitLabel: "sq ft", wastePercent: 0.1 },
    { key: "tile", label: "Tile", coverageSqFt: 1, unitLabel: "sq ft", wastePercent: 0.15 },
    { key: "vinyl", label: "Vinyl", coverageSqFt: 1, unitLabel: "sq ft", wastePercent: 0.1 },
  ],
  walls: [
    { key: "paint", label: "Paint (1 coat)", coverageSqFt: 350, unitLabel: "gallons", wastePercent: 0.1 },
    { key: "drywall", label: "Drywall (4x8 sheets)", coverageSqFt: 32, unitLabel: "sheets", wastePercent: 0.1 },
  ],
  ceiling: [
    { key: "paint", label: "Paint (1 coat)", coverageSqFt: 350, unitLabel: "gallons", wastePercent: 0.1 },
    { key: "drywall", label: "Drywall (4x8 sheets)", coverageSqFt: 32, unitLabel: "sheets", wastePercent: 0.1 },
  ],
};

const MATERIAL_DEFAULTS: Record<string, { budget: number; mid: number; premium: number }> = {
  paint: { budget: 25, mid: 40, premium: 60 },
  drywall: { budget: 14, mid: 18, premium: 25 },
  laminate: { budget: 1.5, mid: 3, premium: 5 },
  hardwood: { budget: 4, mid: 7, premium: 12 },
  carpet: { budget: 2, mid: 3.5, premium: 6 },
  tile: { budget: 2, mid: 5, premium: 10 },
  vinyl: { budget: 1.5, mid: 3.5, premium: 6 },
};

const SURFACE_LABELS: Record<SurfaceKey, string> = {
  floor: "Floor",
  walls: "Walls",
  ceiling: "Ceiling",
};

function ScopeBinder() {
  useI18n();

  const [lengthFt, setLengthFt] = useState(12);
  const [widthFt, setWidthFt] = useState(10);
  const [heightFt, setHeightFt] = useState(8);
  const [doorCount, setDoorCount] = useState(1);
  const [windowCount, setWindowCount] = useState(1);
  const [quality, setQuality] = useState<"budget" | "mid" | "premium">("mid");

  const [floorMat, setFloorMat] = useState<MaterialKey>("laminate");
  const [wallsMat, setWallsMat] = useState<MaterialKey>("paint");
  const [ceilingMat, setCeilingMat] = useState<MaterialKey>("paint");

  const [floorUnitPrice, setFloorUnitPrice] = useState(MATERIAL_DEFAULTS.laminate.mid);
  const [wallsUnitPrice, setWallsUnitPrice] = useState(MATERIAL_DEFAULTS.paint.mid);
  const [ceilingUnitPrice, setCeilingUnitPrice] = useState(MATERIAL_DEFAULTS.paint.mid);

  const [shareSuccess, setShareSuccess] = useState(false);

  // Mount logic: read query params to restore state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const roomObj = scopeRoomFromParams(window.location.search);
      if (roomObj) {
        if (roomObj.lengthFt) setLengthFt(roomObj.lengthFt);
        if (roomObj.widthFt) setWidthFt(roomObj.widthFt);
        if (roomObj.heightFt) setHeightFt(roomObj.heightFt);
        const doors = roomObj.openings.find(o => o.type === "door")?.count ?? 0;
        setDoorCount(doors);
        const windows = roomObj.openings.find(o => o.type === "window")?.count ?? 0;
        setWindowCount(windows);
      }
    }
  }, []);

  // Update query params dynamically when room configuration changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.history.replaceState) {
      const ops: ScopeOpening[] = [];
      if (doorCount > 0) ops.push({ type: "door", count: doorCount });
      if (windowCount > 0) ops.push({ type: "window", count: windowCount });
      const params = scopeRoomToParams({ lengthFt, widthFt, heightFt, openings: ops });
      const newUrl = `${window.location.pathname}?${params}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [lengthFt, widthFt, heightFt, doorCount, windowCount]);

  useEffect(() => {
    setFloorUnitPrice(MATERIAL_DEFAULTS[floorMat][quality]);
  }, [floorMat, quality]);

  useEffect(() => {
    setWallsUnitPrice(MATERIAL_DEFAULTS[wallsMat][quality]);
  }, [wallsMat, quality]);

  useEffect(() => {
    setCeilingUnitPrice(MATERIAL_DEFAULTS[ceilingMat][quality]);
  }, [ceilingMat, quality]);

  const openings: ScopeOpening[] = [];
  if (doorCount > 0) openings.push({ type: "door", count: doorCount });
  if (windowCount > 0) openings.push({ type: "window", count: windowCount });

  const room: ScopeRoom = { lengthFt, widthFt, heightFt, openings };

  const floorOpt = MATERIAL_OPTIONS.floor.find((o) => o.key === floorMat)!;
  const wallsOpt = MATERIAL_OPTIONS.walls.find((o) => o.key === wallsMat)!;
  const ceilingOpt = MATERIAL_OPTIONS.ceiling.find((o) => o.key === ceilingMat)!;

  const finishes: ScopeFinish[] = [
    {
      surface: "floor",
      label: floorOpt.label,
      materialType: floorMat,
      unitPrice: floorUnitPrice,
      coverageSqFt: floorOpt.coverageSqFt,
      unitLabel: floorOpt.unitLabel,
      wastePercent: floorOpt.wastePercent,
    },
    {
      surface: "walls",
      label: wallsOpt.label,
      materialType: wallsMat,
      unitPrice: wallsUnitPrice,
      coverageSqFt: wallsOpt.coverageSqFt,
      unitLabel: wallsOpt.unitLabel,
      wastePercent: wallsOpt.wastePercent,
    },
    {
      surface: "ceiling",
      label: ceilingOpt.label,
      materialType: ceilingMat,
      unitPrice: ceilingUnitPrice,
      coverageSqFt: ceilingOpt.coverageSqFt,
      unitLabel: ceilingOpt.unitLabel,
      wastePercent: ceilingOpt.wastePercent,
    },
  ];

  const result: ScopeResult = computeScope(room, finishes);

  const sc = 14;
  const canvasW = Math.max(320, Math.min(600, (room.lengthFt + 4) * sc));
  const canvasH = Math.max(240, Math.min(500, (room.widthFt + 4) * sc));
  const xOff = (canvasW - room.lengthFt * sc) / 2;
  const yOff = (canvasH - room.widthFt * sc) / 2;

  const dimArrow = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string,
    horizontal: boolean
  ) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const off = horizontal ? 22 : 22;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--fg-muted)" strokeWidth={1} />
        <polygon points={horizontal
          ? `${x2-4},${y2-4} ${x2},${y2} ${x2-4},${y2+4}`
          : `${x2-4},${y2-4} ${x2},${y2} ${x2+4},${y2-4}`}
          fill="var(--fg-muted)" />
        <rect x={midX - (label.length * 3.5)} y={horizontal ? y1 - off - 6 : midY - 7}
          width={label.length * 7 + 8} height={14} rx={3}
          fill="var(--card-bg)" stroke="var(--border)" />
        <text x={midX} y={horizontal ? y1 - off + 4 : midY + 4}
          textAnchor="middle" fontSize={10} fill="var(--fg-secondary)"
          fontFamily="monospace">
          {label}
        </text>
      </g>
    );
  };

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2000);
        })
        .catch(() => {});
    }
  }

  const floorResult = result.surfaceResults.find((r) => r.surface === "floor");
  const wallsResult = result.surfaceResults.find((r) => r.surface === "walls");
  const ceilingResult = result.surfaceResults.find((r) => r.surface === "ceiling");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card className="p-4 flex flex-col gap-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center relative select-none">
            <div className="w-full flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
                Room Plan View
              </span>
              <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold">
                {room.lengthFt}&prime; &times; {room.widthFt}&prime;
              </span>
            </div>
            <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden">
              <svg viewBox={`0 0 ${canvasW} ${canvasH}`} className="w-full h-auto max-w-[600px]" role="img" aria-label={`Room plan ${room.lengthFt} by ${room.widthFt} feet`}>
                <g transform={`translate(${xOff}, ${yOff})`}>
                  <rect x={0} y={0} width={room.lengthFt * sc} height={room.widthFt * sc}
                    fill="var(--bg-subtle)" stroke="var(--fg)" strokeWidth={1.5} rx={2} />

                  {[1, 2, 3].includes(doorCount) && (
                    <g transform={`translate(${room.lengthFt * sc * 0.25}, ${room.widthFt * sc - 2})`}>
                      <rect x={0} y={0} width={sc * 1.5} height={4} rx={1} fill="var(--accent)" />
                      <path d={`M ${sc * 0.75} ${4} Q ${sc * 0.75} ${sc * 2} ${-sc * 1.5} ${sc * 2}`}
                        fill="none" stroke="var(--accent)" strokeWidth={1} strokeDasharray="2 2" />
                    </g>
                  )}

                  {[1, 2, 3].includes(windowCount) && (
                    <g transform={`translate(${room.lengthFt * sc * 0.6}, -2)`}>
                      <rect x={0} y={-6} width={sc * 1.8} height={6} rx={1} fill="var(--primary)" opacity={0.6} />
                    </g>
                  )}

                  <text x={room.lengthFt * sc / 2} y={room.widthFt * sc / 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={12} fill="var(--fg-muted)" fontFamily="monospace">
                    {room.lengthFt}&prime; x {room.widthFt}&prime; x {room.heightFt}&prime;
                  </text>
                </g>

                {dimArrow(0, yOff + room.widthFt * sc + 6, room.lengthFt * sc, yOff + room.widthFt * sc + 6, `${room.lengthFt} ft`, true)}

                {dimArrow(xOff + room.lengthFt * sc + 6, yOff, xOff + room.lengthFt * sc + 6, yOff + room.widthFt * sc, `${room.widthFt} ft`, false)}
              </svg>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--fg-muted)]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-[var(--accent)] rounded inline-block" /> Door
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-[var(--primary)] opacity-60 rounded inline-block" /> Window
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-[var(--fg)] rounded inline-block" /> Wall
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[var(--fg)]">Room Dimensions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-[var(--fg-secondary)]">Length (ft)</span>
              <input type="number" min={1} max={60} value={lengthFt}
                onChange={(e) => setLengthFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-[var(--fg-secondary)]">Width (ft)</span>
              <input type="number" min={1} max={60} value={widthFt}
                onChange={(e) => setWidthFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-[var(--fg-secondary)]">Height (ft)</span>
              <input type="number" min={1} max={20} value={heightFt}
                onChange={(e) => setHeightFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-[var(--fg-secondary)]">Doors</span>
              <select value={doorCount} onChange={(e) => setDoorCount(parseInt(e.target.value))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium">
                <option value={0}>None</option>
                <option value={1}>1 Door</option>
                <option value={2}>2 Doors</option>
                <option value={3}>3 Doors</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-[var(--fg-secondary)]">Windows</span>
              <select value={windowCount} onChange={(e) => setWindowCount(parseInt(e.target.value))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium">
                <option value={0}>None</option>
                <option value={1}>1 Window</option>
                <option value={2}>2 Windows</option>
                <option value={3}>3 Windows</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[var(--fg)]">Materials & Finishes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]">
              <span className="font-bold text-[var(--fg)]">Floor</span>
              <select value={floorMat} onChange={(e) => setFloorMat(e.target.value as MaterialKey)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium">
                {MATERIAL_OPTIONS.floor.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              <input type="number" min={0} step={0.5} value={floorUnitPrice}
                onChange={(e) => setFloorUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
                placeholder="$/unit" />
              <span className="text-[10px] text-[var(--fg-muted)]">{floorOpt.unitLabel}</span>
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]">
              <span className="font-bold text-[var(--fg)]">Walls</span>
              <select value={wallsMat} onChange={(e) => setWallsMat(e.target.value as MaterialKey)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium">
                {MATERIAL_OPTIONS.walls.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              <input type="number" min={0} step={0.5} value={wallsUnitPrice}
                onChange={(e) => setWallsUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
                placeholder="$/unit" />
              <span className="text-[10px] text-[var(--fg-muted)]">{wallsOpt.unitLabel}</span>
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]">
              <span className="font-bold text-[var(--fg)]">Ceiling</span>
              <select value={ceilingMat} onChange={(e) => setCeilingMat(e.target.value as MaterialKey)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium">
                {MATERIAL_OPTIONS.ceiling.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              <input type="number" min={0} step={0.5} value={ceilingUnitPrice}
                onChange={(e) => setCeilingUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
                placeholder="$/unit" />
              <span className="text-[10px] text-[var(--fg-muted)]">{ceilingOpt.unitLabel}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-[var(--fg-secondary)]">Quality Tier</span>
            <div className="flex gap-2">
              {(["budget", "mid", "premium"] as const).map((tier) => (
                <button key={tier} onClick={() => setQuality(tier)}
                  className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs border cursor-pointer transition-all ${
                    quality === tier
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--bg)] text-[var(--fg-secondary)] border-[var(--border)] hover:border-[var(--accent)]"
                  }`}>
                  {tier === "budget" ? "Budget" : tier === "mid" ? "Mid-Range" : "Premium"}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[var(--fg)]">Material Budget</h3>
          <div className="flex flex-col gap-3">
            {[floorResult, wallsResult, ceilingResult].filter(Boolean).map((res) => {
              if (!res) return null;
              return (
                <div key={res.surface} className="border border-[var(--border)] rounded-lg p-3 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[var(--fg)] uppercase tracking-wider">{SURFACE_LABELS[res.surface as SurfaceKey]}</span>
                    <span className="text-[10px] text-[var(--fg-muted)]">{res.label}</span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--fg-secondary)]">
                    <span>Area</span>
                    <span className="font-mono">{res.netArea} sq ft</span>
                  </div>
                  {res.wasteAmount > 0 && (
                    <div className="flex justify-between items-center text-[var(--fg-secondary)]">
                      <span>+ Waste</span>
                      <span className="font-mono">{Math.round(res.wasteAmount)} sq ft</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[var(--fg-secondary)]">
                    <span>Quantity</span>
                    <span className="font-mono">{res.materialQuantity} {res.surface === "floor" ? "sq ft" : res.packagingCount > 0 ? `${res.packagingCount} ${res.surface === "walls" && wallsMat === "paint" ? "gallons" : wallsMat === "drywall" ? "sheets" : "units"}` : "units"}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-[var(--fg)] mt-2 pt-2 border-t border-[var(--border)]">
                    <span>Cost</span>
                    <span>${res.materialCost.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
            <span className="text-sm font-bold text-[var(--fg)]">Total Material Cost</span>
            <span className="text-xl font-black text-[var(--accent)]">${result.totalMaterialCost.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col gap-3 text-xs">
          <h4 className="font-bold text-[var(--fg)] text-xs uppercase tracking-wider">Room Summary</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-subtle)] rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-[var(--fg-muted)]">Floor Area</span>
              <span className="font-bold text-[var(--fg)]">{room.lengthFt * room.widthFt} sq ft</span>
            </div>
            <div className="bg-[var(--bg-subtle)] rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-[var(--fg-muted)]">Wall Area</span>
              <span className="font-bold text-[var(--fg)]">{(result.surfaceResults.find(r => r.surface === "walls")?.grossArea || 0).toFixed(0)} sq ft</span>
            </div>
            <div className="bg-[var(--bg-subtle)] rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-[var(--fg-muted)]">Openings</span>
              <span className="font-bold text-[var(--fg)]">{doorCount + windowCount} ({doorCount} door{doorCount !== 1 ? "s" : ""}, {windowCount} window{windowCount !== 1 ? "s" : ""})</span>
            </div>
            <div className="bg-[var(--bg-subtle)] rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-[var(--fg-muted)]">Net Surfacing</span>
              <span className="font-bold text-[var(--fg)]">{result.totalNetArea.toFixed(0)} sq ft</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl p-4 gap-4 text-xs no-print">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[var(--fg)]">Share or Save</span>
            <span className="text-[var(--fg-secondary)]">Copy your plan link or print the budget binder.</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleShare}
              className="bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--fg)] font-bold px-4 py-2 rounded-lg text-center transition-all cursor-pointer min-w-32">
              {shareSuccess ? "Copied!" : "Copy Plan Link"}
            </button>
            <button onClick={() => window.print()}
              className="bg-[var(--accent)] hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-center transition-all cursor-pointer">
              Print Binder
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col gap-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
          <p className="font-semibold text-[var(--fg)]">Planning Estimates Only</p>
          <p>
            This budget binder provides material quantity estimates based on your room dimensions. Actual material needs vary by product specifications, installation method, and site conditions. Always verify quantities with your supplier before purchasing. Prices shown are estimates based on national averages for {quality}-range materials.
          </p>
          <p className="text-[var(--fg-muted)]">
            Reviewed by <strong>Marcus Vance, DIY Construction Specialist</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default withI18n(ScopeBinder);
