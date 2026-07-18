import React, { useState, useEffect } from "react";
import { calculateDeckMaterials, type DeckDimensions } from "../../lib/deckEngine";
import { Card } from "../ui/Card";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import CostEstimatorWidget, { type CostItem } from "../ui/CostEstimatorWidget";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";

interface DeckDesignerProps {
  initialWidth?: number;
  initialDepth?: number;
  initialJoistSpacing?: 12 | 16 | 24;
  initialBoardType?: "wood" | "composite";
  initialPostHeight?: number;
}

function DeckDesigner({
  initialWidth,
  initialDepth,
  initialJoistSpacing,
  initialBoardType,
  initialPostHeight,
}: DeckDesignerProps = {}) {
  const { t } = useI18n();
  const [shareSuccess, setShareSuccess] = useState(false);

  // State parameters
  const [widthFt, setWidthFt] = useState<number>(() => getUrlParam("wid", initialWidth ?? 16));
  const [depthFt, setDepthFt] = useState<number>(() => getUrlParam("dep", initialDepth ?? 12));
  const [joistSpacingIn, setJoistSpacingIn] = useState<12 | 16 | 24>(() => getUrlParam("js", initialJoistSpacing ?? 16) as 12 | 16 | 24);
  const [boardType, setBoardType] = useState<"wood" | "composite">(() => getUrlParam("type", initialBoardType ?? "wood") as "wood" | "composite");
  const [postHeightFt, setPostHeightFt] = useState<number>(() => getUrlParam("ph", initialPostHeight ?? 3));

  // Sync state to URL params for shareable configuration links
  useEffect(() => {
    setUrlParams(
      { wid: widthFt, dep: depthFt, js: joistSpacingIn, type: boardType, ph: postHeightFt },
      { wid: 16, dep: 12, js: 16, type: "wood", ph: 3 }
    );
  }, [widthFt, depthFt, joistSpacingIn, boardType, postHeightFt]);

  // Auto calculate deck materials
  const dims: DeckDimensions = {
    widthFt,
    depthFt,
    joistSpacingIn,
    boardType,
    postHeightFt
  };
  const materials = calculateDeckMaterials(dims);

  // Deck board linear footage: each board is 16 ft long
  const boardLinearFt = materials.deckBoards16Ft * 16;
  // Rim joist = front band joist (widthFt) + ledger board (widthFt) — each runs the full width
  const rimJoistLinearFt = widthFt * 2;
  // Concrete footing bags: 12" dia × 36" deep ≈ 4 bags (80 lb) per footing
  const footingBagsCount = materials.footingsCount * 4;

  const costItems: CostItem[] = [
    {
      key: "deck_board_lf",
      name: `Decking Boards (${boardType === "composite" ? "Composite" : "Pressure-Treated Wood"})`,
      quantity: boardLinearFt,
      unit: "lf",
      defaultPrice: boardType === "composite" ? 3.5 : 1.8,
    },
    {
      key: "deck_rim_joist_lf",
      name: "Rim / Band Joists & Ledger Board (2×8/2×10)",
      quantity: rimJoistLinearFt,
      unit: "lf",
      defaultPrice: 1.4,
    },
    {
      key: "deck_joist_lf",
      name: "Joists (2×10)",
      quantity: materials.joistLinearFt,
      unit: "lf",
      defaultPrice: 1.2,
    },
    {
      key: "deck_beam_lf",
      name: "Beams (Double 2×10)",
      quantity: materials.beamLinearFt,
      unit: "lf",
      defaultPrice: 2.2,
    },
    {
      key: "deck_post_each",
      name: "Support Posts (4×4)",
      quantity: materials.postsCount,
      unit: "each",
      defaultPrice: 12.0,
    },
    {
      key: "deck_footing_bag",
      name: "Concrete Footing Mix (80 lb bags)",
      quantity: footingBagsCount,
      unit: "bags",
      defaultPrice: 7.5,
    },
    {
      key: "deck_ledger_lf",
      name: "Ledger Board (2×10, house attachment)",
      quantity: widthFt,
      unit: "lf",
      defaultPrice: 1.4,
    },
  ];

  // SVG Dimension mappings
  // Scale: 1 foot = 12 pixels. Maximum width/depth = 30ft, giving max SVG dimensions of ~360px.
  const SCALE = 12;
  const canvasWidth = 380;
  const canvasHeight = 380;

  // Deck offsets inside SVG canvas to center it
  const xOffset = (canvasWidth - widthFt * SCALE) / 2;
  const yOffset = 40; // start 40px down from top (ledger board attached to house)

  const deckSvgWidth = widthFt * SCALE;
  const deckSvgHeight = depthFt * SCALE;

  // Generate intermediate spacing coordinates
  const beamsCount = Math.max(1, Math.ceil(depthFt / 10));
  const postsPerBeam = Math.ceil(widthFt / 8) + 1;
  const joistsCount = Math.ceil((widthFt * 12) / joistSpacingIn) + 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Visual Design Canvas Column */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center relative select-none">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              2D Structural Blueprint Visualizer
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold">
              {widthFt}&prime; &times; {depthFt}&prime; Deck Plan
            </span>
          </div>

          {/* SVG Frame Canvas */}
          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden">
            <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-auto max-w-[380px] overflow-visible" role="img" aria-label="Deck Blueprint Layout Graph">
              {/* House Siding / Ledger Wall Attachment */}
              <rect x="0" y="0" width={canvasWidth} height="20" fill="var(--fg-secondary)" fillOpacity="0.08" />
              <line x1="0" y1="20" x2={canvasWidth} y2="20" stroke="var(--fg-secondary)" strokeWidth="3" />
              <text x={canvasWidth / 2} y="14" fill="var(--fg-secondary)" fontSize="9" fontWeight="bold" textAnchor="middle">
                HOUSE EXTERIOR WALL (LEDGER BOARD ATTACHMENT)
              </text>

              {/* Deck Outer Bounds Group */}
              <g transform={`translate(${xOffset}, ${yOffset})`}>
                {/* Ledger Board (attached at top) */}
                <rect x="0" y="0" width={deckSvgWidth} height="4" fill="var(--accent)" />

                {/* Outer Rim Joists & Joist framing layout */}
                {Array.from({ length: joistsCount }).map((_, idx) => {
                  const spacingPx = (joistSpacingIn / 12) * SCALE;
                  const xPos = Math.min(deckSvgWidth, idx * spacingPx);
                  return (
                    <line
                      key={idx}
                      x1={xPos}
                      y1="0"
                      x2={xPos}
                      y2={deckSvgHeight}
                      stroke="var(--fg-muted)"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                  );
                })}

                {/* Beams (Double 2x10s running horizontally) */}
                {Array.from({ length: beamsCount }).map((_, idx) => {
                  // If depth is 12ft, and beamCount is 2: 
                  // Beams are at index 1, 2. Spaced along depth.
                  const beamY = ((idx + 1) / beamsCount) * deckSvgHeight;
                  return (
                    <g key={idx}>
                      {/* Double Beam horizontal line */}
                      <line x1="0" y1={beamY} x2={deckSvgWidth} y2={beamY} stroke="var(--fg)" strokeWidth="4" />
                      <line x1="0" y1={beamY + 3} x2={deckSvgWidth} y2={beamY + 3} stroke="var(--fg)" strokeWidth="1" strokeOpacity="0.3" />

                      {/* Footings and Support Posts along this beam */}
                      {Array.from({ length: postsPerBeam }).map((_, pIdx) => {
                        const postSpacing = deckSvgWidth / (postsPerBeam - 1);
                        const postX = pIdx * postSpacing;
                        return (
                          <g key={pIdx}>
                            {/* Concrete Footing Circle (12" diameter = 12px) */}
                            <circle cx={postX} cy={beamY} r="8" fill="var(--bg-muted)" stroke="var(--fg-secondary)" strokeWidth="1.5" />
                            {/* Wood Support Post Square (4x4 = 6px) */}
                            <rect x={postX - 3} y={beamY - 3} width="6" height="6" fill="var(--fg)" rx="0.5" />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* Outer rim boundaries */}
                <rect x="0" y="0" width={deckSvgWidth} height={deckSvgHeight} fill="none" stroke="var(--fg)" strokeWidth="2.5" />

                {/* Dimension Arrows & Text Labels */}
                {/* Width dimension arrow (below deck) */}
                <g transform={`translate(0, ${deckSvgHeight + 15})`}>
                  <line x1="0" y1="0" x2={deckSvgWidth} y2="0" stroke="var(--accent)" strokeWidth="1" />
                  <polygon points={`0,0 5,-3 5,3`} fill="var(--accent)" />
                  <polygon points={`${deckSvgWidth},0 ${deckSvgWidth - 5},-3 ${deckSvgWidth - 5},3`} fill="var(--accent)" />
                  <rect x={(deckSvgWidth / 2) - 15} y="-8" width="30" height="15" fill="var(--bg-inset)" />
                  <text x={deckSvgWidth / 2} y="3" fill="var(--accent)" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {widthFt}&prime;
                  </text>
                </g>

                {/* Depth dimension arrow (left side of deck) */}
                <g transform={`translate(-18, 0)`}>
                  <line x1="0" y1="0" x2="0" y2={deckSvgHeight} stroke="var(--accent)" strokeWidth="1" />
                  <polygon points={`0,0 -3,5 3,5`} fill="var(--accent)" />
                  <polygon points={`0,${deckSvgHeight} -3,${deckSvgHeight - 5} 3,${deckSvgHeight - 5}`} fill="var(--accent)" />
                  <rect x="-15" y={(deckSvgHeight / 2) - 8} width="30" height="15" fill="var(--bg-inset)" />
                  <text x="0" y={(deckSvgHeight / 2) + 3} fill="var(--accent)" fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 0 ${deckSvgHeight / 2})`}>
                    {depthFt}&prime;
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Legenda Symbols */}
          <div className="w-full mt-3 flex flex-wrap gap-4 items-center justify-center text-[10px] text-[var(--fg-secondary)] bg-[var(--bg-inset)] p-2.5 rounded-lg border border-[var(--border)] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-var(--accent) inline-block" /> House Ledger
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[var(--fg-muted)] opacity-60 inline-block" /> Joists (Perpendicular)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-[var(--fg)] inline-block" /> Double Beams (Horizontal)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[var(--bg-muted)] border border-[var(--fg-secondary)] inline-flex items-center justify-center font-bold font-mono">C</span> Footing
            </span>
          </div>
        </div>

        {/* Dynamic Sliders and Framing Controls */}
        <Card className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Configure Layout Specs</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Width Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--fg-secondary)]">Deck Width (ft)</span>
                <span className="font-bold text-[var(--accent)] font-mono">{widthFt}&prime;</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={widthFt}
                onChange={(e) => setWidthFt(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
                aria-label="Deck width in feet"
              />
            </div>

            {/* Depth Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--fg-secondary)]">Deck Depth (ft)</span>
                <span className="font-bold text-[var(--accent)] font-mono">{depthFt}&prime;</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={depthFt}
                onChange={(e) => setDepthFt(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
                aria-label="Deck depth in feet"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border)] pt-4 text-xs">
            {/* Spacing Selector */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[var(--fg-secondary)]">Joist Spacing</span>
              <div className="flex flex-col gap-1.5">
                {[12, 16, 24].map((spacing) => (
                  <label key={spacing} className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      checked={joistSpacingIn === spacing}
                      onChange={() => setJoistSpacingIn(spacing as any)}
                      className="w-3.5 h-3.5 accent-[var(--accent)]"
                    />
                    {spacing}&Prime; on-center
                  </label>
                ))}
              </div>
            </div>

            {/* Material Selector */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[var(--fg-secondary)]">Decking Board Material</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: "wood", label: "Pressure-Treated Wood" },
                  { id: "composite", label: "Composite Decking" }
                ].map((type) => (
                  <label key={type.id} className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      checked={boardType === type.id}
                      onChange={() => setBoardType(type.id as any)}
                      className="w-3.5 h-3.5 accent-[var(--accent)]"
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Post Height Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-[var(--fg-secondary)]">Support Post Height (ft)</span>
              <input
                type="number"
                min="2"
                max="10"
                value={postHeightFt}
                onChange={(e) => setPostHeightFt(parseInt(e.target.value) || 3)}
                className="w-full text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
              />
              <span className="text-[10px] text-[var(--fg-muted)]">Typical height above concrete pier foundation.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Material Breakdown Sidebar Column */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card className="p-6 flex flex-col gap-5">
          <div className="border-b border-[var(--border)] pb-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--fg)]">Live Material List</h3>
            <div className="flex gap-2 items-center no-print">
              <button
                onClick={() => window.print()}
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

          <div className="flex flex-col gap-3 text-xs leading-relaxed">
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Concrete Footings</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.footingsCount} Piers</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Support Posts (4x4 lumber)</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.postsCount} pcs</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Beams (Double 2x10 lumber)</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.beamsCount} spans ({materials.beamLinearFt} linear ft)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Joists (2x8 lumber)</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.joistsCount} rows ({materials.joistLinearFt} linear ft)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">16-ft Decking Boards</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.deckBoards16Ft} boards</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Metal Joist Hangers</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.joistHangers} hangers</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Post Base / Cap Connectors</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.postBases} / {materials.postCaps} anchors</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Screws / Framing Nails</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.deckScrewsLbs} lbs / {materials.framingNailsLbs} lbs</span>
            </div>
          </div>

          {/* Staged Weights Grid */}
          <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-4 text-xs flex flex-col gap-3">
            <span className="font-bold text-[var(--fg)] uppercase tracking-wider text-[10px] block mb-1">
              Hauling Logistics Weight Estimates
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[var(--fg-muted)] block mb-0.5">Lumber & Fasteners</span>
                <span className="text-sm font-bold text-[var(--fg)] tabular-nums">{materials.lumberWeightLbs.toLocaleString()} lbs</span>
              </div>
              <div>
                <span className="text-[var(--fg-muted)] block mb-0.5">Concrete Pier Weight</span>
                <span className="text-sm font-bold text-[var(--fg)] tabular-nums">{materials.concreteWeightLbs.toLocaleString()} lbs</span>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-2.5 mt-1 flex justify-between items-center">
              <span className="font-bold text-[var(--fg-secondary)]">Total Cargo Load</span>
              <span className="text-sm font-black text-[var(--accent)] tabular-nums">{materials.totalWeightLbs.toLocaleString()} lbs</span>
            </div>
          </div>

          {/* Payload Redirect Hook */}
          <a
            href={`/calculators/payload/?weight=${materials.totalWeightLbs}&material=lumber`}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-sm text-center no-print"
          >
            Check Vehicle Payload Safety & Trips &rarr;
          </a>

          {/* Warning disclaimer YMYL */}
          <div className="border-l-4 border-l-[var(--warning)] bg-[var(--bg-subtle)] p-3 rounded-r-lg text-[10px] leading-relaxed text-[var(--fg-secondary)]">
            <strong>NOTICE:</strong> Calculations are estimates based on standard IRC R507 span approximations. This tool is not a substitute for architectural blueprints or certified engineering. Always consult your local building department and owner's manual before starting construction.
          </div>
        </Card>

        {/* Cost Estimator Widget */}
        <CostEstimatorWidget
          items={costItems}
          defaultLaborHours={Math.max(8, Math.round((widthFt * depthFt) / 20))}
        />

        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-xs text-[var(--fg-secondary)] leading-relaxed no-print">
          <span className="font-bold flex items-center gap-1.5 mb-1.5 text-[var(--fg)]">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Professional Verification Recommended
          </span>
          This is a planning and layout estimator tool. Load-bearing structural elements (including deck footings, support beams, joists, and post fasteners) are subject to localized building codes, wind/snow loads, and soil conditions. Always verify specifications with a certified structural engineer or licensed contractor before purchase or installation.
        </div>
      </div>
    </div>
  );
}

export default withI18n<DeckDesignerProps>(DeckDesigner);
