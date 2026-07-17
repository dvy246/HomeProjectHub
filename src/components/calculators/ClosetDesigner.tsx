import React, { useState, useCallback, useEffect } from "react";
import {
  calculateCloset, decimalToFraction, MODE_CONFIGS,
  type ClosetLayout, type ClosetSection, type ClosetSectionType,
  type ClosetRoomMode, type ClosetWall, type ClosetItem,
} from "../../lib/closetEngine";
import { Card } from "../ui/Card";
import { useProjects } from "../../lib/useProjects";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";

const STORAGE_KEY = "home_project_hub_closet_design_v2";

function loadSavedDesign(): ClosetLayout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClosetLayout;
  } catch { return null; }
}

function saveDesign(state: ClosetLayout): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function clearSavedDesign(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

const MODE_ICONS: Record<ClosetRoomMode, string> = {
  "reach-in": "M4 6h16v12H4z",
  "walk-in-l": "M4 6h12v12H4z M16 10h4v8h-4z",
  "walk-in-u": "M4 6h16v4H4z M4 10h4v8H4z M16 10h4v8h-4z",
  pantry: "M4 4h4v16H4z M10 4h4v16h-4z M16 4h4v16h-4z",
  mudroom: "M4 6h4v12H4z M10 6h4v12h-4z M16 6h4v12h-4z",
  garage: "M3 9l9-7 9 7v11H3z",
};

const MODE_ORDER: ClosetRoomMode[] = ["reach-in", "walk-in-l", "walk-in-u", "pantry", "mudroom", "garage"];

let idCounter = Date.now();
function genId(): string { return `id-${idCounter++}-${Math.random().toString(36).slice(2, 6)}`; }

function wallsFromDefaults(defaultWalls: { label: string; width: number; sections: Omit<ClosetSection, "id">[] }[]): ClosetWall[] {
  return defaultWalls.map(w => ({
    id: genId(),
    label: w.label,
    width: w.width,
    sections: w.sections.map(s => ({ ...s, id: genId() })),
  }));
}

const SECTION_LABELS: Record<ClosetSectionType, string> = {
  "single-hang": "Single Hang",
  "double-hang": "Double Hang",
  shelf: "Shelf",
  drawer: "Drawers",
  "shoe-rack": "Shoe Rack",
  hooks: "Hooks",
  cubby: "Cubby",
  "heavy-shelf": "Heavy Shelf",
  pegboard: "Pegboard",
};

const SECTION_ICONS: Record<ClosetSectionType, string> = {
  "single-hang": "M6 20h4V4H6v16ZM14 20h4V4h-4v16Z",
  "double-hang": "M4 20h4V4H4v16ZM10 20h4v-8h-4v8ZM16 20h4v-8h-4v8Z",
  shelf: "M3 10h18M3 14h18",
  drawer: "M4 4h16v4H4ZM4 10h16v4H4ZM4 16h16v4H4Z",
  "shoe-rack": "M4 8h16v2H4ZM4 13h16v2H4ZM4 18h16v2H4Z",
  hooks: "M12 4v8M8 12h8M10 8l4 4M10 16l4-4",
  cubby: "M4 4h8v10H4zM14 4h6v10h-6z",
  "heavy-shelf": "M3 8h18v4H3z",
  pegboard: "M4 4h16v16H4zM8 8h2v2H8zM14 8h2v2h-2zM8 14h2v2H8zM14 14h2v2h-2z",
};

function q(mode: ClosetRoomMode): number { return MODE_ORDER.indexOf(mode); }

function SectionCapacity({ sec, wallHeight }: { sec: ClosetSection; wallHeight: number }): string {
  switch (sec.type) {
    case "single-hang": return `~${Math.floor(sec.width)} thin`;
    case "double-hang": return `~${Math.floor(sec.width * 1.5)} each`;
    case "shelf": return `${Math.floor(sec.width * wallHeight / 144)} sq ft`;
    case "heavy-shelf": return `${Math.floor(sec.width * wallHeight / 144 * 2)} sq ft`;
    case "drawer": {
      const drawersHeight = Math.min(42, wallHeight);
      const count = Math.max(1, Math.floor(drawersHeight / 18));
      const remainingHeight = wallHeight - count * 18;
      const shelvesCount = Math.floor(remainingHeight / 14);
      return `${count} drawers + ${shelvesCount} shelf/shelves`;
    }
    case "shoe-rack": return `~${Math.floor(sec.width / 12 * 2)} pairs`;
    case "hooks": return `~${Math.floor(sec.width / 6)} hooks/row`;
    case "cubby": return `${Math.floor(wallHeight / 12)} cubbies`;
    case "pegboard": return `${Math.floor(sec.width * wallHeight / 144)} sq ft`;
  }
}

function ClosetDesigner() {
  const { t } = useI18n();
  const saved = loadSavedDesign();
  const savedMode = saved?.mode && MODE_ORDER.includes(saved.mode) ? saved.mode : "reach-in";

  const [shareSuccess, setShareSuccess] = useState(false);
  
  // Prioritize URL parameters for shared link loading
  const hasUrlParams = typeof window !== "undefined" && window.location.search.length > 1;

  const [mode, setMode] = useState<ClosetRoomMode>(() => {
    if (hasUrlParams) {
      return getUrlParam("m", "reach-in") as ClosetRoomMode;
    }
    return savedMode;
  });

  const [wallHeight, setWallHeight] = useState<number>(() => {
    if (hasUrlParams) {
      const urlM = getUrlParam("m", "reach-in") as ClosetRoomMode;
      const defaultH = MODE_CONFIGS[urlM]?.defaultHeight ?? 84;
      return getUrlParam("h", defaultH);
    }
    return saved?.wallHeight ?? MODE_CONFIGS[savedMode].defaultHeight;
  });

  const [depth, setDepth] = useState<number>(() => {
    if (hasUrlParams) {
      const urlM = getUrlParam("m", "reach-in") as ClosetRoomMode;
      const defaultD = MODE_CONFIGS[urlM]?.defaultDepth ?? 24;
      return getUrlParam("d", defaultD);
    }
    return saved?.depth ?? MODE_CONFIGS[savedMode].defaultDepth;
  });

  const [walls, setWalls] = useState<ClosetWall[]>(() => {
    if (hasUrlParams) {
      const raw = getUrlParam("w", "");
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          try {
            return JSON.parse(decodeURIComponent(raw));
          } catch {}
        }
      }
    }
    if (saved?.walls && saved.walls.length > 0) return saved.walls;
    return wallsFromDefaults(MODE_CONFIGS[savedMode].defaultWalls);
  });

  const [selectedWallIdx, setSelectedWallIdx] = useState<number>(0);

  const cfg = MODE_CONFIGS[mode];

  const { projects, addToProject, successMessage, clearSuccess } = useProjects(
    "closet-designer",
    "Closet & Storage Layout Designer",
  );

  const changeMode = useCallback((newMode: ClosetRoomMode) => {
    clearSavedDesign();
    setMode(newMode);
    setWallHeight(MODE_CONFIGS[newMode].defaultHeight);
    setDepth(MODE_CONFIGS[newMode].defaultDepth);
    setWalls(wallsFromDefaults(MODE_CONFIGS[newMode].defaultWalls));
    setSelectedWallIdx(0);
  }, []);

  const resetDesign = useCallback(() => {
    clearSavedDesign();
    setMode("reach-in");
    setWallHeight(84);
    setDepth(24);
    setWalls(wallsFromDefaults(MODE_CONFIGS["reach-in"].defaultWalls));
    setSelectedWallIdx(0);
  }, []);

  useEffect(() => {
    saveDesign({ mode, wallHeight, depth, walls });
    setUrlParams(
      { m: mode, h: wallHeight, d: depth, w: JSON.stringify(walls) },
      {
        m: "reach-in",
        h: 84,
        d: 24,
        w: JSON.stringify(wallsFromDefaults(MODE_CONFIGS["reach-in"].defaultWalls))
      }
    );
  }, [mode, wallHeight, depth, walls]);

  const layout: ClosetLayout = { mode, wallHeight, depth, walls };
  const results = calculateCloset(layout);
  const curWall = walls[selectedWallIdx] || walls[0];

  const addWall = useCallback(() => {
    if (walls.length >= 3) return;
    const newWall: ClosetWall = {
      id: genId(), label: `Wall ${walls.length + 1}`, width: 72,
      sections: [{ id: genId(), label: "Shelf", width: 72, type: "shelf" as ClosetSectionType }],
    };
    setWalls(prev => [...prev, newWall]);
    setSelectedWallIdx(walls.length);
  }, [walls.length]);

  const removeWall = useCallback((id: string) => {
    setWalls(prev => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex(w => w.id === id);
      const next = prev.filter(w => w.id !== id);
      if (selectedWallIdx >= next.length) setSelectedWallIdx(next.length - 1);
      return next;
    });
  }, [selectedWallIdx]);

  const updateWall = useCallback((id: string, updates: Partial<ClosetWall>) => {
    setWalls(prev => prev.map(w => w.id === id ? { ...w, ...updates } as ClosetWall : w));
  }, []);

  const addSection = useCallback((wallId: string, type: ClosetSectionType) => {
    setWalls(prev => prev.map(w => {
      if (w.id !== wallId) return w;
      return { ...w, sections: [...w.sections, { id: genId(), label: SECTION_LABELS[type], width: 24, type }] };
    }));
  }, []);

  const removeSection = useCallback((wallId: string, secId: string) => {
    setWalls(prev => prev.map(w => {
      if (w.id !== wallId) return w;
      if (w.sections.length <= 1) return w;
      return { ...w, sections: w.sections.filter(s => s.id !== secId) };
    }));
  }, []);

  const updateSection = useCallback((wallId: string, secId: string, updates: Partial<ClosetSection>) => {
    setWalls(prev => prev.map(w => {
      if (w.id !== wallId) return w;
      return { ...w, sections: w.sections.map(s => s.id === secId ? { ...s, ...updates } as ClosetSection : s) };
    }));
  }, []);

  const totalWidth = curWall ? curWall.sections.reduce((sum, s) => sum + s.width, 0) : 0;

  const canvasWidth = 500;
  const canvasHeight = 350;
  const wallW = curWall?.width ?? 96;
  const wallH = wallHeight;
  const scaleX = 420 / wallW;
  const scaleY = 270 / wallH;
  const scale = Math.min(scaleX, scaleY);
  const wallSvgWidth = wallW * scale;
  const wallSvgHeight = wallH * scale;
  const xOffset = (canvasWidth - wallSvgWidth) / 2;
  const yOffset = (canvasHeight - wallSvgHeight) / 2;

  const sectionColors: Record<string, string> = {
    rod: "var(--accent)", shelf: "var(--fg-secondary)", drawer: "#1c1917",
    "shoe-shelf": "var(--accent)", hook: "var(--accent)", cubby: "var(--fg-secondary)",
    pegboard: "var(--accent)",
  };
  const sectionFillOpacity: Record<string, number> = {
    rod: 0.9, shelf: 0.75, drawer: 0.95, "shoe-shelf": 0.4,
    hook: 0.8, cubby: 0.5, pegboard: 0.15,
  };

  const getSvgX = (sections: ClosetSection[], sectionIndex: number): number => {
    let x = 0;
    for (let i = 0; i < sectionIndex && i < sections.length; i++) {
      x += sections[i].width;
    }
    return x;
  };

  const renderItem = (item: ClosetItem, sectionIdx: number, secList: ClosetSection[]) => {
    const x = getSvgX(secList, sectionIdx);
    const svgX = x * scale;
    const svgY = (wallH - item.y - item.height) * scale;
    const svgW = item.width * scale;
    const svgH = Math.max(item.height * scale, 2);
    const color = sectionColors[item.type] || "var(--fg-muted)";
    const opacity = sectionFillOpacity[item.type] || 0.7;

    if (item.type === "rod") {
      return (
        <line key={`${sectionIdx}-${item.type}-${item.y}`} x1={svgX} y1={svgY + svgH / 2} x2={svgX + svgW} y2={svgY + svgH / 2} stroke={color} strokeWidth="3" strokeLinecap="round" />
      );
    }

    if (item.type === "drawer") {
      return (
        <g key={`${sectionIdx}-${item.type}-${item.y}`}>
          <rect x={svgX} y={svgY} width={svgW} height={svgH} fill={color} fillOpacity={opacity} stroke="var(--border-strong)" strokeWidth="1" rx="1" />
          <line x1={svgX + svgW * 0.2} y1={svgY + svgH / 2} x2={svgX + svgW * 0.8} y2={svgY + svgH / 2} stroke="var(--border)" strokeWidth="0.75" />
          <circle cx={svgX + svgW * 0.5} cy={svgY + svgH / 2} r="1.5" fill="var(--border)" />
        </g>
      );
    }

    if (item.type === "cubby") {
      return (
        <g key={`${sectionIdx}-${item.type}-${item.y}`}>
          <rect x={svgX} y={svgY} width={svgW} height={svgH} fill={color} fillOpacity={opacity} stroke="var(--border-strong)" strokeWidth="0.5" rx="1" />
          {item.height > 6 && (
            <line x1={svgX + svgW * 0.3} y1={svgY + svgH / 2} x2={svgX + svgW * 0.7} y2={svgY + svgH / 2} stroke="var(--border)" strokeWidth="0.5" />
          )}
        </g>
      );
    }

    if (item.type === "pegboard") {
      return (
        <g key={`${sectionIdx}-${item.type}-${item.y}`}>
          <rect x={svgX} y={svgY} width={svgW} height={svgH} fill={color} fillOpacity={opacity} stroke="var(--border-strong)" strokeWidth="0.5" rx="1" />
          {Array.from({ length: 4 }).map((_, ri) =>
            Array.from({ length: Math.floor(svgW / 12) }).map((_, ci) => (
              <circle key={`h-${ri}-${ci}`} cx={svgX + 6 + ci * 12} cy={svgY + 6 + ri * 12} r="1" fill="var(--border)" />
            ))
          )}
        </g>
      );
    }

    if (item.type === "hook") {
      return (
        <g key={`${sectionIdx}-${item.type}-${item.y}`}>
          <line x1={svgX} y1={svgY + svgH / 2} x2={svgX + svgW} y2={svgY + svgH / 2} stroke={color} strokeWidth="1.5" strokeDasharray="2 4" />
          {[0.25, 0.5, 0.75].map(pct => (
            <circle key={`dot-${pct}`} cx={svgX + svgW * pct} cy={svgY + svgH / 2} r="1.5" fill={color} />
          ))}
        </g>
      );
    }

    return (
      <rect key={`${sectionIdx}-${item.type}-${item.y}`} x={svgX} y={svgY} width={svgW} height={svgH} fill={color} fillOpacity={opacity} stroke="var(--border-strong)" strokeWidth="0.5" />
    );
  };

  const projectInputs = { mode, wallHeight, depth, wallsCount: walls.length };
  const projectResults = {
    hangingSpace: `${(results.hangingSpaceIn / 12).toFixed(1)} ft`,
    shelfArea: `${results.shelfAreaSqFt} sq ft`,
    drawerCount: results.drawerCount,
    totalCost: `$${results.totalCost}`,
  };
  const projectMaterials = results.materialList.map(m => ({
    name: m.name, quantity: m.quantity, unit: m.unit, category: "closet",
  }));

  const isMultiWall = walls.length > 1;

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card className="p-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider mr-1">Room Type:</span>
        {MODE_ORDER.map(m => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => changeMode(m)}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                active
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--bg-subtle)] text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] border-[var(--border)]"
              }`}
              aria-label={`Switch to ${MODE_CONFIGS[m].label}`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={MODE_ICONS[m]} /></svg>
              <span className="hidden sm:inline">{MODE_CONFIGS[m].label}</span>
            </button>
          );
        })}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Mode label */}
          <div className="text-[11px] text-[var(--fg-muted)] italic border-l-2 border-[var(--accent)] pl-3">{cfg.description}</div>

          {/* Wall tabs for multi-wall */}
          {isMultiWall && (
            <div className="flex items-center gap-1 border-b border-[var(--border)] pb-1 overflow-x-auto">
              {walls.map((w, idx) => (
                <button
                  key={w.id} type="button"
                  onClick={() => setSelectedWallIdx(idx)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-t-lg border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                    idx === selectedWallIdx
                      ? "bg-[var(--bg-subtle)] text-[var(--fg)] border-[var(--accent)]"
                      : "text-[var(--fg-muted)] border-transparent hover:text-[var(--fg)]"
                  }`}
                  aria-label={`Edit ${w.label}`}
                >
                  <span>{w.label}</span>
                  <span className="text-[9px] opacity-60">({w.width}&Prime;)</span>
                  {walls.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeWall(w.id); }}
                      className="text-red-400 hover:text-red-500 ml-1 cursor-pointer"
                      aria-label={`Remove ${w.label}`}
                    >
                      &times;
                    </button>
                  )}
                </button>
              ))}
              {walls.length < 3 && (
                <button type="button" onClick={addWall} className="text-[10px] text-[var(--accent)] font-bold px-2 py-1 hover:bg-[var(--bg-subtle)] rounded transition-colors cursor-pointer">
                  + Add Wall
                </button>
              )}
            </div>
          )}

          {/* SVG canvas */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center relative select-none">
            {curWall && (
              <>
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
                    {curWall.label} Elevation
                  </span>
                  <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold">
                    {curWall.width}&Prime; W &times; {wallH}&Prime; H &times; {depth}&Prime; D
                  </span>
                </div>

                <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden relative">
                  {totalWidth > curWall.width && (
                    <div className="absolute top-2 left-2 z-10 text-[9px] bg-red-500/10 border border-red-500/30 text-red-500 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                      Sections exceed wall ({Math.round(totalWidth - curWall.width)}&Prime;)
                    </div>
                  )}

                  <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-auto max-w-[500px] overflow-visible" role="img" aria-label={`${curWall.label} ${MODE_CONFIGS[mode].label} Blueprint`}>
                    <g transform={`translate(${xOffset}, ${yOffset})`}>
                      <rect x="0" y="0" width={wallSvgWidth} height={wallSvgHeight} fill="var(--bg)" stroke="var(--border-strong)" strokeWidth="1" />

                      {curWall.sections.length > 1 && curWall.sections.slice(0, -1).reduce((acc: number[], s: ClosetSection) => {
                        const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
                        acc.push(prev + s.width);
                        return acc;
                      }, []).map((x: number, idx: number) => (
                        <line key={`div-${idx}`} x1={x * scale} y1="0" x2={x * scale} y2={wallSvgHeight} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                      ))}

                      {results.items
                        .filter((item) => !item.wallId || item.wallId === curWall.id)
                        .map((item) => renderItem(item, item.sectionIndex, curWall.sections))}

                      {curWall.sections.map((sec: ClosetSection, idx: number) => {
                        const x = getSvgX(curWall.sections, idx);
                        const cx = (x + sec.width / 2) * scale;
                        return (
                          <g key={`anno-${sec.id}`}>
                            <text x={cx} y={wallSvgHeight + 12} fill="var(--fg-muted)" fontSize="7" fontWeight="bold" textAnchor="middle">
                              {sec.label} {sec.width}&Prime;
                            </text>
                          </g>
                        );
                      })}

                      <g transform={`translate(0, ${wallSvgHeight + 24})`}>
                        <line x1="0" y1="0" x2={wallSvgWidth} y2="0" stroke="var(--accent)" strokeWidth="1" />
                        <polygon points={`0,0 5,-3 5,3`} fill="var(--accent)" />
                        <polygon points={`${wallSvgWidth},0 ${wallSvgWidth - 5},-3 ${wallSvgWidth - 5},3`} fill="var(--accent)" />
                        <rect x={(wallSvgWidth / 2) - 18} y="-9" width="36" height="16" fill="var(--bg-inset)" />
                        <text x={wallSvgWidth / 2} y="3" fill="var(--accent)" fontSize="9" fontWeight="bold" textAnchor="middle">{decimalToFraction(curWall.width)}</text>
                      </g>

                      <g transform={`translate(-18, 0)`}>
                        <line x1="0" y1="0" x2="0" y2={wallSvgHeight} stroke="var(--accent)" strokeWidth="1" />
                        <polygon points={`0,0 -3,5 3,5`} fill="var(--accent)" />
                        <polygon points={`0,${wallSvgHeight} -3,${wallSvgHeight - 5} 3,${wallSvgHeight - 5}`} fill="var(--accent)" />
                        <rect x="-16" y={(wallSvgHeight / 2) - 8} width="32" height="16" fill="var(--bg-inset)" />
                        <text x="0" y={(wallSvgHeight / 2) + 3} fill="var(--accent)" fontSize="9" fontWeight="bold" textAnchor="middle" transform={`rotate(-90 0 ${wallSvgHeight / 2})`}>{decimalToFraction(wallH)}</text>
                      </g>
                    </g>
                  </svg>
                </div>
              </>
            )}

            <div className="w-full mt-3 flex flex-wrap gap-4 items-center justify-center text-[10px] text-[var(--fg-secondary)] bg-[var(--bg-inset)] p-2.5 rounded-lg border border-[var(--border)] font-medium">
              {[
                { color: "var(--accent)", label: "Rod/Hook", style: "w-4 h-0.5 bg-[var(--accent)]" },
                { color: "var(--fg-secondary)", label: "Shelf", style: "w-3.5 h-2 bg-[var(--fg-secondary)] border border-[var(--border-strong)]" },
                { color: "#1c1917", label: "Drawer", style: "w-3.5 h-3.5 bg-stone-800 border border-[var(--border-strong)]" },
                { color: "var(--accent)", label: "Shoe Shelf", style: "w-3.5 h-2 bg-[var(--accent)] opacity-40 border border-[var(--border-strong)]" },
                { color: "var(--fg-secondary)", label: "Cubby", style: "w-3.5 h-3.5 bg-[var(--fg-secondary)] opacity-50 border border-[var(--border-strong)]" },
                { color: "var(--accent)", label: "Pegboard", style: "w-3.5 h-3.5 bg-[var(--accent)] opacity-15 border border-[var(--border-strong)]" },
                { color: "var(--border)", label: "Section Divider", style: "w-3 h-0 border-t border-dashed border-[var(--border)]" },
              ].map(s => (
                <span key={s.label} className="flex items-center gap-1.5">
                  <span className={s.style} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Dimensions card */}
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
              <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Configure Dimensions</h3>
              <div className="flex gap-2 items-center">
                <span className="text-[10px] text-[var(--fg-muted)]">{walls.length} wall{walls.length > 1 ? "s" : ""}</span>
                <button type="button" onClick={resetDesign} className="text-[10px] text-[var(--fg-muted)] hover:text-red-500 font-medium px-2 py-0.5 rounded hover:bg-red-500/5 transition-colors no-print cursor-pointer">Reset</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isMultiWall && curWall && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[var(--fg-secondary)]">{curWall.label} Width</span>
                    <span className="font-bold text-[var(--accent)] font-mono">{curWall.width}&Prime;</span>
                  </div>
                  <input type="range" min="36" max="240" step="6" value={curWall.width}
                    onChange={(e) => updateWall(curWall.id, { width: parseInt(e.target.value) || 96 })}
                    className="w-full accent-[var(--accent)] cursor-pointer" aria-label={`${curWall.label} width`}
                  />
                </div>
              )}
              {!isMultiWall && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[var(--fg-secondary)]">Wall Width</span>
                    <span className="font-bold text-[var(--accent)] font-mono">{curWall?.width ?? 96}&Prime;</span>
                  </div>
                  <input type="range" min="36" max="240" step="6"
                    value={curWall?.width ?? 96}
                    onChange={(e) => curWall && updateWall(curWall.id, { width: parseInt(e.target.value) || 96 })}
                    className="w-full accent-[var(--accent)] cursor-pointer" aria-label="Wall width"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--fg-secondary)]">Wall Height</span>
                  <span className="font-bold text-[var(--accent)] font-mono">{wallHeight}&Prime;</span>
                </div>
                <input type="range" min={cfg.minHeight} max={cfg.maxHeight} step="6" value={wallHeight}
                  onChange={(e) => setWallHeight(parseInt(e.target.value) || cfg.defaultHeight)}
                  className="w-full accent-[var(--accent)] cursor-pointer" aria-label="Wall height"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--fg-secondary)]">Depth</span>
                  <span className="font-bold text-[var(--accent)] font-mono">{depth}&Prime;</span>
                </div>
                <select value={depth} onChange={(e) => setDepth(parseInt(e.target.value) || cfg.defaultDepth)}
                  className="w-full text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-2 font-medium" aria-label="Depth"
                >
                  {cfg.depthOptions.map(d => (
                    <option key={d} value={d}>{d}&Prime;{d === cfg.defaultDepth ? " (Recommended)" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Sections card */}
          <Card className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
              <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">
                {curWall ? `${curWall.label} Sections` : "Sections"}
              </h3>
              <div className="flex gap-1.5 text-[10px]">
                {cfg.availableSectionTypes.map(type => (
                  <button key={type} type="button" onClick={() => curWall && addSection(curWall.id, type)}
                    className="bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] px-2 py-1 rounded font-bold transition-colors cursor-pointer flex items-center gap-1"
                    aria-label={`Add ${SECTION_LABELS[type]}`}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={SECTION_ICONS[type]} /></svg>
                    <span className="hidden sm:inline">{SECTION_LABELS[type]}</span>
                  </button>
                ))}
              </div>
            </div>

            {curWall && (
              <>
                <div className="flex items-center justify-between text-[10px] text-[var(--fg-muted)] px-1">
                  <span>{curWall.sections.length} section{curWall.sections.length !== 1 ? "s" : ""}</span>
                  <span className={totalWidth > curWall.width ? "text-red-500 font-bold" : ""}>
                    Total width: {totalWidth}&Prime; / {curWall.width}&Prime;
                  </span>
                </div>

                {curWall.sections.length === 0 ? (
                  <span className="text-xs text-[var(--fg-muted)] italic py-2">Add a section to start designing.</span>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {curWall.sections.map((sec, idx) => (
                      <div key={sec.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-xs">
                        <div className="font-bold capitalize flex items-center gap-1.5 sm:col-span-2">
                          <span className={`w-2.5 h-2.5 rounded-full border border-[var(--border-strong)] ${sec.type === "drawer" ? "bg-stone-800" : sec.type === "shelf" || sec.type === "heavy-shelf" ? "bg-[var(--fg-secondary)]" : sec.type === "cubby" ? "bg-[var(--fg-secondary)]/50" : sec.type === "pegboard" ? "bg-[var(--accent)]/30" : "bg-[var(--accent)]"}`} />
                          <select value={sec.type}
                            onChange={(e) => updateSection(curWall.id, sec.id, { type: e.target.value as ClosetSectionType, label: SECTION_LABELS[e.target.value as ClosetSectionType] })}
                            className="bg-[var(--bg-inset)] border border-[var(--border)] rounded p-1 font-medium text-[10px] focus:outline-none"
                            aria-label={`Section ${idx + 1} type`}
                          >
                            {cfg.availableSectionTypes.map(st => (
                              <option key={st} value={st}>{SECTION_LABELS[st]}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-0.5 sm:col-span-2">
                          <span className="text-[9px] text-[var(--fg-muted)]">Label</span>
                          <input type="text" value={sec.label}
                            onChange={(e) => updateSection(curWall.id, sec.id, { label: e.target.value })}
                            className="bg-[var(--bg-inset)] border border-[var(--border)] rounded p-1 font-medium text-[10px] focus:outline-none"
                            aria-label={`Section ${idx + 1} label`}
                          />
                        </div>

                        <div className="flex flex-col gap-0.5 sm:col-span-2">
                          <span className="text-[9px] text-[var(--fg-muted)]">Width (in)</span>
                          <input type="number" min="6" max={curWall.width} value={sec.width}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              updateSection(curWall.id, sec.id, { width: isNaN(val) ? 0 : val });
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              updateSection(curWall.id, sec.id, { width: Math.max(6, Math.min(curWall.width, isNaN(val) ? 24 : val)) });
                            }}
                            className="bg-[var(--bg-inset)] border border-[var(--border)] rounded p-1 font-medium text-[10px] focus:outline-none tabular-nums"
                            aria-label={`Section ${idx + 1} width`}
                          />
                        </div>

                        <div className="flex flex-col gap-0.5 sm:col-span-4">
                          <span className="text-[9px] text-[var(--fg-muted)]">Capacity</span>
                          <span className="font-mono text-[var(--accent)] font-bold text-[10px]">
                            {SectionCapacity({ sec, wallHeight })}
                          </span>
                        </div>

                        <button type="button" onClick={() => removeSection(curWall.id, sec.id)}
                          className="text-red-500 hover:text-red-700 font-bold self-end sm:self-center py-1 sm:py-0 text-[10px] uppercase text-right cursor-pointer sm:col-span-1"
                          aria-label={`Remove ${sec.label}`} disabled={curWall.sections.length <= 1}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <AddToProjectCard
            projects={projects}
            onAdd={(pid) => { clearSuccess(); addToProject(pid, projectInputs, projectResults, projectMaterials); }}
            successMessage={successMessage}
          />

          <Card className="p-6 flex flex-col gap-4">
            <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--fg)]">Material & Storage Summary</h3>
              <div className="flex gap-1.5 no-print">
                <button
                  type="button"
                  onClick={() => { copyShareUrl().then((ok) => { if (ok) { setShareSuccess(true); setTimeout(() => setShareSuccess(false), 2000); } }); }}
                  className="text-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                  aria-label="Copy shareable link"
                >
                  {shareSuccess ? "Copied!" : "Share"}
                </button>
                <button type="button" onClick={() => window.print()}
                  className="text-[10px] bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                >Print Plan</button>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--fg-secondary)]">Hanging Space</span>
                <span className="font-bold text-[var(--accent)] font-mono tabular-nums bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10">
                  {(results.hangingSpaceIn / 12).toFixed(1)} linear ft
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--fg-secondary)]">Shelf Area</span>
                <span className="font-bold text-[var(--fg)] tabular-nums">{results.shelfAreaSqFt} sq ft</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--fg-secondary)]">Drawers</span>
                <span className="font-bold text-[var(--fg)] tabular-nums">{results.drawerCount} drawers</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--fg-secondary)]">Shoe Storage</span>
                <span className="font-bold text-[var(--fg)] tabular-nums">~{results.shoeStoragePairs} pairs</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="font-medium text-[var(--fg-secondary)]">Hanger Capacity</span>
                <span className="font-bold text-[var(--fg)] tabular-nums">{results.hangerCapacity} thin / {results.hangerCapacityThick} thick</span>
              </div>

              <div className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--fg)]">Estimated Cost</span>
                  <span className="font-extrabold text-[var(--accent)] tabular-nums font-mono text-sm bg-[var(--accent)]/10 px-2.5 py-0.5 rounded border border-[var(--accent)]/20">
                    ${results.totalCost}
                  </span>
                </div>
                <span className="text-[9px] text-[var(--fg-muted)] leading-tight italic">Materials only. Does not include labor, tools, or taxes.</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[var(--fg)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Shopping Checklist</h3>
            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {results.materialList.map((mat, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded bg-[var(--bg-inset)] border border-[var(--border)] text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--fg)]">{mat.name}</span>
                    <span className="text-[10px] text-[var(--fg-muted)]">{mat.notes}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-1 rounded border border-[var(--accent)]/15 block">&times; {mat.quantity} {mat.unit}</span>
                    <span className="text-[10px] text-[var(--fg-muted)]">${(mat.quantity * mat.pricePerUnit).toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
            <a href={`/calculators/payload/?weight=${Math.round(results.hangingSpaceIn * 1.5 + results.shelfAreaSqFt * 3 + results.drawerCount * 8)}&material=closet`}
              className="text-[10px] text-center bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--accent)] font-bold px-3 py-2 rounded transition-all cursor-pointer"
            >Check Vehicle Payload Capacity</a>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withI18n(ClosetDesigner);
