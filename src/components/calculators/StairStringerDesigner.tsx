import React, { useState, useMemo, useEffect } from "react";
import { calculateStairLayout, generateStringerCoordinates, type StairInputs } from "../../lib/stairEngine";
import { Card } from "../ui/Card";
import CostEstimatorWidget, { type CostItem } from "../ui/CostEstimatorWidget";
import { useProjects } from "../../lib/useProjects";
import AddToProjectCard from "../ui/AddToProjectCard";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

interface StairStringerDesignerProps {
  initialRise?: string;
  initialStructure?: string;
  projectId?: string;
}

function StairStringerDesigner({ initialRise, initialStructure, projectId }: StairStringerDesignerProps) {
  const { t } = useI18n();
  const [shareSuccess, setShareSuccess] = useState(false);

  // Input states
  const [totalRise, setTotalRise] = useState<string>(() => getUrlParam("rise", initialRise || "95"));
  const [treadThickness, setTreadThickness] = useState<string>(() => getUrlParam("tthk", "1"));
  const [riserThickness, setRiserThickness] = useState<string>(() => getUrlParam("rthk", "0.75"));
  const [targetRun, setTargetRun] = useState<string>(() => getUrlParam("trun", "10.5"));
  const [customStairCount, setCustomStairCount] = useState<string>(() => getUrlParam("sct", "auto"));
  const [showFramingSquare, setShowFramingSquare] = useState<boolean>(() => getUrlParam("sq", true));

  // Parse inputs
  const parsedInputs = useMemo<StairInputs>(() => {
    const riseVal = parseFloat(totalRise) || 95;
    const runVal = parseFloat(targetRun) || 10.5;
    const treadVal = parseFloat(treadThickness) || 0;
    const riserVal = parseFloat(riserThickness) || 0;
    const countVal = customStairCount === "auto" ? null : parseInt(customStairCount) || null;

    return {
      totalRise: riseVal,
      treadThickness: treadVal,
      riserThickness: riserVal,
      targetRun: runVal,
      customStairCount: countVal,
      unitSystem: "imperial",
    };
  }, [totalRise, targetRun, treadThickness, riserThickness, customStairCount]);

  // Run Calculations Engine
  const results = useMemo(() => {
    return calculateStairLayout(parsedInputs);
  }, [parsedInputs]);

  // Sync state parameters to URL query parameters for shareable layout links
  useEffect(() => {
    setUrlParams(
      { rise: totalRise, tthk: treadThickness, rthk: riserThickness, trun: targetRun, sct: customStairCount, sq: showFramingSquare },
      { rise: "95", tthk: "1", rthk: "0.75", trun: "10.5", sct: "auto", sq: true }
    );
  }, [totalRise, treadThickness, riserThickness, targetRun, customStairCount, showFramingSquare]);

  // Generate SVG coordinate points
  const points = useMemo(() => {
    return generateStringerCoordinates(
      results.stairCount,
      results.riserHeight,
      results.treadRun,
      results.throatDepth
    );
  }, [results]);

  // Scale coordinates to fit 600x400 SVG box
  const svgBounds = useMemo(() => {
    if (points.length === 0) return { path: "", width: 600, height: 400 };

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    // Scale factor to fit inside 520x320 viewport (allowing 40px margins)
    const scaleX = 520 / (width || 1);
    const scaleY = 320 / (height || 1);
    const scale = Math.min(scaleX, scaleY, 15); // cap zoom

    // Translate to center coordinates in the SVG viewport
    const offsetX = 40 - minX * scale + (520 - width * scale) / 2;
    const offsetY = 40 - minY * scale + (320 - height * scale) / 2;

    const scaledPoints = points.map(p => ({
      x: p.x * scale + offsetX,
      y: p.y * scale + offsetY,
    }));

    const path = scaledPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

    // Find the first cut step coordinates to overlay framing square
    // Step 1: Rise goes down from starting point. (Start is points[0])
    // Point 1 is points[1] = (0, riserHeight). Point 2 is points[2] = (treadRun, riserHeight).
    const step1Start = scaledPoints[0];
    const step1Corner = scaledPoints[1];
    const step1End = scaledPoints[2];

    return {
      path,
      scale,
      offsetX,
      offsetY,
      step1Start,
      step1Corner,
      step1End,
      scaledPoints,
    };
  }, [points]);

  // Framing Square drawing coordinates
  const framingSquarePath = useMemo(() => {
    if (!svgBounds.step1Start || !svgBounds.step1Corner || !svgBounds.step1End) return "";

    const { step1Start, step1Corner, step1End, scale } = svgBounds;

    // Tongue (vertical limb) goes up from the corner along the riser line
    // Blade (horizontal limb) goes right from the corner along the tread run line
    // To make it look realistic, we offsets it by width of square limbs:
    // Tongue width is usually 1.5 inches (~15px at scale), blade width is 2 inches (~20px at scale).
    const tongueWidth = 1.5 * scale;
    const bladeWidth = 2.0 * scale;

    // Tongue length (16 inches) and blade length (24 inches)
    const tongueLen = 16 * scale;
    const bladeLen = 24 * scale;

    // L-Shape framing square starting from corner pointing up and right
    // Corner is step1Corner. Tongue is vertical (along Y). Blade is horizontal (along X).
    return `M ${step1Corner.x} ${step1Corner.y}
            L ${step1Corner.x} ${step1Corner.y - tongueLen}
            L ${step1Corner.x + tongueWidth} ${step1Corner.y - tongueLen}
            L ${step1Corner.x + tongueWidth} ${step1Corner.y - bladeWidth}
            L ${step1Corner.x + bladeLen} ${step1Corner.y - bladeWidth}
            L ${step1Corner.x + bladeLen} ${step1Corner.y}
            Z`;
  }, [svgBounds]);

  // Project Planner integration
  const { projects, addToProject, successMessage: projectSuccess } = useProjects("stair-stringer", "Stair Stringer Designer");

  const handleSaveToProject = (projId: string) => {
    const materialsList = [
      { name: "2x12 Timber Boards (Stringers)", quantity: results.stairCount >= 8 ? 3 : 2, unit: "boards", category: "lumber" },
      { name: `Stair Treads (${results.treadRun}" run)`, quantity: results.stairCount, unit: "pieces", category: "lumber" },
      { name: "Simpson Strong-Tie Stringer Hangers", quantity: 2, unit: "hangers", category: "lumber" },
    ];
    addToProject(
      projId,
      { totalRise, targetRun, customStairCount },
      { stairCount: results.stairCount, riserHeight: results.riserHeight, angle: results.angle },
      materialsList
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      
      {/* SVG Canvas Column */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center relative select-none">
          
          {/* Header */}
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              Interactive 2D Stringer Cutting Layout
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold">
              {results.stairCount} steps @ {results.riserHeight.toFixed(2)}&quot; rise
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden relative">
            <svg
              viewBox="0 0 600 400"
              className="w-full h-auto max-w-[560px]"
            >
              {/* Grid background */}
              <defs>
                <pattern id="stair-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="600" height="400" fill="url(#stair-grid)" />

              {/* Stringer Board Polygon */}
              <path
                d={svgBounds.path}
                fill="rgba(234, 88, 12, 0.05)"
                stroke="#ea580c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Step Marks Overlay (Tread and Riser Indicators) */}
              {svgBounds.scaledPoints && svgBounds.scaledPoints.slice(0, results.stairCount * 2).map((p, idx) => {
                if (idx % 2 === 1) return null; // only draw on tread horizontal runs
                const nextP = svgBounds.scaledPoints[idx + 1];
                const thirdP = svgBounds.scaledPoints[idx + 2];
                if (!nextP || !thirdP) return null;
                return (
                  <g key={idx} opacity="0.8">
                    {/* Tread Surface (Green) */}
                    <line x1={nextP.x} y1={nextP.y} x2={thirdP.x} y2={thirdP.y} stroke="#10b981" strokeWidth="3" />
                    {/* Riser Surface (Blue) */}
                    <line x1={p.x} y1={p.y} x2={nextP.x} y2={nextP.y} stroke="#3b82f6" strokeWidth="3" />
                  </g>
                );
              })}

              {/* Framing Square Visual Overlay */}
              {showFramingSquare && framingSquarePath && svgBounds.step1Corner && (
                <g opacity="0.85">
                  <path
                    d={framingSquarePath}
                    fill="rgba(120, 113, 108, 0.25)"
                    stroke="#78716c"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Framing square labels */}
                  <text
                    x={svgBounds.step1Corner.x + 10}
                    y={svgBounds.step1Corner.y - 6}
                    fill="#44403c"
                    className="font-mono text-[9px] font-bold"
                  >
                    R:{results.riserHeight.toFixed(2)}&quot;
                  </text>
                  <text
                    x={svgBounds.step1Corner.x + 35}
                    y={svgBounds.step1Corner.y - 25}
                    fill="#44403c"
                    className="font-mono text-[9px] font-bold"
                    transform={`rotate(${results.angle}, ${svgBounds.step1Corner.x}, ${svgBounds.step1Corner.y})`}
                  >
                    T:{results.treadRun.toFixed(2)}&quot;
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Visual Legend */}
          <div className="w-full flex flex-wrap gap-4 mt-3 pt-3 border-t border-[var(--border)] text-[10px] text-[var(--fg-secondary)] font-medium justify-center">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#ea580c]" /> Cut Stringer Profile</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#10b981]" /> Tread Surface</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#3b82f6]" /> Riser Face</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-stone-500/20 border border-stone-500" /> Framing Square</span>
          </div>

        </div>

        {/* Dynamic Code Validation Alerts */}
        {results.warnings.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 no-print">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600">IRC Building Code Warnings</h4>
            </div>
            <ul className="list-disc pl-5 text-xs text-amber-700 flex flex-col gap-1 leading-relaxed">
              {results.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Sidebar Controls Column */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Input Parameters Card */}
        <Card className="no-print">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Stair Dimensions</h3>
          <div className="flex flex-col gap-3">
            
            {/* Total Rise */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[var(--fg-secondary)]">Total Rise (Height)</label>
                <span className="text-xs font-mono font-bold text-[var(--fg)]">{totalRise}&quot;</span>
              </div>
              <input
                type="range"
                min="24"
                max="150"
                step="0.5"
                value={totalRise}
                onChange={e => setTotalRise(e.target.value)}
                className="w-full accent-[var(--accent)] cursor-ew-resize h-1 bg-[var(--bg-inset)] rounded-lg appearance-none"
                aria-label="Total rise or height of stairs in inches"
              />
            </div>

            {/* Target Run */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-[var(--fg-secondary)]">Tread Run (Depth)</label>
                <span className="text-xs font-mono font-bold text-[var(--fg)]">{targetRun}&quot;</span>
              </div>
              <input
                type="range"
                min="9"
                max="14"
                step="0.25"
                value={targetRun}
                onChange={e => setTargetRun(e.target.value)}
                className="w-full accent-[var(--accent)] cursor-ew-resize h-1 bg-[var(--bg-inset)] rounded-lg appearance-none"
                aria-label="Tread run depth in inches"
              />
            </div>

            {/* Riser count override */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--fg-secondary)] mb-1">Step Count (Risers)</label>
              <select
                value={customStairCount}
                onChange={e => setCustomStairCount(e.target.value)}
                className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-1 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="auto">Optimal Comfort (Auto)</option>
                {Array.from({ length: 19 }, (_, i) => i + 2).map(num => (
                  <option key={num} value={num}>{num} steps</option>
                ))}
              </select>
            </div>

            {/* Tread Material Thickness */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">Tread Thickness</label>
                <input
                  type="number"
                  value={treadThickness}
                  onChange={e => setTreadThickness(e.target.value)}
                  className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--fg)] focus:outline-none"
                  min="0"
                  max="3"
                  step="0.25"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">Riser Thickness</label>
                <input
                  type="number"
                  value={riserThickness}
                  onChange={e => setRiserThickness(e.target.value)}
                  className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--fg)] focus:outline-none"
                  min="0"
                  max="3"
                  step="0.25"
                />
              </div>
            </div>

            {/* Framing Square Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="show-square"
                checked={showFramingSquare}
                onChange={e => setShowFramingSquare(e.target.checked)}
                className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] h-3.5 w-3.5 cursor-pointer"
              />
              <label htmlFor="show-square" className="text-[11px] font-medium text-[var(--fg-secondary)] cursor-pointer select-none">
                Show Framing Square overlay guide
              </label>
            </div>

          </div>
        </Card>

        {/* Calculated Results Card */}
        <Card>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3 border-b border-[var(--border)] pb-1.5">Calculated Layout</h3>
          <div className="flex flex-col gap-2.5 text-xs text-[var(--fg-secondary)]">
            <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
              <span>Step Comfort Rise Height</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{results.riserHeight.toFixed(2)}&quot;</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
              <span>Bottom Step Riser (Cut)</span>
              <span className="font-semibold text-[var(--accent)] tabular-nums">{results.bottomRiserHeight.toFixed(2)}&quot;</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
              <span>Top Step Riser (Cut)</span>
              <span className="font-semibold text-[var(--fg)] tabular-nums">{results.topRiserHeight.toFixed(2)}&quot;</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
              <span>Tread Run (Cut)</span>
              <span className="font-semibold text-[var(--fg)] tabular-nums">{results.treadRun.toFixed(2)}&quot;</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
              <span>Stairway Incline Angle</span>
              <span className="font-semibold text-[var(--fg)] tabular-nums">{results.angle.toFixed(1)}&deg;</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[var(--border)]/50">
              <span>Lumber Board Required</span>
              <span className="font-bold text-[var(--fg)]">2x12 &times; {results.recommendedStockLength}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Comfort Score (2R + T)</span>
              <span className={`font-bold tabular-nums ${results.comfortScore >= 24 && results.comfortScore <= 25 ? "text-emerald-500" : "text-amber-500"}`}>
                {results.comfortScore.toFixed(2)}&quot;
              </span>
            </div>
          </div>
        </Card>

        {/* Cost Estimator Widget */}
        <CostEstimatorWidget
          items={[
            {
              key: "stair_stringer_each",
              name: "Stringers (2×12)",
              quantity: results.stairCount >= 8 ? 3 : 2,
              unit: "each",
              defaultPrice: 28.00,
            },
            {
              key: "stair_tread_each",
              name: "Treads (2×6)",
              quantity: results.stairCount,
              unit: "each",
              defaultPrice: 4.50,
            },
            {
              key: "stair_riser_each",
              name: "Risers (1×8)",
              quantity: results.stairCount,
              unit: "each",
              defaultPrice: 3.20,
            },
            {
              key: "stair_footing_bag",
              name: "Concrete Footings",
              quantity: results.stairCount >= 8 ? 3 : 2,
              unit: "bags",
              defaultPrice: 7.50,
            },
          ] satisfies CostItem[]}
          defaultLaborHours={Math.max(4, Math.round(results.stairCount * 0.75))}
        />

        {/* Print Blueprint Controls */}
        <Card className="no-print">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Print & Save Blueprint</h3>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-grow text-center bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--accent-fg)] font-bold py-2 rounded-lg text-xs transition-colors flex justify-center items-center gap-1.5 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></svg>
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
                className="bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] font-bold px-3 py-2 rounded-lg text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                aria-label="Copy shareable link"
              >
                {shareSuccess ? "Copied!" : "Share"}
              </button>
            </div>
            <AddToProjectCard
              projects={projects}
              onAdd={handleSaveToProject}
              successMessage={projectSuccess}
            />
          </div>
        </Card>

        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-xs text-[var(--fg-secondary)] leading-relaxed no-print">
          <span className="font-bold flex items-center gap-1.5 mb-1.5 text-[var(--fg)]">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Professional Verification Recommended
          </span>
          This is a planning and layout estimator tool. Load-bearing structural elements (including stair rises, treads, stringer framing hangers, and concrete footing pads) are subject to localized building codes (such as IRC R311.7 regulations). Always verify specifications with a certified structural engineer or licensed contractor before purchase or installation.
        </div>
      </div>
    </div>
  );
}

export default withI18n(StairStringerDesigner);
