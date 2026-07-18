import React, { useState, useEffect } from "react";
import { calculateWainscoting, decimalToFraction, type WainscotingDimensions, type WainscotingObstacle, type StilePosition, type RailPosition, type PictureFramePosition, type SlatPosition } from "../../lib/wainscotingEngine";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import CostEstimatorWidget, { type CostItem } from "../ui/CostEstimatorWidget";
import { useProjects } from "../../lib/useProjects";
import AddToProjectCard from "../ui/AddToProjectCard";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function WainscotingDesigner() {
  const { t } = useI18n();
  const [shareSuccess, setShareSuccess] = useState(false);

  // Basic wall dimensions
  const [wallWidth, setWallWidth] = useState<number>(() => getUrlParam("ww", 144)); // 12 ft
  const [wallHeight, setWallHeight] = useState<number>(() => getUrlParam("wh", 96));  // 8 ft
  const [style, setStyle] = useState<"board-batten" | "shaker" | "picture-frame" | "wood-slat">(() => getUrlParam("st", "board-batten") as any);
  
  // Board dimensions
  const [boardWidth, setBoardWidth] = useState<number>(() => getUrlParam("bw", 3.5)); // 1x4 (nominal)
  const [boardThickness, setBoardThickness] = useState<number>(() => getUrlParam("bt", 0.75)); // 3/4"
  
  // Layout spacing configurations
  const [panelCount, setPanelCount] = useState<number>(() => getUrlParam("pc", 6)); // number of panels/spaces
  const [rowCount, setRowCount] = useState<number>(() => getUrlParam("rc", 1));     // horizontal rows
  const [topRailWidth, setTopRailWidth] = useState<number>(() => getUrlParam("trw", 3.5));
  const [bottomRailWidth, setBottomRailWidth] = useState<number>(() => getUrlParam("brw", 5.5)); // 1x6 baseboard typical
  const [midRailWidth, setMidRailWidth] = useState<number>(() => getUrlParam("mrw", 3.5));
  const [gapWidth, setGapWidth] = useState<number>(() => getUrlParam("gw", 4)); // for picture-frame gaps or slat gaps
  const [topGap, setTopGap] = useState<number>(() => getUrlParam("tg", 4));
  const [bottomGap, setBottomGap] = useState<number>(() => getUrlParam("bg", 4));
  
  // Shift offset (allows manually sliding stiles to avoid outlets)
  const [layoutOffset, setLayoutOffset] = useState<number>(() => getUrlParam("lo", 0));

  // Lumber purchase configurations
  const [lumberLengthFt, setLumberLengthFt] = useState<8 | 10 | 12 | 16>(() => getUrlParam("ll", 8) as any);
  const [wastePercent, setWastePercent] = useState<number>(() => getUrlParam("wp", 10));

  // Obstacles list (outlets, windows, switches)
  const [obstacles, setObstacles] = useState<WainscotingObstacle[]>(() => {
    const raw = getUrlParam("obs", "");
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
      { id: "obs-1", name: "Outlet 1", type: "outlet", x: 24, y: 14, width: 3, height: 4.5 },
      { id: "obs-2", name: "Switch 1", type: "switch", x: 110, y: 48, width: 3, height: 4.5 }
    ];
  });

  // Project persistence integration
  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects(
    "wainscoting-designer",
    "Dynamic Wainscoting & Accent Wall Designer"
  );

  // Calculate coordinates and materials
  const dims: WainscotingDimensions = {
    wallWidth,
    wallHeight,
    style,
    boardWidth,
    boardThickness,
    topRailWidth,
    bottomRailWidth,
    midRailWidth,
    panelCount,
    rowCount,
    gapWidth,
    topGap,
    bottomGap,
    lumberLengthFt,
    wastePercent,
    obstacles: obstacles.map(obs => ({
      ...obs,
      // Apply offset shifting only to vertical stile collision detection by shifting obstacle coordinates relatively!
      // This is mathematically equivalent to shifting stiles on the canvas but easier for raw intersection math.
      x: obs.x - layoutOffset
    }))
  };

  // Sync state to URL parameters for shareable layout links
  useEffect(() => {
    setUrlParams(
      {
        ww: wallWidth, wh: wallHeight, st: style, bw: boardWidth, bt: boardThickness,
        pc: panelCount, rc: rowCount, trw: topRailWidth, brw: bottomRailWidth,
        mrw: midRailWidth, gw: gapWidth, tg: topGap, bg: bottomGap, lo: layoutOffset,
        ll: lumberLengthFt, wp: wastePercent, obs: JSON.stringify(obstacles)
      },
      {
        ww: 144, wh: 96, st: "board-batten", bw: 3.5, bt: 0.75,
        pc: 6, rc: 1, trw: 3.5, brw: 5.5,
        mrw: 3.5, gw: 4, tg: 4, bg: 4, lo: 0,
        ll: 8, wp: 10, obs: JSON.stringify([
          { id: "obs-1", name: "Outlet 1", type: "outlet", x: 24, y: 14, width: 3, height: 4.5 },
          { id: "obs-2", name: "Switch 1", type: "switch", x: 110, y: 48, width: 3, height: 4.5 }
        ])
      }
    );
  }, [wallWidth, wallHeight, style, boardWidth, boardThickness, panelCount, rowCount,
    topRailWidth, bottomRailWidth, midRailWidth, gapWidth, topGap, bottomGap, layoutOffset,
    lumberLengthFt, wastePercent, obstacles]);

  const results = calculateWainscoting(dims);

  // Add the layout offset back to rendering positions so the visualizer matches the shifted state
  const stilePositionsShifted = results.stilePositions.map(stile => ({
    ...stile,
    x: stile.x + layoutOffset
  }));

  const slatPositionsShifted = results.slatPositions.map(slat => ({
    ...slat,
    x: slat.x + layoutOffset
  }));

  const framePositionsShifted = results.framePositions.map(frame => ({
    ...frame,
    x: frame.x + layoutOffset
  }));

  // Re-verify clashes after visual shifting
  const finalStilePositions = stilePositionsShifted.map(stile => {
    const clashingWith: string[] = [];
    for (const obs of obstacles) {
      // Check collision
      const hasClash = (
        stile.x < obs.x + obs.width &&
        stile.x + stile.width > obs.x &&
        stile.y < obs.y + obs.height &&
        stile.y + stile.height > obs.y
      );
      if (hasClash) clashingWith.push(obs.name);
    }
    return { ...stile, hasClash: clashingWith.length > 0, clashingWith };
  });

  const finalSlatPositions = slatPositionsShifted.map(slat => {
    const clashingWith: string[] = [];
    for (const obs of obstacles) {
      const hasClash = (
        slat.x < obs.x + obs.width &&
        slat.x + slat.width > obs.x &&
        0 < obs.y + obs.height &&
        slat.height > obs.y
      );
      if (hasClash) clashingWith.push(obs.name);
    }
    return { ...slat, hasClash: clashingWith.length > 0, clashingWith };
  });

  const finalFramePositions = framePositionsShifted.map(frame => {
    const clashingWith: string[] = [];
    for (const obs of obstacles) {
      const hasClash = (
        frame.x < obs.x + obs.width &&
        frame.x + frame.width > obs.x &&
        frame.y < obs.y + obs.height &&
        frame.y + frame.height > obs.y
      );
      if (hasClash) clashingWith.push(obs.name);
    }
    return { ...frame, hasClash: clashingWith.length > 0, clashingWith };
  });

  const finalClashesDetected = finalStilePositions.some(s => s.hasClash) ||
                               finalSlatPositions.some(s => s.hasClash) ||
                               finalFramePositions.some(f => f.hasClash);

  // SVG Scaler calculations
  // Max width/height to fit on screen. Canvas area is ~450x300 px
  const canvasWidth = 500;
  const canvasHeight = 350;
  const scaleX = 420 / wallWidth;
  const scaleY = 270 / wallHeight;
  const scale = Math.min(scaleX, scaleY);

  const wallSvgWidth = wallWidth * scale;
  const wallSvgHeight = wallHeight * scale;
  const xOffset = (canvasWidth - wallSvgWidth) / 2;
  const yOffset = (canvasHeight - wallSvgHeight) / 2;

  // Obstacle management
  const addObstacle = (type: WainscotingObstacle["type"]) => {
    const defaults: Record<WainscotingObstacle["type"], Omit<WainscotingObstacle, "id">> = {
      outlet: { name: `Outlet ${obstacles.length + 1}`, type: "outlet", x: 40, y: 14, width: 3, height: 4.5 },
      switch: { name: `Switch ${obstacles.length + 1}`, type: "switch", x: 72, y: 48, width: 3, height: 4.5 },
      window: { name: `Window ${obstacles.length + 1}`, type: "window", x: 50, y: 30, width: 28, height: 48 },
      door: { name: `Door ${obstacles.length + 1}`, type: "door", x: 10, y: 0, width: 32, height: 80 },
      custom: { name: `Obstacle ${obstacles.length + 1}`, type: "custom", x: 60, y: 30, width: 12, height: 12 }
    };
    const newObs: WainscotingObstacle = {
      id: `obs-${Date.now()}`,
      ...defaults[type]
    };
    setObstacles([...obstacles, newObs]);
  };

  const removeObstacle = (id: string) => {
    setObstacles(obstacles.filter(obs => obs.id !== id));
  };

  const updateObstacle = (id: string, updates: Partial<WainscotingObstacle>) => {
    setObstacles(obstacles.map(obs => obs.id === id ? { ...obs, ...updates } as WainscotingObstacle : obs));
  };

  // Sync inputs with Project Planner calculations schema
  const projectInputs = {
    wallWidth,
    wallHeight,
    style,
    panelCount,
    rowCount,
    boardWidth,
    layoutOffset
  };

  const projectResults = {
    stilesCount: results.stilesCount,
    railsCount: results.railsCount,
    totalLinearFt: results.totalLinearFtWaste,
    boardsToBuy: results.boardsToBuy,
    exactSpacing: results.exactSpacingFraction,
    clashesDetected: finalClashesDetected ? "Yes" : "No"
  };

  const projectMaterials = [
    {
      name: `${style === "wood-slat" ? "Slats" : style === "picture-frame" ? "Molding Trim" : "Boards"} (${lumberLengthFt}ft length)`,
      quantity: results.boardsToBuy,
      unit: "pcs",
      category: "siding"
    },
    {
      name: "Liquid Nails panel adhesive",
      quantity: Math.ceil(results.totalLinearFtWaste / 30),
      unit: "tubes",
      category: "finishing"
    },
    {
      name: "Caulk / Wood Filler",
      quantity: Math.ceil(results.totalLinearFtWaste / 50),
      unit: "tubes",
      category: "finishing"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 2D Canvas Display Column */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* The Designer SVG Canvas */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center relative select-none">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              2D Architectural Grid & obstacle clash visualizer
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold capitalize">
              {style.replace("-", " ")} Plan ({wallWidth}&Prime; &times; {wallHeight}&Prime;)
            </span>
          </div>

          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden relative">
            {/* Visual Warning for Clashes */}
            {finalClashesDetected && (
              <div className="absolute top-2 left-2 z-10 text-[9px] bg-red-500/10 border border-red-500/30 text-red-500 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                Obstacle Clash Warning
              </div>
            )}

            <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-auto max-w-[500px] overflow-visible" role="img" aria-label="Wainscoting Accent Wall Blueprint">
              {/* Scale Wall Group */}
              <g transform={`translate(${xOffset}, ${yOffset})`}>
                {/* Wall Base Drywall */}
                <rect x="0" y="0" width={wallSvgWidth} height={wallSvgHeight} fill="var(--bg)" stroke="var(--border-strong)" strokeWidth="1" />

                {/* Vertical Stud Lines (16" on center indicator) */}
                {Array.from({ length: Math.floor(wallWidth / 16) }).map((_, idx) => {
                  const studX = (idx + 1) * 16 * scale;
                  return (
                    <line
                      key={idx}
                      x1={studX}
                      y1="0"
                      x2={studX}
                      y2={wallSvgHeight}
                      stroke="var(--fg-muted)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      strokeOpacity="0.25"
                    />
                  );
                })}

                {/* Render Wainscoting Boards based on style */}
                {/* 1. Board & Batten or Shaker */}
                {(style === "board-batten" || style === "shaker") && (
                  <>
                    {/* Stiles */}
                    {finalStilePositions.map((stile) => (
                      <rect
                        key={`stile-${stile.index}`}
                        x={stile.x * scale}
                        // SVG y=0 is top, our y=0 is floor (bottom)
                        y={(wallHeight - stile.y - stile.height) * scale}
                        width={stile.width * scale}
                        height={stile.height * scale}
                        fill={stile.hasClash ? "var(--error)" : "var(--fg-secondary)"}
                        fillOpacity={stile.hasClash ? 0.35 : 0.8}
                        stroke={stile.hasClash ? "var(--error)" : "var(--fg)"}
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Rails */}
                    {results.railPositions.map((rail, idx) => (
                      <rect
                        key={`rail-${idx}`}
                        x={rail.x * scale}
                        y={(wallHeight - rail.y - rail.height) * scale}
                        width={rail.width * scale}
                        height={rail.height * scale}
                        fill={rail.hasClash ? "var(--error)" : "var(--fg-secondary)"}
                        fillOpacity={rail.hasClash ? 0.35 : 0.9}
                        stroke={rail.hasClash ? "var(--error)" : "var(--fg)"}
                        strokeWidth="1.5"
                      />
                    ))}
                  </>
                )}

                {/* 2. Picture Frame Molding */}
                {style === "picture-frame" && (
                  <>
                    {finalFramePositions.map((frame, idx) => (
                      <g key={`frame-${idx}`}>
                        {/* Outer Frame Path */}
                        <rect
                          x={frame.x * scale}
                          y={(wallHeight - frame.y - frame.height) * scale}
                          width={frame.width * scale}
                          height={frame.height * scale}
                          fill="none"
                          stroke={frame.hasClash ? "var(--error)" : "var(--accent)"}
                          strokeWidth="2.5"
                        />
                        {/* Inner molding profile depth indicator */}
                        <rect
                          x={(frame.x + 1) * scale}
                          y={(wallHeight - frame.y - frame.height + 1) * scale}
                          width={(frame.width - 2) * scale}
                          height={(frame.height - 2) * scale}
                          fill="none"
                          stroke={frame.hasClash ? "var(--error)" : "var(--accent)"}
                          strokeWidth="0.75"
                          strokeOpacity="0.5"
                        />
                      </g>
                    ))}
                  </>
                )}

                {/* 3. Wood Slat Wall */}
                {style === "wood-slat" && (
                  <>
                    {finalSlatPositions.map((slat) => (
                      <rect
                        key={`slat-${slat.index}`}
                        x={slat.x * scale}
                        y="0"
                        width={slat.width * scale}
                        height={wallSvgHeight}
                        fill={slat.hasClash ? "var(--error)" : "var(--accent)"}
                        fillOpacity={slat.hasClash ? 0.35 : 0.75}
                        stroke={slat.hasClash ? "var(--error)" : "var(--accent)"}
                        strokeWidth="0.5"
                      />
                    ))}
                  </>
                )}

                {/* Render Obstacles */}
                {obstacles.map((obs) => {
                  const isOutlet = obs.type === "outlet" || obs.type === "switch";
                  const color = isOutlet ? "#1c1917" : "var(--fg-muted)";
                  return (
                    <g key={obs.id}>
                      {/* Obstacle box */}
                      <rect
                        x={obs.x * scale}
                        y={(wallHeight - obs.y - obs.height) * scale}
                        width={obs.width * scale}
                        height={obs.height * scale}
                        fill={color}
                        fillOpacity={isOutlet ? 0.95 : 0.15}
                        stroke="var(--border-strong)"
                        strokeWidth="1.5"
                        rx="1"
                      />
                      {/* Outlet face design elements */}
                      {isOutlet && (
                        <>
                          <circle cx={(obs.x + obs.width / 2) * scale} cy={(wallHeight - obs.y - obs.height / 3) * scale} r="1.5" fill="#fafaf9" />
                          <circle cx={(obs.x + obs.width / 2) * scale} cy={(wallHeight - obs.y - 2 * obs.height / 3) * scale} r="1.5" fill="#fafaf9" />
                        </>
                      )}
                      {/* Obstacle Label */}
                      <text
                        x={(obs.x + obs.width / 2) * scale}
                        y={(wallHeight - obs.y - obs.height - 3) * scale}
                        fill="var(--fg-muted)"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {obs.name}
                      </text>
                    </g>
                  );
                })}

                {/* Dimension Arrows */}
                {/* Wall Width dimension */}
                <g transform={`translate(0, ${wallSvgHeight + 15})`}>
                  <line x1="0" y1="0" x2={wallSvgWidth} y2="0" stroke="var(--accent)" strokeWidth="1" />
                  <polygon points={`0,0 5,-3 5,3`} fill="var(--accent)" />
                  <polygon points={`${wallSvgWidth},0 ${wallSvgWidth - 5},-3 ${wallSvgWidth - 5},3`} fill="var(--accent)" />
                  <rect x={(wallSvgWidth / 2) - 15} y="-8" width="30" height="15" fill="var(--bg-inset)" />
                  <text x={wallSvgWidth / 2} y="3" fill="var(--accent)" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {wallWidth}&Prime;
                  </text>
                </g>

                {/* Wall Height dimension (left) */}
                <g transform={`translate(-18, 0)`}>
                  <line x1="0" y1="0" x2="0" y2={wallSvgHeight} stroke="var(--accent)" strokeWidth="1" />
                  <polygon points={`0,0 -3,5 3,5`} fill="var(--accent)" />
                  <polygon points={`0,${wallSvgHeight} -3,${wallSvgHeight - 5} 3,${wallSvgHeight - 5}`} fill="var(--accent)" />
                  <rect x="-15" y={(wallSvgHeight / 2) - 8} width="30" height="15" fill="var(--bg-inset)" />
                  <text x="0" y={(wallSvgHeight / 2) + 3} fill="var(--accent)" fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 0 ${wallSvgHeight / 2})`}>
                    {wallHeight}&Prime;
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Color Key / Legend */}
          <div className="w-full mt-3 flex flex-wrap gap-4 items-center justify-center text-[10px] text-[var(--fg-secondary)] bg-[var(--bg-inset)] p-2.5 rounded-lg border border-[var(--border)] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[var(--fg-secondary)] border border-[var(--fg)] inline-block" /> Board/Stile
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-[var(--accent)] inline-block" /> Decorative Molding
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#1c1917] border border-[var(--border-strong)] inline-block" /> Outlet/Switch
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-red-500/30 border border-red-500 inline-block" /> Clash Conflict
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-0 border-t border-dashed border-[var(--fg-muted)] opacity-60 inline-block" /> 16&Prime; Wall Stud
            </span>
          </div>
        </div>

        {/* Input sliders and styling settings */}
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Configure Spacing Parameters</h3>
            <div className="flex items-center gap-1">
              {["board-batten", "shaker", "picture-frame", "wood-slat"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStyle(s as any);
                    if (s === "picture-frame" || s === "shaker") {
                      setRowCount(2);
                    } else {
                      setRowCount(1);
                    }
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors capitalize ${style === s ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] text-[var(--fg-secondary)]"}`}
                >
                  {s.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Wall Width Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--fg-secondary)]">Wall Width (inches)</span>
                <span className="font-bold text-[var(--accent)] font-mono">{wallWidth}&Prime; ({decimalToFraction(wallWidth)})</span>
              </div>
              <input
                type="range"
                min="48"
                max="240"
                value={wallWidth}
                onChange={(e) => setWallWidth(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
                aria-label="Wall width in inches"
              />
            </div>

            {/* Wall Height Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--fg-secondary)]">Wall Height (inches)</span>
                <span className="font-bold text-[var(--accent)] font-mono">{wallHeight}&Prime; ({decimalToFraction(wallHeight)})</span>
              </div>
              <input
                type="range"
                min="48"
                max="144"
                value={wallHeight}
                onChange={(e) => setWallHeight(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
                aria-label="Wall height in inches"
              />
            </div>

            {/* Panel Column Count Slider */}
            {style !== "wood-slat" && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--fg-secondary)]">Horizontal Panel Columns</span>
                  <span className="font-bold text-[var(--accent)] font-mono">{panelCount} Columns</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={panelCount}
                  onChange={(e) => setPanelCount(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                  aria-label="Horizontal panel columns count"
                />
              </div>
            )}

            {/* Rows Count Slider */}
            {(style === "shaker" || style === "picture-frame") && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--fg-secondary)]">Vertical Panel Rows</span>
                  <span className="font-bold text-[var(--accent)] font-mono">{rowCount} Rows</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={rowCount}
                  onChange={(e) => setRowCount(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                  aria-label="Vertical panel rows count"
                />
              </div>
            )}

            {/* Offset Shift Slider */}
            {(style === "board-batten" || style === "shaker" || style === "wood-slat") && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--fg-secondary)]">Layout Shift Offset (avoid outlets)</span>
                  <span className="font-bold text-[var(--accent)] font-mono">{layoutOffset > 0 ? `+${layoutOffset}` : layoutOffset}&Prime;</span>
                </div>
                <input
                  type="range"
                  min="-24"
                  max="24"
                  step="0.25"
                  value={layoutOffset}
                  onChange={(e) => setLayoutOffset(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent)] cursor-pointer"
                  aria-label="Layout shift offset in inches to avoid outlet boxes"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border)] pt-4 text-xs">
            {/* Board Sizing */}
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-[var(--fg-secondary)]">Board/Stile Width</span>
              <select
                value={boardWidth}
                onChange={(e) => setBoardWidth(parseFloat(e.target.value))}
                className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-2 font-medium"
              >
                <option value="1.5">1.5&Prime; (Nominal 1x2)</option>
                <option value="2.5">2.5&Prime; (Nominal 1x3)</option>
                <option value="3.5">3.5&Prime; (Nominal 1x4)</option>
                <option value="5.5">5.5&Prime; (Nominal 1x6)</option>
              </select>
            </div>

            {/* Top Rail Width */}
            {(style === "board-batten" || style === "shaker") && (
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Top Rail Width</span>
                <select
                  value={topRailWidth}
                  onChange={(e) => setTopRailWidth(parseFloat(e.target.value))}
                  className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-2 font-medium"
                >
                  <option value="0">None</option>
                  <option value="1.5">1.5&Prime; (1x2)</option>
                  <option value="2.5">2.5&Prime; (1x3)</option>
                  <option value="3.5">3.5&Prime; (1x4)</option>
                  <option value="5.5">5.5&Prime; (1x6)</option>
                </select>
              </div>
            )}

            {/* Bottom Rail Width */}
            {(style === "board-batten" || style === "shaker") && (
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Bottom Rail Width</span>
                <select
                  value={bottomRailWidth}
                  onChange={(e) => setBottomRailWidth(parseFloat(e.target.value))}
                  className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-2 font-medium"
                >
                  <option value="0">None</option>
                  <option value="3.5">3.5&Prime; (1x4)</option>
                  <option value="5.5">5.5&Prime; (1x6)</option>
                  <option value="7.25">7.25&Prime; (1x8)</option>
                </select>
              </div>
            )}

            {/* Picture Frame Gaps */}
            {style === "picture-frame" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-[var(--fg-secondary)]">Frame Box Gap (in)</span>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={gapWidth}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGapWidth(isNaN(val) ? 0 : val);
                    }}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      setGapWidth(isNaN(val) ? 4 : Math.max(2, Math.min(12, val)));
                    }}
                    className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-2 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-[var(--fg-secondary)]">Top margin (in)</span>
                  <input
                    type="number"
                    min="2"
                    max="18"
                    value={topGap}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTopGap(isNaN(val) ? 0 : val);
                    }}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      setTopGap(isNaN(val) ? 4 : Math.max(2, Math.min(18, val)));
                    }}
                    className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-2 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-[var(--fg-secondary)]">Bottom margin (in)</span>
                  <input
                    type="number"
                    min="2"
                    max="18"
                    value={bottomGap}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setBottomGap(isNaN(val) ? 0 : val);
                    }}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      setBottomGap(isNaN(val) ? 4 : Math.max(2, Math.min(18, val)));
                    }}
                    className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-2 font-medium"
                  />
                </div>
              </>
            )}

            {/* Slat gaps */}
            {style === "wood-slat" && (
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Desired Slat Gap (in)</span>
                <input
                  type="number"
                  min="0.25"
                  max="6"
                  step="0.125"
                  value={gapWidth}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setGapWidth(isNaN(val) ? 0 : val);
                  }}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    setGapWidth(isNaN(val) ? 1 : Math.max(0.25, Math.min(6, val)));
                  }}
                  className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-2 font-medium"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Obstacles Placement Interface */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Manage Wall Obstacles (Outlets, Windows)</h3>
            <div className="flex gap-1.5 text-[10px]">
              <button onClick={() => addObstacle("outlet")} className="bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] px-2.5 py-1 rounded font-bold transition-colors pointer-cursor">
                + Add Outlet
              </button>
              <button onClick={() => addObstacle("switch")} className="bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] px-2.5 py-1 rounded font-bold transition-colors pointer-cursor">
                + Add Switch
              </button>
              <button onClick={() => addObstacle("window")} className="bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] px-2.5 py-1 rounded font-bold transition-colors pointer-cursor">
                + Add Window
              </button>
            </div>
          </div>

          {obstacles.length === 0 ? (
            <span className="text-xs text-[var(--fg-muted)] italic py-2">No obstacles added. Your wall is a flat surface.</span>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {obstacles.map((obs) => (
                <div key={obs.id} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-center p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-xs">
                  <div className="font-bold capitalize flex items-center gap-1.5 sm:col-span-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${obs.type === "outlet" || obs.type === "switch" ? "bg-stone-800" : "bg-blue-400"}`} />
                    {obs.type}
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--fg-muted)]">Name</span>
                    <input type="text" value={obs.name} onChange={(e) => updateObstacle(obs.id, { name: e.target.value })} className="bg-[var(--bg-inset)] border border-[var(--border)] rounded p-1 font-medium text-xs focus:outline-none" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--fg-muted)]">Distance from Left (in)</span>
                    <input type="number" value={obs.x} onChange={(e) => updateObstacle(obs.id, { x: parseFloat(e.target.value) || 0 })} className="bg-[var(--bg-inset)] border border-[var(--border)] rounded p-1 font-medium text-xs focus:outline-none" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--fg-muted)]">Height from Floor (in)</span>
                    <input type="number" value={obs.y} onChange={(e) => updateObstacle(obs.id, { y: parseFloat(e.target.value) || 0 })} className="bg-[var(--bg-inset)] border border-[var(--border)] rounded p-1 font-medium text-xs focus:outline-none" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-[var(--fg-muted)]">Dimensions (W &times; H)</span>
                    <div className="flex items-center gap-1">
                      <input type="number" value={obs.width} onChange={(e) => updateObstacle(obs.id, { width: parseFloat(e.target.value) || 1 })} className="w-10 bg-[var(--bg-inset)] border border-[var(--border)] rounded p-1 font-medium text-xs focus:outline-none" />
                      <span>&times;</span>
                      <input type="number" value={obs.height} onChange={(e) => updateObstacle(obs.id, { height: parseFloat(e.target.value) || 1 })} className="w-10 bg-[var(--bg-inset)] border border-[var(--border)] rounded p-1 font-medium text-xs focus:outline-none" />
                    </div>
                  </div>

                  <button onClick={() => removeObstacle(obs.id)} className="text-red-500 hover:text-red-700 font-bold self-end sm:self-center py-1 sm:py-0 text-[10px] uppercase text-right cursor-pointer">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Material & Shopping Checklist Column */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Sync with Project Planner Widget */}
        <AddToProjectCard
          projects={projects}
          onAdd={(pid) => {
            clearSuccess();
            addToProject(pid, projectInputs, projectResults, projectMaterials);
          }}
          successMessage={projectSuccess}
        />

        {/* Live Calculation Output Card */}
        <Card className="p-6 flex flex-col gap-4">
          <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--fg)]">Live Material Takeoffs</h3>
            <div className="flex gap-2 items-center no-print">
              <button
                onClick={() => window.print()}
                className="text-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
              >
                Print Plan
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
            {/* Spacing Result */}
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Calculated Panel Spacing</span>
              <span className="font-bold text-[var(--accent)] font-mono tabular-nums bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10">
                {results.exactSpacingFraction} ({results.exactSpacingIn.toFixed(2)}&Prime;)
              </span>
            </div>

            {/* Stiles Count */}
            {style !== "picture-frame" && (
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--fg-secondary)]">
                  {style === "wood-slat" ? "Total Wood Slats" : "Vertical Stiles"}
                </span>
                <span className="font-bold text-[var(--fg)] tabular-nums">{results.stilesCount} boards</span>
              </div>
            )}

            {/* Rails Count */}
            {(style === "board-batten" || style === "shaker") && (
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--fg-secondary)]">Horizontal Rails</span>
                <span className="font-bold text-[var(--fg)] tabular-nums">{results.railsCount} boards</span>
              </div>
            )}

            {/* Total linear footage */}
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Total Wood Needed</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{results.totalLinearFt.toFixed(1)} linear ft</span>
            </div>

            {/* Linear footage including waste */}
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="font-medium text-[var(--fg-secondary)]">Total with {wastePercent}% Waste</span>
              <span className="font-bold text-[var(--fg)] tabular-nums">{results.totalLinearFtWaste.toFixed(1)} linear ft</span>
            </div>

            {/* Board optimizer packing results */}
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--fg)]">Purchase Recommendation</span>
                <span className="font-extrabold text-[var(--accent)] tabular-nums font-mono text-sm bg-[var(--accent)]/10 px-2.5 py-0.5 rounded border border-[var(--accent)]/20">
                  {results.boardsToBuy} Boards
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-[var(--fg-muted)]">
                <span>Standard Lumber Length</span>
                <select
                  value={lumberLengthFt}
                  onChange={(e) => setLumberLengthFt(parseInt(e.target.value) as any)}
                  className="bg-[var(--bg-inset)] border border-[var(--border)] rounded px-1.5 py-0.5 font-bold"
                >
                  <option value="8">8-Foot Boards</option>
                  <option value="10">10-Foot Boards</option>
                  <option value="12">12-Foot Boards</option>
                  <option value="16">16-Foot Boards</option>
                </select>
              </div>
              <span className="text-[9px] text-[var(--fg-muted)] leading-tight italic">
                Optimized by cutting-stock algorithm to fit cuts with minimal leftovers. Always buy 1-2 extra boards as backup.
              </span>
            </div>
          </div>
        </Card>

        {/* Cost Estimator Widget */}
        <CostEstimatorWidget
          items={[
            {
              key: "wainscot_board_lf",
              name: style === "wood-slat" ? "Wood Slats" : style === "picture-frame" ? "Molding Trim" : "Board Lumber (Stiles)",
              quantity: Math.round(results.totalLinearFtWaste * 10) / 10,
              unit: "lf",
              defaultPrice: 1.20,
            },
            {
              key: "wainscot_cap_rail_lf",
              name: "Cap Rail",
              quantity: Math.round(results.topRailLengthIn / 12 * 10) / 10,
              unit: "lf",
              defaultPrice: 2.80,
            },
            {
              key: "wainscot_chair_rail_lf",
              name: "Chair Rail",
              quantity: Math.round((results.midRailLengthIn * (results.railsCount > 2 ? results.railsCount - 2 : 0)) / 12 * 10) / 10,
              unit: "lf",
              defaultPrice: 2.20,
            },
            {
              key: "wainscot_shoe_rail_lf",
              name: "Shoe Rail / Baseboard",
              quantity: Math.round(results.bottomRailLengthIn / 12 * 10) / 10,
              unit: "lf",
              defaultPrice: 1.80,
            },
          ] satisfies CostItem[]}
          defaultLaborHours={8}
        />

        {/* Detailed Cut List Card */}
        <Card className="p-5 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[var(--fg)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
            Optimized Cutting Instructions
          </h3>
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {results.cutList.map((cut, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded bg-[var(--bg-inset)] border border-[var(--border)] text-xs font-mono">
                <div className="flex flex-col">
                  <span className="font-bold text-[var(--fg)]">{cut.label}</span>
                  <span className="text-[10px] text-[var(--fg-muted)] capitalize">{cut.type.replace("-", " ")}</span>
                </div>
                <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-1 rounded border border-[var(--accent)]/15">
                  &times; {cut.count} pcs
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(WainscotingDesigner);
