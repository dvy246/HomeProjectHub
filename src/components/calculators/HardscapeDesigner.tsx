import { useState, useCallback, useRef, useId, useEffect } from "react";
import { Card } from "../ui/Card";
import {
  type HardscapeElement,
  type ElementType,
  type MaterialLineItem,
  PAVER_PRESETS,
  PAVER_PATTERNS,
  getElementDefault,
  aggregateMaterials,
  getTotalWeight,
  getTotalCost,
  calculateAreaSqFt,
  calculatePerimeterFt,
} from "../../lib/hardscapeEngine";
import CostEstimatorWidget, { type CostItem } from "../ui/CostEstimatorWidget";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";
import { withI18n } from "../i18n/withI18n";

const ELEMENT_COLORS: Record<ElementType, string> = {
  "patio": "#d4d4d8",
  "walkway": "#a1a1aa",
  "fire-pit": "#fb923c",
  "retaining-wall": "#78716c",
  "garden-bed": "#86efac",
};

const ELEMENT_LABELS: Record<ElementType, string> = {
  "patio": "Patio",
  "walkway": "Walkway",
  "fire-pit": "Fire Pit",
  "retaining-wall": "Retaining Wall",
  "garden-bed": "Garden Bed",
};

const CANVAS_SIZE = 360;
const PADDING = 20;
const ELEMENT_STROKE = "#1c1917";
const PROPERTY_STROKE = "#78716c";
const ACCENT = "#ea580c";

function HardscapeDesigner() {
  const [shareSuccess, setShareSuccess] = useState(false);
  const [propertyW, setPropertyW] = useState(() => getUrlParam("pw", 24));
  const [propertyD, setPropertyD] = useState(() => getUrlParam("pd", 30));
  const [elements, setElements] = useState<HardscapeElement[]>(() => {
    const raw = getUrlParam("el", "");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        try {
          return JSON.parse(decodeURIComponent(raw));
        } catch (e2) {}
      }
    }
    return [
      getElementDefault("patio", 1),
      getElementDefault("fire-pit", 1),
      getElementDefault("garden-bed", 1),
    ];
  });

  const nextId = useRef(elements.reduce((max, el) => {
    const parts = el.id.split("-");
    const num = parseInt(parts[parts.length - 1], 10);
    return Math.max(max, isNaN(num) ? 0 : num);
  }, 0) + 1);
  const patternId = useId();

  // Sync state parameters to URL query string for shareable layout links
  useEffect(() => {
    setUrlParams(
      { pw: propertyW, pd: propertyD, el: JSON.stringify(elements) },
      {
        pw: 24,
        pd: 30,
        el: JSON.stringify([
          getElementDefault("patio", 1),
          getElementDefault("fire-pit", 1),
          getElementDefault("garden-bed", 1),
        ])
      }
    );
  }, [propertyW, propertyD, elements]);

  const scale = Math.min((CANVAS_SIZE - PADDING * 2) / propertyW, (CANVAS_SIZE - PADDING * 2) / propertyD);
  const xOffset = (CANVAS_SIZE - propertyW * scale) / 2;
  const yOffset = (CANVAS_SIZE - propertyD * scale) / 2;

  const addElement = useCallback((type: ElementType) => {
    nextId.current++;
    setElements(prev => [...prev, getElementDefault(type, nextId.current)]);
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
  }, []);

  const updateElement = useCallback((id: string, patch: Partial<HardscapeElement>) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      const updated = { ...el, ...patch };
      const elementDepth = updated.type === "retaining-wall"
        ? (updated.wallHeight ?? 2)
        : (updated.type === "fire-pit" ? updated.diameter : updated.depth);
      const maxX = Math.max(0, propertyW - (updated.type === "fire-pit" ? updated.diameter : updated.width));
      const maxY = Math.max(0, propertyD - elementDepth);
      return { ...updated, x: Math.max(0, Math.min(updated.x, maxX)), y: Math.max(0, Math.min(updated.y, maxY)) };
    }));
  }, [propertyW, propertyD]);

  const materials: MaterialLineItem[] = aggregateMaterials(elements);
  const totalWeight = getTotalWeight(materials);
  const totalCost = getTotalCost(materials);

  // Derived totals for cost estimator
  const pavedElements = elements.filter(el => el.type === "patio" || el.type === "walkway");
  const totalPavedSqFt = pavedElements.reduce((s, el) => s + calculateAreaSqFt(el), 0);
  const totalGravelSqFt = totalPavedSqFt; // 4" gravel base under paved areas
  const totalSandSqFt = totalPavedSqFt;   // 1" sand bed under paved areas
  const totalEdgingLf = pavedElements.reduce((s, el) => s + calculatePerimeterFt(el), 0);
  const totalAreaSqFt = elements.reduce((s, el) => s + calculateAreaSqFt(el), 0);

  const renderSvgElement = (el: HardscapeElement) => {
    const isFirePit = el.type === "fire-pit" && el.diameter > 0;
    const elementWidth = isFirePit ? el.diameter : el.width;
    const elementDepth = el.type === "retaining-wall" ? (el.wallHeight ?? 2) : (isFirePit ? el.diameter : el.depth);

    const sx = el.x * scale + xOffset;
    const sy = el.y * scale + yOffset;
    const sw = elementWidth * scale;
    const sd = elementDepth * scale;
    const color = ELEMENT_COLORS[el.type];

    if (isFirePit) {
      const cx = sx + sw / 2;
      const cy = sy + sd / 2;
      const r = sw / 2;
      return (
        <g key={el.id}>
          <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity="0.6" stroke={ELEMENT_STROKE} strokeWidth="1.5" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill={ELEMENT_STROKE}>{el.label}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill={ELEMENT_STROKE} fillOpacity="0.7">{el.diameter}&prime; dia</text>
        </g>
      );
    }

    return (
      <g key={el.id}>
        <rect x={sx} y={sy} width={sw} height={sd} rx="3" fill={color} fillOpacity="0.6" stroke={ELEMENT_STROKE} strokeWidth="1.5" />
        <text x={sx + sw / 2} y={sy + sd / 2} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill={ELEMENT_STROKE}>{el.label}</text>
        {el.type === "retaining-wall" && (
          <>
            <line x1={sx + sw} y1={sy} x2={sx + sw} y2={sy + sd} stroke={ACCENT} strokeWidth="2" strokeDasharray="3,2" />
            <text x={sx + sw + (CANVAS_SIZE - sx - sw > 30 ? 10 : -10)} y={sy + sd / 2} textAnchor="start" fontSize="6" fill={ACCENT} fontWeight="bold">{(el.wallHeight ?? 2)}&prime; wall</text>
            <text x={sx + sw / 2} y={sy + sd + 10} textAnchor="middle" fontSize="6" fill={ACCENT} fontWeight="bold">{el.width}&prime; length</text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* SVG Canvas */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center relative select-none">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              Hardscape Layout Canvas
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold">
              {elements.length} element{elements.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden">
            <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} role="img" aria-label="Hardscape Layout Canvas" className="w-full h-auto max-w-[360px] overflow-visible">
              <defs>
                <pattern id={patternId} width={scale} height={scale} patternUnits="userSpaceOnUse" patternTransform={`translate(${xOffset}, ${yOffset})`}>
                  <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="var(--border)" strokeWidth="0.5" strokeOpacity="0.3" />
                </pattern>
              </defs>

              <rect x={xOffset} y={yOffset} width={propertyW * scale} height={propertyD * scale} fill={`url(#${patternId})`} />

              <rect x={xOffset} y={yOffset} width={propertyW * scale} height={propertyD * scale} fill="none" stroke={PROPERTY_STROKE} strokeWidth="2" strokeDasharray="6,3" rx="2" />

              {elements.map(el => renderSvgElement(el))}

              <g transform={`translate(${xOffset}, ${yOffset + propertyD * scale + 12})`}>
                <line x1="0" y1="0" x2={propertyW * scale} y2="0" stroke={ACCENT} strokeWidth="1" />
                <polygon points="0,0 4,-3 4,3" fill={ACCENT} />
                <polygon points={`${propertyW * scale},0 ${propertyW * scale - 4},-3 ${propertyW * scale - 4},3`} fill={ACCENT} />
                <rect x={propertyW * scale / 2 - 15} y="-8" width="30" height="14" fill="var(--bg-inset)" rx="2" />
                <text x={propertyW * scale / 2} y="2" fill={ACCENT} fontSize="9" fontWeight="bold" textAnchor="middle">{propertyW}&prime;</text>
              </g>

              <g transform={`translate(${xOffset - 15}, ${yOffset})`}>
                <line x1="0" y1="0" x2="0" y2={propertyD * scale} stroke={ACCENT} strokeWidth="1" />
                <polygon points="0,0 -3,4 3,4" fill={ACCENT} />
                <polygon points={`0,${propertyD * scale} -3,${propertyD * scale - 4} 3,${propertyD * scale - 4}`} fill={ACCENT} />
                <rect x="-15" y={propertyD * scale / 2 - 8} width="30" height="14" fill="var(--bg-inset)" rx="2" />
                <text x="0" y={propertyD * scale / 2 + 2} fill={ACCENT} fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 0 ${propertyD * scale / 2})`}>{propertyD}&prime;</text>
              </g>
            </svg>
          </div>

          <div className="w-full mt-3 flex flex-wrap gap-3 items-center justify-center text-[10px] text-[var(--fg-secondary)] bg-[var(--bg-inset)] p-2.5 rounded-lg border border-[var(--border)] font-medium">
            {(Object.entries(ELEMENT_COLORS) as [ElementType, string][]).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span className="w-4 h-3 rounded border border-[var(--border-strong)] inline-block" style={{ backgroundColor: color, opacity: 0.6 }} />
                {ELEMENT_LABELS[type]}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded border border-dashed border-[var(--border-strong)] inline-block" />
              Property Line
            </span>
          </div>
        </div>

        {/* Property Controls */}
        <Card className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Configure Property Dimensions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--fg-secondary)]">Property Width (ft)</span>
                <span className="font-bold text-[var(--accent)] font-mono">{propertyW}&prime;</span>
              </div>
              <input type="range" min="10" max="60" value={propertyW} onChange={e => setPropertyW(parseInt(e.target.value, 10))} className="w-full accent-[var(--accent)] cursor-pointer" aria-label="Property Width" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--fg-secondary)]">Property Depth (ft)</span>
                <span className="font-bold text-[var(--accent)] font-mono">{propertyD}&prime;</span>
              </div>
              <input type="range" min="10" max="60" value={propertyD} onChange={e => setPropertyD(parseInt(e.target.value, 10))} className="w-full accent-[var(--accent)] cursor-pointer" aria-label="Property Depth" />
            </div>
          </div>
        </Card>

        {/* Element Add Toolbar */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Add Hardscape Elements</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(ELEMENT_LABELS) as [ElementType, string][]).map(([type, label]) => (
              <button key={type} type="button" onClick={() => addElement(type)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: ELEMENT_COLORS[type], opacity: 0.6 }} />
                + {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Element Edit List */}
        {elements.map((el) => (
          <Card key={el.id} className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: ELEMENT_COLORS[el.type], opacity: 0.6 }} />
                <h4 className="text-xs font-bold text-[var(--fg)]">{el.label}</h4>
                <span className="text-[10px] text-[var(--fg-muted)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded border border-[var(--border)]">{ELEMENT_LABELS[el.type]}</span>
              </div>
              <button type="button" onClick={() => removeElement(el.id)}
                className="text-[10px] text-[var(--fg-muted)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] px-2 py-0.5 rounded transition-all cursor-pointer"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="flex flex-col gap-1">
                <span className="text-[var(--fg-muted)] font-medium">Label</span>
                <input type="text" value={el.label} onChange={e => updateElement(el.id, { label: e.target.value })}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Element label" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--fg-muted)] font-medium">Position X (ft)</span>
                <input type="number" min="0" value={el.x} onChange={e => {
                  const v = Math.max(0, parseFloat(e.target.value) || 0);
                  updateElement(el.id, { x: v });
                }} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Position X" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[var(--fg-muted)] font-medium">Position Y (ft)</span>
                <input type="number" min="0" value={el.y} onChange={e => {
                  const v = Math.max(0, parseFloat(e.target.value) || 0);
                  updateElement(el.id, { y: v });
                }} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Position Y" />
              </div>
              {el.type === "fire-pit" ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--fg-muted)] font-medium">Diameter (ft)</span>
                  <input type="number" min="2" max="12" step="0.5" value={el.diameter} onChange={e => {
                    const v = Math.max(2, Math.min(parseFloat(e.target.value) || 4, 12));
                    updateElement(el.id, { diameter: v });
                  }} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Fire pit diameter" />
                </div>
              ) : el.type === "retaining-wall" ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--fg-muted)] font-medium">Wall Height (ft)</span>
                  <input type="number" min="1" max="6" step="0.5" value={el.wallHeight ?? 2} onChange={e => {
                    const v = Math.max(1, Math.min(parseFloat(e.target.value) || 2, 6));
                    updateElement(el.id, { wallHeight: v });
                  }} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Wall height" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--fg-muted)] font-medium">Width (ft)</span>
                    <input type="number" min="2" value={el.width} onChange={e => {
                      const v = Math.max(2, parseFloat(e.target.value) || 2);
                      updateElement(el.id, { width: v });
                    }} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Element width" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--fg-muted)] font-medium">Depth (ft)</span>
                    <input type="number" min="2" value={el.depth} onChange={e => {
                      const v = Math.max(2, parseFloat(e.target.value) || 2);
                      updateElement(el.id, { depth: v });
                    }} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Element depth" />
                  </div>
                </>
              )}
              {el.type === "retaining-wall" && (
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--fg-muted)] font-medium">Wall Length (ft)</span>
                  <input type="number" min="2" value={el.width} onChange={e => {
                    const v = Math.max(2, parseFloat(e.target.value) || 2);
                    updateElement(el.id, { width: v });
                  }} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Wall length" />
                </div>
              )}
            </div>

            {(el.type === "patio" || el.type === "walkway") && (
              <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-[var(--border)] pt-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--fg-muted)] font-medium">Paver Size</span>
                  <select value={el.paverPreset || "12x12"} onChange={e => updateElement(el.id, { paverPreset: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Paver size">
                    {Object.entries(PAVER_PRESETS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--fg-muted)] font-medium">Pattern</span>
                  <select value={el.paverPattern || "running-bond"} onChange={e => updateElement(el.id, { paverPattern: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium" aria-label="Paver pattern">
                    {Object.entries(PAVER_PATTERNS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label} ({(v.wasteFactor * 100).toFixed(0)}% waste)</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {el.type === "garden-bed" && (
              <div className="flex flex-col gap-1 text-[11px] border-t border-[var(--border)] pt-3">
                <span className="text-[var(--fg-muted)] font-medium">Fill Material</span>
                <input type="text" value="Decorative Gravel / Mulch (3 in)" disabled
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-xs font-medium opacity-70" aria-label="Fill material" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Material Breakdown Sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-6 flex flex-col gap-5">
          <div className="border-b border-[var(--border)] pb-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--fg)]">Live Material List</h3>
            <div className="flex gap-2 items-center no-print">
              <button type="button" onClick={() => window.print()}
                className="text-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
              >
                Print Blueprint
              </button>
              <button
                type="button"
                onClick={() => {
                  copyShareUrl().then((ok) => {
                    if (ok) {
                      setShareSuccess(true);
                      setTimeout(() => setShareSuccess(false), 2000);
                    }
                  });
                }}
                className="text-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                aria-label="Copy shareable link"
              >
                {shareSuccess ? "Copied!" : "Share"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg p-3 flex flex-col gap-0.5">
              <span className="text-[var(--fg-muted)] text-[10px] font-medium">Total Elements</span>
              <span className="text-lg font-bold text-[var(--fg)] tabular-nums">{elements.length}</span>
            </div>
            <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg p-3 flex flex-col gap-0.5">
              <span className="text-[var(--fg-muted)] text-[10px] font-medium">Total Area</span>
              <span className="text-lg font-bold text-[var(--fg)] tabular-nums">
                {elements.reduce((s, e) => s + calculateAreaSqFt(e), 0).toFixed(0)} sq ft
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs leading-relaxed max-h-[320px] overflow-y-auto">
            {materials.length === 0 ? (
              <div className="text-[var(--fg-muted)] text-center py-6">Add elements to see materials</div>
            ) : (
              materials.map((item) => (
                <div key={item.name} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-b-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-[var(--fg)]">{item.name}</span>
                    <span className="text-[10px] text-[var(--fg-muted)]">
                      {item.quantity} {item.unit}
                      {item.notes ? ` - ${item.notes}` : ""}
                    </span>
                  </div>
                  <span className="font-bold text-[var(--fg)] tabular-nums whitespace-nowrap">{item.weightLbs.toLocaleString()} lbs</span>
                </div>
              ))
            )}
          </div>

          <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-4 text-xs flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--fg-secondary)]">Total Material Weight</span>
              <span className="text-sm font-black text-[var(--accent)] tabular-nums">{totalWeight.toLocaleString()} lbs</span>
            </div>
            <div className="flex justify-between items-center border-t border-[var(--border)] pt-2">
              <span className="font-bold text-[var(--fg-secondary)]">Estimated Material Cost</span>
              <span className="text-sm font-black text-[var(--fg)] tabular-nums">${totalCost.toLocaleString()}</span>
            </div>
            <div className="border-t border-[var(--border)] pt-2 flex justify-between items-center">
              <span className="font-bold text-[var(--fg-secondary)]">Est. Weight in Tons</span>
              <span className="text-sm font-bold text-[var(--fg)] tabular-nums">{(totalWeight / 2000).toFixed(1)} tons</span>
            </div>
          </div>

          {/* Cost Estimator Widget */}
          <CostEstimatorWidget
            items={[
              {
                key: "hardscape_paver_sqft",
                name: "Pavers",
                quantity: Math.round(totalPavedSqFt * 10) / 10,
                unit: "sq ft",
                defaultPrice: 2.50,
              },
              {
                key: "hardscape_gravel_sqft",
                name: "Sub-base Gravel (4\")",
                quantity: Math.round(totalGravelSqFt * 10) / 10,
                unit: "sq ft",
                defaultPrice: 0.80,
              },
              {
                key: "hardscape_sand_sqft",
                name: "Sand Bedding (1\")",
                quantity: Math.round(totalSandSqFt * 10) / 10,
                unit: "sq ft",
                defaultPrice: 0.40,
              },
              {
                key: "hardscape_edging_lf",
                name: "Edge Restraints",
                quantity: Math.round(totalEdgingLf * 10) / 10,
                unit: "lf",
                defaultPrice: 1.50,
              },
            ] satisfies CostItem[]}
            defaultLaborHours={Math.max(4, Math.round(totalAreaSqFt / 25))}
          />

          <a href={`/calculators/payload/?weight=${totalWeight}&material=hardscape`}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-sm text-center no-print"
          >
            Check Vehicle Payload Safety & Trips &rarr;
          </a>

          <div className="grid grid-cols-2 gap-2 no-print">
            <button type="button" onClick={() => {
              const data = { elements, propertyW, propertyD, materials, totalWeight, totalCost };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `hardscape-blueprint-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
              className="px-3 py-2 text-[10px] font-semibold rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] transition-all cursor-pointer"
            >
              Save Blueprint
            </button>
            <button type="button" onClick={() => window.print()}
              className="px-3 py-2 text-[10px] font-semibold rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] transition-all cursor-pointer"
            >
              Print PDF
            </button>
          </div>

          <div className="border-l-4 border-l-[var(--warning)] bg-[var(--bg-subtle)] p-3 rounded-r-lg text-[10px] leading-relaxed text-[var(--fg-secondary)]">
            <strong>NOTICE:</strong> Hardscape estimates are for planning purposes only. Base depths, compaction requirements, soil conditions, and retaining wall drainage must be verified by a qualified professional. Always contact local building departments for permit requirements and frost depth specifications before construction.
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(HardscapeDesigner);
