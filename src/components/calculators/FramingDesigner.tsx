import React, { useState, useEffect } from "react";
import { calculateFraming, decimalToFraction, type FramingOpening, type FramingDimensions, type FramingResult } from "../../lib/framingEngine";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { useProjects } from "../../lib/useProjects";
import AddToProjectCard from "../ui/AddToProjectCard";
import CostEstimatorWidget from "../ui/CostEstimatorWidget";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

interface FramingDesignerProps {
  initialLength?: number;
  initialHeight?: number;
  initialStudSpacing?: number;
  initialStudSize?: "2x4" | "2x6";
  initialHeaderSize?: "2x6" | "2x8" | "2x10" | "2x12";
  initialWastePercent?: number;
  initialOpenings?: FramingOpening[];
}

function FramingDesigner({
  initialLength,
  initialHeight,
  initialStudSpacing,
  initialStudSize,
  initialHeaderSize,
  initialWastePercent,
  initialOpenings,
}: FramingDesignerProps = {}) {
  const { t } = useI18n();
  const [shareSuccess, setShareSuccess] = useState(false);

  // Wall Dimensions
  const [wallLengthFt, setWallLengthFt] = useState<number>(() => getUrlParam("len", initialLength ?? 12));
  const [wallHeightFt, setWallHeightFt] = useState<number>(() => getUrlParam("hgt", initialHeight ?? 8));
  const [studSpacingIn, setStudSpacingIn] = useState<number>(() => getUrlParam("spc", initialStudSpacing ?? 16));
  const [studSize, setStudSize] = useState<"2x4" | "2x6">(() => getUrlParam("sz", initialStudSize ?? "2x4") as "2x4" | "2x6");
  const [headerSize, setHeaderSize] = useState<"2x6" | "2x8" | "2x10" | "2x12">(() => getUrlParam("hsz", initialHeaderSize ?? "2x10") as "2x6" | "2x8" | "2x10" | "2x12");
  const [wastePercent, setWastePercent] = useState<number>(() => getUrlParam("wst", initialWastePercent ?? 10));

  // Local string inputs to avoid clamping snapping while typing
  const [wallLengthInput, setWallLengthInput] = useState(String(wallLengthFt));
  const [wallHeightInput, setWallHeightInput] = useState(String(wallHeightFt));
  const [wastePercentInput, setWastePercentInput] = useState(String(wastePercent));

  useEffect(() => {
    setWallLengthInput(String(wallLengthFt));
  }, [wallLengthFt]);

  useEffect(() => {
    setWallHeightInput(String(wallHeightFt));
  }, [wallHeightFt]);

  useEffect(() => {
    setWastePercentInput(String(wastePercent));
  }, [wastePercent]);

  // Openings List (doors, windows)
  const [openings, setOpenings] = useState<FramingOpening[]>(() => {
    const raw = getUrlParam("ops", "");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        try {
          return JSON.parse(decodeURIComponent(raw));
        } catch (e2) {}
      }
    }
    return initialOpenings ?? [
      { id: "op-1", name: "Window 1", type: "window", width: 36, height: 48, x: 24, y: 36 },
      { id: "op-2", name: "Door 1", type: "door", width: 32, height: 80, x: 80, y: 0 }
    ];
  });

  // Form states for adding a new opening (kept as strings to avoid typing friction)
  const [newType, setNewType] = useState<"window" | "door">("window");
  const [newWidth, setNewWidth] = useState<string>("36");
  const [newHeight, setNewHeight] = useState<string>("48");
  const [newX, setNewX] = useState<string>("48");
  const [newY, setNewY] = useState<string>("36");
  const [formError, setFormError] = useState<string>("");

  // Project persistence
  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects(
    "framing-designer",
    "Interactive Wall Framing & Cut-List Designer"
  );

  // Auto reset opening Y offset to 0 if door is chosen
  useEffect(() => {
    if (newType === "door") {
      setNewY("0");
      setNewHeight("80");
    } else {
      setNewHeight("48");
      setNewY("36");
    }
  }, [newType]);

  // Sync state to URL parameters for shareable layout links
  useEffect(() => {
    setUrlParams(
      {
        len: wallLengthFt,
        hgt: wallHeightFt,
        spc: studSpacingIn,
        sz: studSize,
        hsz: headerSize,
        wst: wastePercent,
        ops: JSON.stringify(openings),
      },
      {
        len: 12,
        hgt: 8,
        spc: 16,
        sz: "2x4",
        hsz: "2x10",
        wst: 10,
        ops: JSON.stringify([
          { id: "op-1", name: "Window 1", type: "window", width: 36, height: 48, x: 24, y: 36 },
          { id: "op-2", name: "Door 1", type: "door", width: 32, height: 80, x: 80, y: 0 }
        ]),
      }
    );
  }, [wallLengthFt, wallHeightFt, studSpacingIn, studSize, headerSize, wastePercent, openings]);

  const dims: FramingDimensions = {
    wallLengthFt,
    wallHeightFt,
    studSpacingIn,
    studSize,
    headerSize,
    wastePercent,
    openings
  };

  const results = calculateFraming(dims);

  const costItems = [
    {
      key: studSize === "2x6" ? "stud_2x6_8ft" : "stud_2x4_8ft",
      name: studSize === "2x6" ? "2x6 Studs & Plates (8ft)" : "2x4 Studs & Plates (8ft)",
      quantity: results.studsCount,
      unit: "boards",
      defaultPrice: studSize === "2x6" ? 5.80 : 3.75,
    },
    ...(results.headersCount > 0 ? [
      {
        key: "header_2x10_12ft",
        name: `Headers (${headerSize} 12ft)`,
        quantity: results.headersCount,
        unit: "boards",
        defaultPrice: 18.50,
      }
    ] : []),
    {
      key: "sheathing_4x8_sheet",
      name: "OSB Sheathing (4x8)",
      quantity: Math.ceil((wallLengthFt * wallHeightFt) / 32),
      unit: "sheets",
      defaultPrice: 15.50,
    },
    {
      key: "nails_box",
      name: "Framing Nails (Box)",
      quantity: Math.max(1, Math.ceil(results.nailsCount / 500)),
      unit: "boxes",
      defaultPrice: 28.00,
    },
  ];


  // SVG Dimension Calculations
  const canvasWidth = 600;
  const canvasHeight = 300;
  const wallWidthIn = wallLengthFt * 12;
  const wallHeightIn = wallHeightFt * 12;

  const scaleX = 540 / wallWidthIn;
  const scaleY = 240 / wallHeightIn;
  const scale = Math.min(scaleX, scaleY);

  const wallSvgWidth = wallWidthIn * scale;
  const wallSvgHeight = wallHeightIn * scale;
  const xOffset = (canvasWidth - wallSvgWidth) / 2;
  const yOffset = (canvasHeight - wallSvgHeight) / 2;

  // Add Opening
  const handleAddOpening = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const w = Math.max(12, Math.min(120, Number(newWidth) || 36));
    const h = newType === "door" ? 80 : Math.max(12, Math.min(120, Number(newHeight) || 48));
    const x = Math.max(0, Math.min(wallWidthIn, Number(newX) || 0));
    const y = newType === "door" ? 0 : Math.max(6, Math.min(wallHeightIn, Number(newY) || 0));

    // Basic bounds checking
    const requiredMargin = w > 72 ? 4.5 : 3.0;
    if (x - requiredMargin < 0 || x + w + requiredMargin > wallWidthIn) {
      setFormError(`Opening is too close to wall edges. Make sure it stays within margins (min ${requiredMargin}").`);
      return;
    }
    if (newType === "window" && y + h > wallHeightIn - 3.0) {
      setFormError("Window top exceeds wall height.");
      return;
    }

    const newOp: FramingOpening = {
      id: `op-${Date.now()}`,
      name: `${newType === "window" ? "Window" : "Door"} ${openings.length + 1}`,
      type: newType,
      width: w,
      height: h,
      x: x,
      y: y
    };

    setOpenings([...openings, newOp]);
  };

  const removeOpening = (id: string) => {
    setOpenings(openings.filter(op => op.id !== id));
  };

  const projectInputs = {
    wallLengthFt,
    wallHeightFt,
    studSpacingIn,
    studSize,
    headerSize,
    wastePercent,
    openingsCount: openings.length
  };

  const projectResults = {
    studsTotal: results.studsCount,
    platesCount: results.platesCount,
    headersTotal: results.headersCount,
    nailsTotal: results.nailsCount,
    warnings: results.warnings.length
  };

  const projectMaterials = [
    {
      name: `Framing Studs (${studSize} - 8ft boards)`,
      quantity: results.studsCount,
      unit: "pcs",
      category: "framing"
    },
    {
      name: `Header Lumber (${headerSize} - 8ft boards)`,
      quantity: results.headersCount,
      unit: "pcs",
      category: "framing"
    },
    {
      name: "Common Framing Nails (3-1/4\")",
      quantity: results.nailsCount,
      unit: "nails",
      category: "finishing"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 2D Elevation View Column */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* SVG Drawing Canvas */}
        <div className={`rounded-xl border p-4 flex flex-col items-center relative select-none bg-[var(--bg-subtle)] ${results.warnings.length > 0 ? "border-red-500/40" : "border-[var(--border)]"}`}>
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              2D Structural Elevation & Opening Placement Grid
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold capitalize">
              Wall: {wallLengthFt}ft &times; {wallHeightFt}ft ({studSize})
            </span>
          </div>

          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden relative">
            {/* Warning Alert Banner */}
            {results.warnings.length > 0 && (
              <div className="absolute top-2 left-2 z-10 text-[9px] bg-red-500/10 border border-red-500/30 text-red-500 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                Framing Warnings Detected
              </div>
            )}

            <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-auto max-w-[600px] overflow-visible" role="img" aria-label="Wall Framing Elevation Map">
              {/* Wall Framing Group */}
              <g transform={`translate(${xOffset}, ${canvasHeight - yOffset - wallSvgHeight})`}>
                
                {/* 1. Backdrop Grid */}
                <rect x="0" y="0" width={wallSvgWidth} height={wallSvgHeight} fill="var(--bg)" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />

                {/* 2. Plates drawing */}
                {results.visualElements.plates.map((p, idx) => (
                  <rect
                    key={`plate-${idx}`}
                    x={p.x * scale}
                    y={p.y * scale}
                    width={p.width * scale}
                    height={p.height * scale}
                    fill="#e7e5e4"
                    stroke="#a8a29e"
                    strokeWidth="0.5"
                    className="transition-all"
                  />
                ))}

                {/* 3. Openings Overlay Placeholder */}
                {openings.map(op => {
                  const sillHeightOffset = op.type === "window" ? 1.5 : 0;
                  return (
                    <rect
                      key={`op-bg-${op.id}`}
                      x={op.x * scale}
                      y={(op.y - sillHeightOffset) * scale}
                      width={op.width * scale}
                      height={(op.height + sillHeightOffset) * scale}
                      fill="var(--accent)"
                      fillOpacity="0.03"
                      stroke="var(--accent)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {/* 4. Studs drawing */}
                {results.visualElements.studs.map((s, idx) => {
                  let fill = "#a8a29e"; // standard stud color
                  let stroke = "#78716c";

                  if (s.type === "king") {
                    fill = "#ea580c"; // king stud safety orange
                    stroke = "#c2410c";
                  } else if (s.type === "jack") {
                    fill = "#d97706"; // jack stud amber/gold
                    stroke = "#b45309";
                  } else if (s.type === "cripple-top" || s.type === "cripple-bottom") {
                    fill = "#78716c"; // cripple slate
                    stroke = "#57534e";
                  }

                  return (
                    <rect
                      key={`stud-${idx}`}
                      x={s.x * scale}
                      y={s.y * scale}
                      width={s.width * scale}
                      height={s.height * scale}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="0.5"
                      opacity={s.type === "standard" ? "0.75" : "1"}
                    />
                  );
                })}

                {/* 5. Headers drawing */}
                {results.visualElements.headers.map((h, idx) => (
                  <g key={`header-group-${idx}`}>
                    <rect
                      x={h.x * scale}
                      y={h.y * scale}
                      width={h.width * scale}
                      height={h.height * scale}
                      fill="#854d0e"
                      stroke="#451a03"
                      strokeWidth="0.75"
                    />
                    <line
                      x1={h.x * scale}
                      y1={h.y * scale}
                      x2={(h.x + h.width) * scale}
                      y2={(h.y + h.height) * scale}
                      stroke="#451a03"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                    <line
                      x1={(h.x + h.width) * scale}
                      y1={h.y * scale}
                      x2={h.x * scale}
                      y2={(h.y + h.height) * scale}
                      stroke="#451a03"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  </g>
                ))}

                {/* 6. Sills drawing */}
                {results.visualElements.sills.map((s, idx) => (
                  <rect
                    key={`sill-${idx}`}
                    x={s.x * scale}
                    y={s.y * scale}
                    width={s.width * scale}
                    height={s.height * scale}
                    fill="#d6d3d1"
                    stroke="#a8a29e"
                    strokeWidth="0.5"
                  />
                ))}

                {/* 7. Openings text tags */}
                {openings.map(op => (
                  <g key={`op-text-${op.id}`}>
                    <rect
                      x={(op.x + op.width / 2 - 25) * scale}
                      y={(op.y + op.height / 2 - 8) * scale}
                      width={50 * scale}
                      height={16 * scale}
                      fill="var(--bg)"
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      rx="2"
                    />
                    <text
                      x={(op.x + op.width / 2) * scale}
                      y={(op.y + op.height / 2 + 4) * scale}
                      textAnchor="middle"
                      fontSize={`${8 * scale}px`}
                      fontWeight="bold"
                      fill="var(--fg-secondary)"
                    >
                      {op.width}&Prime;&times;{op.height}&Prime;
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </div>

          {/* Color Legend */}
          <div className="w-full flex flex-wrap gap-4 mt-3 pt-3 border-t border-[var(--border)] text-[10px] text-[var(--fg-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#a8a29e] border border-[#78716c] rounded" />
              <span>Standard Stud (O.C.)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#ea580c] border border-[#c2410c] rounded" />
              <span>King Stud</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#d97706] border border-[#b45309] rounded" />
              <span>Jack Stud (Header support)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#78716c] border border-[#57534e] rounded" />
              <span>Cripple Stud (Above/Below openings)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#854d0e] border border-[#451a03] rounded" />
              <span>Header Assembly (Double)</span>
            </div>
          </div>
        </div>

        {/* Layout Warnings Section */}
        {results.warnings.length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex flex-col gap-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px]">Structural & Placement Code Violations:</span>
            <ul className="list-disc pl-4 flex flex-col gap-1">
              {results.warnings.map((w, idx) => (
                <li key={`warn-${idx}`}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Framing Layout Form Inputs */}
        <Card className="no-print">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Wall & Framing Specs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--fg-secondary)] mb-1">Wall Length (ft)</label>
              <input
                type="number"
                value={wallLengthInput}
                onChange={e => setWallLengthInput(e.target.value)}
                onBlur={() => {
                  const val = Math.max(4, Math.min(40, Number(wallLengthInput) || 4));
                  setWallLengthInput(String(val));
                  setWallLengthFt(val);
                }}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-2.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] h-10"
                min="4"
                max="40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--fg-secondary)] mb-1">Wall Height (ft)</label>
              <input
                type="number"
                value={wallHeightInput}
                onChange={e => setWallHeightInput(e.target.value)}
                onBlur={() => {
                  const val = Math.max(6, Math.min(16, Number(wallHeightInput) || 6));
                  setWallHeightInput(String(val));
                  setWallHeightFt(val);
                }}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-2.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] h-10"
                min="6"
                max="16"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--fg-secondary)] mb-1">Stud Spacing (OC)</label>
              <select
                value={studSpacingIn}
                onChange={e => setStudSpacingIn(Number(e.target.value))}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2 py-2 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] h-10"
              >
                <option value="12">12 in O.C.</option>
                <option value="16">16 in O.C. (Standard)</option>
                <option value="24">24 in O.C.</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--fg-secondary)] mb-1">Waste Factor (%)</label>
              <input
                type="number"
                value={wastePercentInput}
                onChange={e => setWastePercentInput(e.target.value)}
                onBlur={() => {
                  const val = Math.max(0, Math.min(50, Number(wastePercentInput) || 0));
                  setWastePercentInput(String(val));
                  setWastePercent(val);
                }}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-2.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] h-10"
                min="0"
                max="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--border)]">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--fg-secondary)] mb-1">Wall Stud Thickness</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStudSize("2x4")}
                  className={`flex-1 text-xs font-semibold py-1 rounded border transition-colors ${studSize === "2x4" ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]" : "bg-[var(--bg-subtle)] text-[var(--fg-secondary)] border-[var(--border)] hover:bg-[var(--bg-muted)]"}`}
                >
                  2x4 Studs (Interior)
                </button>
                <button
                  type="button"
                  onClick={() => setStudSize("2x6")}
                  className={`flex-1 text-xs font-semibold py-1 rounded border transition-colors ${studSize === "2x6" ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]" : "bg-[var(--bg-subtle)] text-[var(--fg-secondary)] border-[var(--border)] hover:bg-[var(--bg-muted)]"}`}
                >
                  2x6 Studs (Exterior)
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--fg-secondary)] mb-1">Header Lumber Dimension</label>
              <select
                value={headerSize}
                onChange={e => setHeaderSize(e.target.value as any)}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="2x6">2x6 Headers</option>
                <option value="2x8">2x8 Headers</option>
                <option value="2x10">2x10 Headers (Default)</option>
                <option value="2x12">2x12 Headers</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Dynamic Openings Manager */}
        <Card className="no-print">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Add Doors & Windows</h3>
          <form onSubmit={handleAddOpening} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">Opening Type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="window">Window</option>
                <option value="door">Door</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">Width (in)</label>
              <input
                type="number"
                value={newWidth}
                onChange={e => setNewWidth(e.target.value)}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-2 text-xs text-[var(--fg)] focus:outline-none h-10"
                min="12"
                max="120"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">Height (in)</label>
              <input
                type="number"
                value={newHeight}
                onChange={e => setNewHeight(e.target.value)}
                disabled={newType === "door"}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-2 text-xs text-[var(--fg)] disabled:opacity-50 h-10"
                min="12"
                max="120"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">X-Position (in from left)</label>
              <input
                type="number"
                value={newX}
                onChange={e => setNewX(e.target.value)}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-2 text-xs text-[var(--fg)] h-10"
                min="0"
                max={wallWidthIn}
              />
            </div>
            {newType === "window" ? (
              <div>
                <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">Y-Position (in from floor)</label>
                <input
                  type="number"
                  value={newY}
                  onChange={e => setNewY(e.target.value)}
                  className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-2 text-xs text-[var(--fg)] h-10"
                  min="6"
                  max={wallHeightIn - 12}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-[10px] text-[var(--fg-muted)] italic py-2 h-10 flex items-center">Doors sit on floor (Y=0)</span>
              </div>
            )}
            <div className="col-span-2 sm:col-span-5 flex justify-between items-center mt-2 pt-2 border-t border-[var(--border)]">
              <span className="text-[11px] text-red-500 font-semibold">{formError}</span>
              <button
                type="submit"
                className="bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-semibold px-4 py-2.5 rounded hover:bg-[var(--accent-hover)] transition-colors active:scale-95 cursor-pointer h-10 flex items-center"
              >
                Insert Opening
              </button>
            </div>
          </form>

          {openings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <span className="block text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">Active Openings</span>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {openings.map(op => (
                  <div key={op.id} className="flex justify-between items-center bg-[var(--bg-inset)] px-3 py-1.5 rounded border border-[var(--border)] text-xs">
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold text-[var(--fg)]">{op.name}</span>
                      <span className="text-[var(--fg-muted)]">
                        ({op.width}&Prime; &times; {op.height}&Prime;) at X={op.x}&Prime;, Y={op.y}&Prime;
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOpening(op.id)}
                      className="text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer px-3 py-1.5 border border-red-500/20 rounded hover:bg-red-500/10 h-10 flex items-center justify-center"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Estimations & Cut List Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Workspace Planner Save Component */}
        <div className="no-print">
          <AddToProjectCard
            projects={projects}
            onAdd={pid => {
              clearSuccess();
              addToProject(pid, projectInputs, projectResults, projectMaterials);
            }}
            successMessage={projectSuccess}
          />
        </div>

        {/* Printable Detailed Cut List */}
        <Card className="flex flex-col gap-3 relative border-[var(--border)]">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">Miter Station Cut List</h3>
            <div className="flex gap-2 items-center no-print">
              <button
                onClick={() => window.print()}
                className="text-[10px] bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] px-2.5 py-1 rounded font-bold hover:bg-[var(--bg-inset)] transition-all active:scale-95 cursor-pointer"
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
                className="text-[10px] bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] px-2.5 py-1 rounded font-bold hover:bg-[var(--bg-inset)] transition-all active:scale-95 cursor-pointer"
                aria-label="Copy shareable link"
              >
                {shareSuccess ? "Copied!" : "Share"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
            {results.cutList.map((cut, idx) => (
              <div key={`cut-${idx}`} className="flex flex-col gap-1 bg-[var(--bg-inset)] p-2.5 rounded border border-[var(--border)]">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-xs font-bold text-[var(--fg)]">{cut.name}</span>
                  <span className="text-xs text-[var(--accent)] font-bold">Qty: {cut.quantity}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[var(--fg-secondary)]">
                  <span>Purpose: {cut.purpose}</span>
                  <span className="font-semibold text-right text-[var(--fg)]">
                    Cut Length: <strong className="text-xs text-[var(--accent)] font-mono">{decimalToFraction(cut.lengthIn)}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Shopping list and materials package estimates */}
        <Card>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3 border-b border-[var(--border)] pb-2">Material Sizing & Costs</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Plates & Studs (2x4/2x6 8ft boards)</span>
              <span className="text-sm font-bold tabular-nums text-[var(--fg)]">{results.studsCount} pcs</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Headers ({headerSize} 8ft boards)</span>
              <span className="text-sm font-bold tabular-nums text-[var(--fg)]">{results.headersCount} pcs</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Common Nails (approx. 3-1/4\")</span>
              <span className="text-sm font-bold tabular-nums text-[var(--fg)]">{results.nailsCount} pcs</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-[var(--accent)]/5 rounded px-2.5 border border-[var(--accent)]/10">
              <span className="text-xs font-semibold text-[var(--accent)]">Total Lumber Purchase</span>
              <span className="text-sm font-extrabold tabular-nums text-[var(--accent)]">{results.totalLumberCount} boards</span>
            </div>
          </div>
        </Card>

        <CostEstimatorWidget
          items={costItems}
          defaultLaborHours={Math.max(4, Math.round(results.totalLumberCount / 4))}
        />

        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-xs text-[var(--fg-secondary)] leading-relaxed no-print">
          <span className="font-bold flex items-center gap-1.5 mb-1.5 text-[var(--fg)]">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Professional Verification Recommended
          </span>
          This is a planning and layout estimator tool. Load-bearing structural elements (including studs, plates, window/door headers, and jack fasteners) are subject to localized building codes, shear-wall rules, and seismic requirements. Always verify specifications with a certified structural engineer or licensed contractor before purchase or installation.
        </div>
      </div>
    </div>
  );
}

export default withI18n<FramingDesignerProps>(FramingDesigner);
