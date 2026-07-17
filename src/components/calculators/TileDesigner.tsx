import React, { useState, useEffect } from "react";
import { calculateTileMaterials, type TileDimensions } from "../../lib/tileEngine";
import { Card } from "../ui/Card";
import CostEstimatorWidget, { type CostItem } from "../ui/CostEstimatorWidget";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

type TilePresetId = "3x6" | "4x12" | "12x12" | "12x24" | "24x48";
type PatternId = "straight" | "brick" | "herringbone" | "french";

function TileDesigner() {
  const { t } = useI18n();
  const [shareSuccess, setShareSuccess] = useState(false);

  // State parameters
  const [widthFt, setWidthFt] = useState<number>(() => getUrlParam("wid", 10));
  const [heightFt, setHeightFt] = useState<number>(() => getUrlParam("hgt", 10));
  const [tilePreset, setTilePreset] = useState<TilePresetId>(() => getUrlParam("pr", "12x24") as TilePresetId);
  const [groutWidthIn, setGroutWidthIn] = useState<number>(() => getUrlParam("gw", 0.125));
  const [pattern, setPattern] = useState<PatternId>(() => getUrlParam("pat", "brick") as PatternId);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(() => getUrlParam("ori", "horizontal") as "horizontal" | "vertical");
  const [tileThicknessIn, setTileThicknessIn] = useState<number>(() => getUrlParam("thk", 0.375));

  // Preset measurements
  const presets: Record<TilePresetId, { w: number; h: number; label: string }> = {
    "3x6": { w: 3, h: 6, label: '3" × 6" Subway Tile' },
    "4x12": { w: 4, h: 12, label: '4" × 12" Subway Tile' },
    "12x12": { w: 12, h: 12, label: '12" × 12" Square Tile' },
    "12x24": { w: 12, h: 24, label: '12" × 24" Medium Format' },
    "24x48": { w: 24, h: 48, label: '24" × 48" Large Format' }
  };

  // Determine active tile width/height based on orientation
  const rawW = presets[tilePreset].w;
  const rawH = presets[tilePreset].h;
  const tileWidthIn = orientation === "horizontal" ? rawH : rawW;
  const tileHeightIn = orientation === "horizontal" ? rawW : rawH;

  // Sync state parameters to URL query parameters for shareable layout links
  useEffect(() => {
    setUrlParams(
      { wid: widthFt, hgt: heightFt, pr: tilePreset, gw: groutWidthIn, pat: pattern, ori: orientation, thk: tileThicknessIn },
      { wid: 10, hgt: 10, pr: "12x24", gw: 0.125, pat: "brick", ori: "horizontal", thk: 0.375 }
    );
  }, [widthFt, heightFt, tilePreset, groutWidthIn, pattern, orientation, tileThicknessIn]);

  // Calculate calculations
  const dims: TileDimensions = {
    widthFt,
    heightFt,
    tileWidthIn,
    tileHeightIn,
    groutWidthIn,
    pattern,
    tileThicknessIn
  };
  const materials = calculateTileMaterials(dims);

  // SVG Scaler calculations
  // Max room size is 20ft. Canvas is 360x360 px.
  const canvasWidth = 360;
  const canvasHeight = 360;
  const maxFt = Math.max(widthFt, heightFt);
  // Give 30px padding on borders
  const scale = 300 / maxFt;

  const roomSvgWidth = widthFt * scale;
  const roomSvgHeight = heightFt * scale;
  const xOffset = (canvasWidth - roomSvgWidth) / 2;
  const yOffset = (canvasHeight - roomSvgHeight) / 2;

  // Render SVG Tile shapes based on pattern
  const renderTiles = () => {
    // scale / 12 converts inches to pixels since scale is pixels per foot
    const wPx = tileWidthIn * (scale / 12);
    const hPx = tileHeightIn * (scale / 12);
    const gPx = groutWidthIn * (scale / 12);

    const stepX = wPx + gPx;
    const stepY = hPx + gPx;

    // Buffer loops to fully cover the clipped area
    const cols = Math.ceil((widthFt * 12) / (tileWidthIn + groutWidthIn)) + 4;
    const rows = Math.ceil((heightFt * 12) / (tileHeightIn + groutWidthIn)) + 4;

    const tilesList: React.ReactNode[] = [];

    if (pattern === "straight" || pattern === "brick") {
      for (let r = -2; r < rows; r++) {
        for (let c = -2; c < cols; c++) {
          let x = c * stepX;
          const y = r * stepY;

          // Offset shift for Brick running bond pattern (alternate rows shift 50%)
          if (pattern === "brick" && Math.abs(r) % 2 === 1) {
            x += stepX / 2;
          }

          tilesList.push(
            <rect
              key={`${r}-${c}`}
              x={x}
              y={y}
              width={wPx}
              height={hPx}
              fill="var(--bg-subtle)"
              stroke="var(--fg-secondary)"
              strokeWidth="0.75"
              fillOpacity="0.4"
            />
          );
        }
      }
    } else if (pattern === "herringbone") {
      // Herringbone interlocking blocks
      // We loop over a wider diagonal grid and place rotated rectangles
      const size = Math.max(wPx, hPx);
      const hCols = Math.ceil(roomSvgWidth / size) + 6;
      const hRows = Math.ceil(roomSvgHeight / size) + 6;

      // To simplify drawing a V herringbone: draw interlocking horizontal and vertical tiles
      for (let r = -3; r < hRows; r++) {
        for (let c = -3; c < hCols; c++) {
          const x = c * stepY * 1.5;
          const y = r * stepY * 1.5;

          // Rotate group 45 degrees
          tilesList.push(
            <g key={`${r}-${c}`} transform={`translate(${x}, ${y}) rotate(45)`}>
              {/* V-shaped double tile block */}
              <rect x="0" y="0" width={wPx} height={hPx} fill="var(--bg-subtle)" stroke="var(--fg-secondary)" strokeWidth="0.75" fillOpacity="0.4" />
              <rect x={wPx} y={-wPx} width={hPx} height={wPx} fill="var(--bg-subtle)" stroke="var(--fg-secondary)" strokeWidth="0.75" fillOpacity="0.35" />
            </g>
          );
        }
      }
    } else if (pattern === "french") {
      // French Pattern modular layout (mixed sizes: square and rectangles)
      // Repeat modular layout offsets
      for (let r = -2; r < rows; r++) {
        for (let c = -2; c < cols; c++) {
          const x = c * stepX;
          const y = r * stepY;
          tilesList.push(
            <g key={`${r}-${c}`} transform={`translate(${x}, ${y})`}>
              {/* Modular mixed blocks mock */}
              <rect x="0" y="0" width={wPx} height={wPx} fill="var(--bg-subtle)" stroke="var(--fg-secondary)" strokeWidth="0.75" fillOpacity="0.4" />
              <rect x={wPx + gPx} y="0" width={wPx * 2} height={wPx} fill="var(--bg-subtle)" stroke="var(--fg-secondary)" strokeWidth="0.75" fillOpacity="0.3" />
              <rect x="0" y={wPx + gPx} width={wPx} height={wPx * 2} fill="var(--bg-subtle)" stroke="var(--fg-secondary)" strokeWidth="0.75" fillOpacity="0.3" />
              <rect x={wPx + gPx} y={wPx + gPx} width={wPx * 2} height={wPx * 2} fill="var(--bg-subtle)" stroke="var(--fg-secondary)" strokeWidth="0.75" fillOpacity="0.45" />
            </g>
          );
        }
      }
    }

    return tilesList;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 2D Canvas Display Column */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center relative select-none">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              2D Tile Pattern Visualizer
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold capitalize">
              {pattern} Pattern ({presets[tilePreset].label})
            </span>
          </div>

          {/* SVG Frame Canvas */}
          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden">
            <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-auto max-w-[360px] overflow-visible" role="img" aria-label="Tile Pattern Visualizer Grid">
              <defs>
                {/* Clip path to match exact room bounds */}
                <clipPath id="room-bounds">
                  <rect x="0" y="0" width={roomSvgWidth} height={roomSvgHeight} rx="4" />
                </clipPath>
              </defs>

              {/* Centered Room Group */}
              <g transform={`translate(${xOffset}, ${yOffset})`}>
                {/* Background base */}
                <rect x="0" y="0" width={roomSvgWidth} height={roomSvgHeight} fill="var(--bg)" stroke="var(--border-strong)" strokeWidth="1" />

                {/* Clipped repeating tile group */}
                <g clipPath="url(#room-bounds)">
                  {renderTiles()}
                </g>

                {/* Room Outer Border */}
                <rect x="0" y="0" width={roomSvgWidth} height={roomSvgHeight} fill="none" stroke="var(--fg)" strokeWidth="2.5" rx="4" />

                {/* Dimension Arrows */}
                {/* Width dimension arrow (below room) */}
                <g transform={`translate(0, ${roomSvgHeight + 15})`}>
                  <line x1="0" y1="0" x2={roomSvgWidth} y2="0" stroke="var(--accent)" strokeWidth="1" />
                  <polygon points={`0,0 5,-3 5,3`} fill="var(--accent)" />
                  <polygon points={`${roomSvgWidth},0 ${roomSvgWidth - 5},-3 ${roomSvgWidth - 5},3`} fill="var(--accent)" />
                  <rect x={(roomSvgWidth / 2) - 15} y="-8" width="30" height="15" fill="var(--bg-inset)" />
                  <text x={roomSvgWidth / 2} y="3" fill="var(--accent)" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {widthFt}&prime;
                  </text>
                </g>

                {/* Height dimension arrow (left side of room) */}
                <g transform={`translate(-18, 0)`}>
                  <line x1="0" y1="0" x2="0" y2={roomSvgHeight} stroke="var(--accent)" strokeWidth="1" />
                  <polygon points={`0,0 -3,5 3,5`} fill="var(--accent)" />
                  <polygon points={`0,${roomSvgHeight} -3,${roomSvgHeight - 5} 3,${roomSvgHeight - 5}`} fill="var(--accent)" />
                  <rect x="-15" y={(roomSvgHeight / 2) - 8} width="30" height="15" fill="var(--bg-inset)" />
                  <text x="0" y={(roomSvgHeight / 2) + 3} fill="var(--accent)" fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 0 ${roomSvgHeight / 2})`}>
                    {heightFt}&prime;
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Legenda Symbols */}
          <div className="w-full mt-3 flex flex-wrap gap-4 items-center justify-center text-[10px] text-[var(--fg-secondary)] bg-[var(--bg-inset)] p-2.5 rounded-lg border border-[var(--border)] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 bg-[var(--bg-subtle)] border border-[var(--fg-secondary)] opacity-50 inline-block" /> Full Tile
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 border border-dashed border-[var(--fg-secondary)] opacity-50 inline-block" /> Cut Tile (at wall borders)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-[var(--accent)] font-mono">G</span> Grout Joints ({groutWidthIn === 0.125 ? "1/8" : groutWidthIn === 0.0625 ? "1/16" : "1/4"}&Prime;)
            </span>
          </div>
        </div>

        {/* Configuration Controls */}
        <Card className="p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Configure Layout Parameters</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Width Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--fg-secondary)]">Room Width (ft)</span>
                <span className="font-bold text-[var(--accent)] font-mono">{widthFt}&prime;</span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                value={widthFt}
                onChange={(e) => setWidthFt(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {/* Height Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--fg-secondary)]">Room Height / Depth (ft)</span>
                <span className="font-bold text-[var(--accent)] font-mono">{heightFt}&prime;</span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                value={heightFt}
                onChange={(e) => setHeightFt(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border)] pt-4 text-xs">
            {/* Tile Size Preset */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[var(--fg-secondary)]">Tile Dimension Preset</span>
              <div className="flex flex-col gap-1.5">
                {(Object.keys(presets) as TilePresetId[]).map((preset) => (
                  <label key={preset} className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      checked={tilePreset === preset}
                      onChange={() => setTilePreset(preset)}
                      className="w-3.5 h-3.5 accent-[var(--accent)]"
                    />
                    {presets[preset].label}
                  </label>
                ))}
              </div>
            </div>

            {/* Layout Pattern Select */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[var(--fg-secondary)]">Laying Pattern</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: "straight", label: "Straight Grid" },
                  { id: "brick", label: "Brick Bond (1/2 Offset)" },
                  { id: "herringbone", label: "Herringbone" },
                  { id: "french", label: "French Pattern" }
                ].map((pt) => (
                  <label key={pt.id} className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      checked={pattern === pt.id}
                      onChange={() => setPattern(pt.id as any)}
                      className="w-3.5 h-3.5 accent-[var(--accent)]"
                    />
                    {pt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Spacing & Orientation */}
            <div className="flex flex-col gap-4">
              {/* Orientation (For 12x24 or 24x48) */}
              {(tilePreset === "12x24" || tilePreset === "24x48" || tilePreset === "3x6" || tilePreset === "4x12") && (
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-[var(--fg-secondary)]">Tile Orientation</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="radio"
                        checked={orientation === "horizontal"}
                        onChange={() => setOrientation("horizontal")}
                        className="w-3.5 h-3.5 accent-[var(--accent)]"
                      />
                      Horizontal
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="radio"
                        checked={orientation === "vertical"}
                        onChange={() => setOrientation("vertical")}
                        className="w-3.5 h-3.5 accent-[var(--accent)]"
                      />
                      Vertical
                    </label>
                  </div>
                </div>
              )}

              {/* Grout joint Width */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Grout Joint Width</span>
                <div className="flex gap-3">
                  {[
                    { val: 0.0625, label: "1/16\"" },
                    { val: 0.125, label: "1/8\"" },
                    { val: 0.25, label: "1/4\"" }
                  ].map((gr) => (
                    <label key={gr.val} className="flex items-center gap-1.5 cursor-pointer font-medium">
                      <input
                        type="radio"
                        checked={groutWidthIn === gr.val}
                        onChange={() => setGroutWidthIn(gr.val)}
                        className="w-3.5 h-3.5 accent-[var(--accent)]"
                      />
                      {gr.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Tile Thickness */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Tile Thickness (in)</span>
                <input
                  type="number"
                  step="0.125"
                  min="0.125"
                  max="0.75"
                  value={tileThicknessIn}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTileThicknessIn(isNaN(val) ? 0 : val);
                  }}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    setTileThicknessIn(isNaN(val) ? 0.375 : Math.max(0.125, Math.min(0.75, val)));
                  }}
                  className="w-full text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
                />
              </div>
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
              <span className="font-medium text-[var(--fg-secondary)]">Room Area Coverage</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.areaSqFt} Sq Ft</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Base Tiles Required</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.baseTilesCount} pieces</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Total Tiles (with {materials.wastePercent}% waste)</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.totalTilesCount} pieces</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Estimated Boxes Needed</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.estimatedBoxes} boxes</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Grout Quantity (dry weight)</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.groutWeightLbs} lbs</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Thinset Mortar Bags</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{materials.thinsetBags} bags (50 lbs each)</span>
            </div>
          </div>

          {/* Staged Weights Grid */}
          <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-4 text-xs flex flex-col gap-3">
            <span className="font-bold text-[var(--fg)] uppercase tracking-wider text-[10px] block mb-1">
              Hauling Logistics Weight Estimates
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[var(--fg-muted)] block mb-0.5">Tile Box Load</span>
                <span className="text-sm font-bold text-[var(--fg)] tabular-nums">{materials.tileWeightLbs.toLocaleString()} lbs</span>
              </div>
              <div>
                <span className="text-[var(--fg-muted)] block mb-0.5">Thinset & Grout</span>
                <span className="text-sm font-bold text-[var(--fg)] tabular-nums">{(materials.thinsetBags * 50 + materials.groutWeightLbs).toLocaleString()} lbs</span>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-2.5 mt-1 flex justify-between items-center">
              <span className="font-bold text-[var(--fg-secondary)]">Total Cargo Load</span>
              <span className="text-sm font-black text-[var(--accent)] tabular-nums">{materials.totalWeightLbs.toLocaleString()} lbs</span>
            </div>
          </div>

          {/* Cost Estimator Widget */}
          <CostEstimatorWidget
            items={[
              {
                key: "tile_sqft",
                name: "Floor / Wall Tiles",
                quantity: materials.areaSqFt,
                unit: "sq ft",
                defaultPrice: 3.50,
              },
              {
                key: "tile_mortar_sqft",
                name: "Thinset Mortar / Adhesive",
                quantity: materials.areaSqFt,
                unit: "sq ft",
                defaultPrice: 0.85,
              },
              {
                key: "tile_grout_sqft",
                name: "Grout",
                quantity: materials.areaSqFt,
                unit: "sq ft",
                defaultPrice: 0.45,
              },
            ] satisfies CostItem[]}
            defaultLaborHours={Math.max(4, Math.round(materials.areaSqFt / 15))}
          />

          {/* Payload Redirect Hook */}
          <a
            href={`/calculators/payload/?weight=${materials.totalWeightLbs}&material=tile`}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-sm text-center no-print"
          >
            Check Vehicle Payload Safety & Trips &rarr;
          </a>

          {/* Warning disclaimer YMYL */}
          <div className="border-l-4 border-l-[var(--warning)] bg-[var(--bg-subtle)] p-3 rounded-r-lg text-[10px] leading-relaxed text-[var(--fg-secondary)]">
            <strong>NOTICE:</strong> Calculations are estimates based on standard tile pattern math. Tiling yields vary by cut centering offsets and installer skill. Always purchase 10%–15% waste buffers above estimates.
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(TileDesigner);
