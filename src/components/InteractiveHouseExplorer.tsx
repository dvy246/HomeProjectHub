import React, { useState, useRef, useEffect, useMemo } from "react";
import { useI18n } from "./i18n/I18nProvider";
import { withI18n } from "./i18n/withI18n";

const renderSectionIcon = (id: string, className = "w-4 h-4 text-[var(--accent)] shrink-0") => {
  switch (id) {
    case "roof":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.437 14.172 13.684 9.1m0 0 10.274 5.072M13.684 9.1v12.4m0-12.4L3 3.6m10.684 5.5 9.774-5.5" />
        </svg>
      );
    case "walls":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M2.25 21h19.5M3 3.545h18" />
        </svg>
      );
    case "foundation":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21V9.75M3.284 14.253A9.008 9.008 0 0 1 12 3a9.008 9.008 0 0 1 8.716 11.253M3.284 14.253H20.72" />
        </svg>
      );
    case "interior":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122A3 3 0 0 0 13.5 13.511V12h3V9.75h-3V7.125M9.53 16.122a3 3 0 1 1-3.03-3.61l3.03 3.61Zm0 0V9.75H6.5" />
        </svg>
      );
    case "exterior":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M12 3a9 9 0 0 1 9 9M12 3a9 9 0 0 0-9 9M12 21a9 9 0 0 0 9-9M12 21a9 9 0 0 1-9-9" />
        </svg>
      );
    default:
      return null;
  }
};

interface GuideLink {
  name: string;
  link: string;
}

interface HouseSection {
  id: string;
  name: string;
  category: string;
  description: string;
  link: string;
  calculators: string[];
  planners: string[];
  maintenance: string[];
  guides: GuideLink[];
  toolsCount: number;
}

const HOUSE_SECTIONS: HouseSection[] = [
  {
    id: "roof",
    name: "Roofing System",
    category: "Roofing & Insulation",
    description: "Estimate shingle bundles, metal panels, underlayment, and roof deck spacing. Manage seasonal maintenance and inspection schedules.",
    link: "/calculators/roofing/",
    calculators: ["Shingles Calculator", "Metal Roof Calculator", "Plywood Decking", "Roof Pitch & Tiles"],
    planners: ["Roof Replacement Budget", "Attic Insulation Planner"],
    maintenance: ["Annual Gutter Cleaning", "Ice Dam Prevention Audit"],
    guides: [
      { name: "Roofing Material Selection Guide", link: "/guides/roofing-material-guide/" }
    ],
    toolsCount: 7,
  },
  {
    id: "walls",
    name: "Walls & Drywall",
    category: "Paint & Interior",
    description: "Calculate drywall sheets, joint compound, screws, studs, and framing spacing.",
    link: "/calculators/drywall/",
    calculators: ["Drywall Sheets Calculator", "Framing Studs Calculator", "Block Wall Count"],
    planners: ["Basement Framing Budgeting", "Drywall Joint Compound Estimator"],
    maintenance: ["Drywall Crack & Patch Repairs", "Stud Finder Calibration Check"],
    guides: [
      { name: "Drywall Estimating Guide", link: "/guides/drywall-estimating-guide/" },
      { name: "Wall & Fence Construction Guide", link: "/guides/wall-fence-guide/" }
    ],
    toolsCount: 8,
  },
  {
    id: "foundation",
    name: "Concrete Foundation & Slabs",
    category: "Concrete & Masonry",
    description: "Calculate concrete volume in cubic yards, footings, columns, and steps.",
    link: "/calculators/concrete/",
    calculators: ["Slab Calculator", "Footing Calculator", "Cylindrical Column", "Concrete Steps"],
    planners: ["Driveway Pour Planner", "Rebar Spacing Planner"],
    maintenance: ["Slab Crack Sealing Audit", "Concrete Curing Inspection"],
    guides: [
      { name: "Concrete Volume Calculation Guide", link: "/guides/concrete-volume-guide/" },
      { name: "Slab Preparation Guide", link: "/guides/slab-preparation-guide/" }
    ],
    toolsCount: 9,
  },
  {
    id: "interior",
    name: "Paint & Flooring",
    category: "Tile & Paint",
    description: "Estimate interior wall paint gallons and floor tile box counts for grid or diagonal patterns.",
    link: "/calculators/paint/",
    calculators: ["Interior Paint Calculator", "Tile Flooring Calculator", "Ceiling Paint Estimator"],
    planners: ["Room Paint Color Planner", "Tile Pattern Grid Planner"],
    maintenance: ["Grout Joint Cleaning & Sealing", "Paint Touch-Up Audit"],
    guides: [
      { name: "Paint Estimating & Coats Guide", link: "/guides/paint-estimating-guide/" },
      { name: "Tile Installation Guide", link: "/guides/tile-installation-guide/" },
      { name: "Flooring Materials Guide", link: "/guides/flooring-materials-guide/" }
    ],
    toolsCount: 10,
  },
  {
    id: "exterior",
    name: "Driveway, Patio & Garden",
    category: "Landscaping & Base",
    description: "Estimate loose materials like gravel, mulch, sand, and stone weight for base preparation.",
    link: "/calculators/gravel/",
    calculators: ["Gravel Driveway Estimator", "Mulch & Soil Depth Calculator", "Sand Base Yardage"],
    planners: ["Patio Hardscape Planner", "Retaining Wall Estimator"],
    maintenance: ["Weed Barrier Inspection", "Mulch Top-Up Schedule"],
    guides: [
      { name: "Gravel Base Preparation Guide", link: "/guides/gravel-base-guide/" },
      { name: "Landscaping Materials Guide", link: "/guides/landscaping-materials-guide/" },
      { name: "Mulch & Soil Depth Guide", link: "/guides/mulch-soil-depth-guide/" }
    ],
    toolsCount: 9,
  },
];

function InteractiveHouseExplorer() {
  const { t } = useI18n();
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<HouseSection | null>(null);
  
  // 3D Interactive Rotation states
  const [rotation, setRotation] = useState<number>(0);
  const [tilt, setTilt] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationStartRef = useRef<{ rot: number; tilt: number }>({ rot: 0, tilt: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs to avoid stale closures in event listeners
  const isExplodedRef = useRef<boolean>(isExploded);
  const activeSectionRef = useRef<HouseSection | null>(activeSection);

  // Mouse & touch drag tracking refs
  const isMouseDownRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const isTouchingRef = useRef<boolean>(false);
  const hasTouchDraggedRef = useRef<boolean>(false);

  useEffect(() => {
    isExplodedRef.current = isExploded;
  }, [isExploded]);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const tooltipTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Hover capabilities state for touch vs pointer devices
  const [hasHover, setHasHover] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    name: string;
    category: string;
    toolsCount: number;
    tools: string[];
  }>({
    show: false,
    name: "",
    category: "",
    toolsCount: 0,
    tools: [],
  });

  // Track tooltip position via ref to avoid re-renders on every mouse move
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover)");
    setHasHover(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setHasHover(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleLayerMouseEnter = (section: HouseSection) => {
    setActiveSection(section);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    tooltipTimeoutRef.current = window.setTimeout(() => {
      if (activeSectionRef.current?.id === section.id) {
        setTooltip(prev => ({
          ...prev,
          show: true,
          name: section.name,
          category: section.category,
          toolsCount: section.toolsCount,
          tools: [...section.calculators, ...section.planners],
        }));
      }
      tooltipTimeoutRef.current = null;
    }, 150);
  };

  const handleLayerMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setTooltip(prev => ({ ...prev, show: false }));
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (tooltipRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      tooltipRef.current.style.left = `${e.clientX - rect.left + 16}px`;
      tooltipRef.current.style.top = `${e.clientY - rect.top + 16}px`;
    }
  };

  const sectionMap = useMemo(() => new Map(HOUSE_SECTIONS.map(s => [s.id, s])), []);
  const order = useMemo(() => ['roof', 'walls', 'interior', 'foundation', 'exterior'], []);

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const currentIdx = activeSection ? order.indexOf(activeSection.id) : -1;
      const nextIdx = (currentIdx + 1) % order.length;
      const nextSec = sectionMap.get(order[nextIdx]) || null;
      if (nextSec) {
        handleLayerMouseEnter(nextSec);
        if (!isExploded) setIsExploded(true);
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const currentIdx = activeSection ? order.indexOf(activeSection.id) : -1;
      const prevIdx = currentIdx <= 0 ? order.length - 1 : currentIdx - 1;
      const prevSec = sectionMap.get(order[prevIdx]) || null;
      if (prevSec) {
        handleLayerMouseEnter(prevSec);
        if (!isExploded) setIsExploded(true);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      if (activeSection) {
        e.preventDefault();
        handlePartClick(activeSection);
      }
    }
  };

  const handlePartClick = (section: HouseSection) => {
    // Not exploded yet → expand and select
    if (!isExplodedRef.current) {
      setIsExploded(true);
      setActiveSection(section);
      return;
    }
    // Already exploded and same section → navigate to its tools
    if (activeSectionRef.current?.id === section.id) {
      window.location.href = section.link;
      return;
    }
    // Different section → switch selection
    setActiveSection(section);
  };

  const handleTap = (section: HouseSection) => {
    if (!isExplodedRef.current) {
      setIsExploded(true);
      setActiveSection(section);
      return;
    }
    if (activeSectionRef.current?.id === section.id) {
      window.location.href = section.link;
      return;
    }
    setActiveSection(section);
  };

  const handleLayerKeyDown = (e: React.KeyboardEvent, section: HouseSection) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePartClick(section);
    }
  };

  // Drag start handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    rotationStartRef.current = { rot: rotation, tilt: tilt };
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    rotationStartRef.current = { rot: rotation, tilt: tilt };
    isTouchingRef.current = true;
    hasTouchDraggedRef.current = false;

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Move handlers
  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (!hasDraggedRef.current && distance > 4) {
      hasDraggedRef.current = true;
      setIsDragging(true);
    }

    if (hasDraggedRef.current) {
      setRotation(Math.max(-45, Math.min(45, rotationStartRef.current.rot + deltaX * 0.4)));
      setTilt(Math.max(-20, Math.min(20, rotationStartRef.current.tilt - deltaY * 0.3)));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isTouchingRef.current) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (!hasTouchDraggedRef.current && distance > 6) {
      hasTouchDraggedRef.current = true;
      setIsDragging(true);
    }

    if (hasTouchDraggedRef.current) {
      e.preventDefault();
      setRotation(Math.max(-45, Math.min(45, rotationStartRef.current.rot + deltaX * 0.4)));
      setTilt(Math.max(-20, Math.min(20, rotationStartRef.current.tilt - deltaY * 0.3)));
    }
  };

  // Up/End handlers
  const handleMouseUp = (e: MouseEvent) => {
    isMouseDownRef.current = false;
    setIsDragging(false);

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    if (!hasDraggedRef.current) {
      const target = e.target as Element;
      const isHousePart = target.closest && (target.closest('.house-layer') || target.closest('[role="button"]'));
      if (!isHousePart) {
        setIsExploded(prev => !prev);
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    isTouchingRef.current = false;
    setIsDragging(false);

    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);

    if (!hasTouchDraggedRef.current) {
      const target = e.target as Element;
      const isHousePart = target.closest && (target.closest('.house-layer') || target.closest('[role="button"]'));
      if (!isHousePart) {
        setIsExploded(prev => !prev);
      }
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const resetAngle = () => {
    setRotation(0);
    setTilt(0);
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 md:p-8 card-elevated flex flex-col gap-6 select-none relative overflow-hidden">
      {/* Background grid accent */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none"></div>

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 z-10">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            {t('house_explorer.visual_nav') ?? 'Visual Navigation Hub'}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-gradient text-wrap-balance">
            {t('house_explorer.title') ?? 'Interactive Home Explorer'}
          </h2>
          <p className="text-xs text-[var(--fg-secondary)] max-w-xl text-pretty leading-relaxed">
            {hasHover
              ? (t('house_explorer.drag_hint') ?? "Drag to rotate, click to select a part, click again to open — or use arrow keys to navigate.")
              : (t('house_explorer.tap_hint') ?? "Tap to select a house part, tap again to open its tools.")}
          </p>
        </div>

        {/* Premium Vercel-style controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {(rotation !== 0 || tilt !== 0) && (
            <button
              onClick={resetAngle}
              className="text-[10px] font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] border border-dashed border-[var(--border)] px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50"
            >
              {t('house_explorer.reset_angle') ?? 'Reset Angle'}
            </button>
          )}
          
          <div className="flex bg-[var(--bg-muted)] p-0.5 rounded-lg text-xs border border-[var(--border)]">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                !isExploded
                  ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
              onClick={() => setIsExploded(false)}
            >
              {t('house_explorer.assembled_view') ?? 'Assembled View'}
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                isExploded
                  ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
              onClick={() => setIsExploded(true)}
            >
              {t('house_explorer.exploded_view') ?? 'Exploded View'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: SVG Explorer with drag rotation */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseMove={handleContainerMouseMove}
          onKeyDown={handleContainerKeyDown}
          tabIndex={0}
          role="region"
          aria-label={t('house_explorer.aria_map') ?? "Interactive house map showing roofing, walls, interior paint, foundation slabs, and driveway gardens. Use arrow keys to select layers, space/enter to view."}
          className={`lg:col-span-7 flex justify-center items-center relative min-h-[360px] preserve-3d perspective-[1000px] select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded-xl ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            perspective: "1000px"
          }}
        >
          {/* Premium Floating Tooltip */}
          {hasHover && tooltip.show && activeSection && (
            <div
              ref={tooltipRef}
              className="absolute pointer-events-none z-50 bg-[var(--card-bg)]/95 backdrop-blur-md border border-[var(--border)] rounded-xl shadow-xl px-4 py-3 text-left w-56 flex flex-col gap-2 animate-fade-in-up"
              style={{
                left: 0,
                top: 0,
              }}
            >
              <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-1.5">
                {renderSectionIcon(activeSection.id)}
                  <span className="text-xs font-bold tracking-tight text-[var(--fg)]">{activeSection ? (t(`house_explorer.section_name_${activeSection.id}`) ?? activeSection.name) : tooltip.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                {tooltip.tools.slice(0, 3).map((t, idx) => (
                  <span key={idx} className="text-[10px] text-[var(--fg-secondary)] flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)] text-[var(--accent)] shrink-0"></span>
                    {t}
                  </span>
                ))}
                {tooltip.tools.length > 3 && (
                  <span className="text-[9px] text-[var(--fg-muted)] italic pl-2">
                    {t('house_explorer.more_tools')?.replace('{count}', String(tooltip.tools.length - 3)) ?? `+ ${tooltip.tools.length - 3} more tools`}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-[8px] text-[var(--accent)] font-semibold border-t border-[var(--border)] pt-1.5 mt-0.5">
                <span>{t('house_explorer.tooltip_click') ?? 'Click to select, click again to open'}</span>
                <span>→</span>
              </div>
            </div>
          )}

          <div
            className="w-full max-w-[420px] transition-transform duration-100 ease-out"
            style={{
              transform: `rotateY(${rotation}deg) rotateX(${tilt}deg)`,
              transformStyle: "preserve-3d"
            }}
          >
            {/* Fixed-size container prevents SVG overflow from affecting page layout */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '84.44%', overflow: 'hidden' }}>
            <svg
              viewBox="0 0 450 380"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              role="img"
              aria-label={t('house_explorer.aria_svg') ?? "Interactive house map showing roofing, walls, interior paint, foundation slabs, and driveway gardens. Drag to rotate structure."}
              onMouseLeave={() => {
                handleLayerMouseLeave();
              }}
            >
              <style>{`
                .house-layer {
                  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
                  cursor: pointer;
                  will-change: transform;
                }
                .house-layer:hover, .house-layer:focus-visible {
                  opacity: 0.85;
                  outline: none;
                }
                .house-layer:focus-visible {
                  outline: 2px solid var(--accent);
                  outline-offset: 4px;
                  border-radius: 4px;
                }
                /* Exploded view transformation offsets along true perspective directions */
                .layer-roof {
                  transform: ${isExploded ? "translateY(-65px)" : "translateY(0)"};
                }

                .layer-walls {
                  transform: ${isExploded ? "translate(-30px, -12px)" : "translate(0, 0)"};
                }

                .layer-interior {
                  transform: ${isExploded ? "translate(30px, 12px)" : "translate(0, 0)"};
                }

                .layer-foundation {
                  transform: ${isExploded ? "translateY(35px)" : "translateY(0)"};
                }

                .layer-exterior {
                  transform: ${isExploded ? "translateY(65px)" : "translateY(0)"};
                }
                .active-layer {
                  opacity: 1 !important;
                }
                .active-layer polygon, 
                .active-layer path, 
                .active-layer rect {
                  stroke: var(--accent) !important;
                  stroke-width: 2px !important;
                }

                
                .floor-grid {
                  stroke: #ffffff;
                  stroke-width: 0.75px;
                  fill: none;
                  opacity: 0.4;
                }

                /* Person styling fade-in transition */
                .layer-person {
                  opacity: ${isExploded ? 1 : 0};
                  transition: opacity 0.4s ease-in-out;
                  pointer-events: none;
                }

                /* Honor prefers-reduced-motion */
                @media (prefers-reduced-motion: reduce) {
                  .house-layer {
                    transition: none !important;
                    transform: none !important;
                  }
                  .layer-person {
                    transition: none !important;
                    opacity: 1 !important;
                  }
                }
              `}</style>

              <defs>
                {/* Roof Gradient - Beautiful Sky Blue */}
                <linearGradient id="roofBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5fa6f2" />
                  <stop offset="100%" stopColor="#3d7fc9" />
                </linearGradient>
                {/* Roof Trim - Darker Sky Blue for depth */}
                <linearGradient id="roofTrim" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3d7fc9" />
                  <stop offset="100%" stopColor="#25589c" />
                </linearGradient>
                {/* Walls Gradient - Sandy warm clay/beige */}
                <linearGradient id="wallBeige" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f5edd5" />
                  <stop offset="100%" stopColor="#e3d2b3" />
                </linearGradient>
                {/* Foundation slab platform */}
                <linearGradient id="slabPlatform" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e6e6e6" />
                  <stop offset="100%" stopColor="#cccccc" />
                </linearGradient>
                {/* Door Gradient */}
                <linearGradient id="doorBrown" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6e3427" />
                  <stop offset="100%" stopColor="#471f17" />
                </linearGradient>
                {/* Window Glass Gradient */}
                <linearGradient id="windowGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe699" />
                  <stop offset="100%" stopColor="#ffd24d" />
                </linearGradient>
              </defs>

              {/* Invisible background to capture empty space clicks */}
              <rect
                width="450"
                height="380"
                fill="none"
                pointerEvents="all"
              />

              {/* SECTION 5: EXTERIOR (Driveway steps & patio lawn) */}
              <g
                tabIndex={0}
                role="button"
                aria-label={t('house_explorer.aria_exterior') ?? "Yard and patio layer. Click to explore landscaping, gravel, sand, and base material tools."}
                aria-current={activeSection?.id === "exterior" ? "true" : undefined}
                className={`house-layer layer-exterior ${activeSection?.id === "exterior" ? "active-layer" : ""}`}
                onClick={() => handlePartClick(sectionMap.get("exterior")!)}
                onMouseEnter={() => handleLayerMouseEnter(sectionMap.get("exterior")!)}
                onKeyDown={(e) => handleLayerKeyDown(e, sectionMap.get("exterior")!)}
              >
                {/* Exterior Grass Lawn / Concrete Patio area */}
                <polygon points="50,290 190,225 225,260 80,335" fill="var(--bg-muted)" stroke="var(--border-strong)" strokeWidth="1.2" />
                
                {/* Foundation entry steps matching reference image */}
                <polygon points="120,290 150,277 165,285 135,298" fill="#d4d4d4" stroke="#bfbfbf" strokeWidth="1" />
                <polygon points="120,290 135,298 135,304 120,296" fill="#b0b0b0" stroke="#bfbfbf" strokeWidth="1" />
                <polygon points="135,298 165,285 165,291 135,304" fill="#949494" stroke="#bfbfbf" strokeWidth="1" />
              </g>

              {/* SECTION 3: FOUNDATION (Grey slab foundation platform) */}
              <g
                tabIndex={0}
                role="button"
                aria-label={t('house_explorer.aria_foundation') ?? "Foundation and concrete slab layer. Click to explore concrete, footings, and masonry calculator."}
                aria-current={activeSection?.id === "foundation" ? "true" : undefined}
                className={`house-layer layer-foundation ${activeSection?.id === "foundation" ? "active-layer" : ""}`}
                onClick={() => handlePartClick(sectionMap.get("foundation")!)}
                onMouseEnter={() => handleLayerMouseEnter(sectionMap.get("foundation")!)}
                onKeyDown={(e) => handleLayerKeyDown(e, sectionMap.get("foundation")!)}
              >
                {/* Slab top face */}
                <polygon points="84,226 220,279 356,226 220,173" fill="url(#slabPlatform)" stroke="#cccccc" strokeWidth="1.5" />
                {/* Slab left vertical face */}
                <polygon points="84,226 220,279 220,291 84,238" fill="#c2c2c2" stroke="#b5b5b5" strokeWidth="1" />
                {/* Slab right vertical face */}
                <polygon points="220,279 356,226 356,238 220,291" fill="#ababab" stroke="#b5b5b5" strokeWidth="1" />
                
                {/* Foundation concrete slab tile patterns (only when exploded) */}
                {isExploded && (
                  <>
                    <path d="M 118,213 L 254,266" className="floor-grid" />
                    <path d="M 152,200 L 288,253" className="floor-grid" />
                    <path d="M 186,187 L 322,240" className="floor-grid" />
                    
                    <path d="M 118,240 L 254,187" className="floor-grid" />
                    <path d="M 152,253 L 288,200" className="floor-grid" />
                    <path d="M 186,266 L 322,213" className="floor-grid" />
                  </>
                )}
              </g>

              {/* OCCLUDED CHARACTER: Person on chair (revealed only in Exploded view) */}
              <g className="layer-person">
                {/* Brown chair backrest */}
                <polygon points="230,195 230,172 238,176 238,199" fill="#8c583f" stroke="#663e2a" strokeWidth="0.5" />
                
                {/* Legs of the chair */}
                <line x1="214" y1="210" x2="214" y2="228" stroke="#9e9e9e" strokeWidth="1.5" />
                <line x1="222" y1="208" x2="222" y2="226" stroke="#9e9e9e" strokeWidth="1.5" />
                <line x1="238" y1="199" x2="238" y2="217" stroke="#757575" strokeWidth="1.5" />

                {/* Brown chair seat */}
                <polygon points="208,205 230,200 238,205 216,210" fill="#a1664a" stroke="#663e2a" strokeWidth="0.5" />

                {/* Pants/Legs */}
                <polygon points="212,202 226,198 226,208 212,212" fill="#2d5266" />
                <rect x="211" y="209" width="5" height="15" fill="#2d5266" />
                {/* Shoes */}
                <ellipse cx="213" cy="225" rx="3.5" ry="1.8" fill="#6e4227" />

                {/* Torso (Blue Shirt & Tie) */}
                <polygon points="214,172 228,168 228,202 214,206" fill="#75b3f5" />
                <polygon points="219,172 223,171 223,191 220,191" fill="#1e54a3" />

                {/* Face, Beard & Hair */}
                <circle cx="221" cy="158" r="8" fill="#fad7b1" />
                {/* Brown beard */}
                <path d="M 213,158 Q 221,170 229,158 L 225,165 L 217,165 Z" fill="#694025" />
                {/* Hair */}
                <path d="M 213,156 Q 221,146 229,156 Q 225,152 217,152 Z" fill="#694025" />
                {/* Eyes */}
                <circle cx="218" cy="156" r="0.8" fill="#333333" />
                <circle cx="224" cy="155" r="0.8" fill="#333333" />

                {/* Arms & laptop */}
                <line x1="224" y1="178" x2="216" y2="187" stroke="#75b3f5" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="216" y1="187" x2="208" y2="187" stroke="#fad7b1" strokeWidth="2.5" strokeLinecap="round" />
                {/* Silver Laptop open at angle */}
                <polygon points="198,184 210,182 214,187 202,189" fill="#cfd8dc" />
                <polygon points="198,184 198,167 202,170 202,187" fill="#b0bec5" stroke="#cfd8dc" strokeWidth="0.5" />
              </g>

              {/* SECTION 4: INTERIOR (Inside bedroom/living cutaway view) */}
              <g
                tabIndex={0}
                role="button"
                aria-label={t('house_explorer.aria_interior') ?? "Interior paint and tile flooring layer. Click to explore interior paint, floor tiles, and tiling grids."}
                aria-current={activeSection?.id === "interior" ? "true" : undefined}
                className={`house-layer layer-interior ${activeSection?.id === "interior" ? "active-layer" : ""}`}
                onClick={() => handlePartClick(sectionMap.get("interior")!)}
                onMouseEnter={() => handleLayerMouseEnter(sectionMap.get("interior")!)}
                onKeyDown={(e) => handleLayerKeyDown(e, sectionMap.get("interior")!)}
              >
                {/* Back interior wall panel (beige wall interior face) */}
                <polygon points="220,279 356,226 356,131 220,184" fill="url(#wallBeige)" stroke="#d9c39e" strokeWidth="1.5" />
                {/* Floor surface area interior overlay */}
                <polygon points="225,275 350,224 350,222 225,273" fill="#fff5e6" opacity="0.35" />
                
                {/* Double pane window frame (white) */}
                <polygon points="275,170 315,154 315,209 275,225" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2.5" strokeLinejoin="round" />
                {/* Yellow illuminated glass panels */}
                <polygon points="280,175 310,163 310,203 280,215" fill="url(#windowGlass)" />
                <line x1="295" y1="162" x2="295" y2="217" stroke="#ffffff" strokeWidth="2.5" />
                <line x1="275" y1="190" x2="315" y2="174" stroke="#ffffff" strokeWidth="2.5" />
              </g>

              {/* SECTION 2: WALLS & DRYWALL (Front left beige walls matching reference) */}
              <g
                tabIndex={0}
                role="button"
                aria-label={t('house_explorer.aria_walls') ?? "Exterior wall and drywall structure layer. Click to explore drywall sheets, studs, framing, and masonry blocks."}
                aria-current={activeSection?.id === "walls" ? "true" : undefined}
                className={`house-layer layer-walls ${activeSection?.id === "walls" ? "active-layer" : ""}`}
                onClick={() => handlePartClick(sectionMap.get("walls")!)}
                onMouseEnter={() => handleLayerMouseEnter(sectionMap.get("walls")!)}
                onKeyDown={(e) => handleLayerKeyDown(e, sectionMap.get("walls")!)}
              >
                {/* Front left beige wall body */}
                <polygon points="84,226 220,279 220,184 84,131" fill="url(#wallBeige)" stroke="#d9c39e" strokeWidth="1.5" />
                {/* Triangular gable wall above left wall */}
                <polygon points="84,131 220,184 152,90" fill="url(#wallBeige)" stroke="#d9c39e" strokeWidth="1.5" />

                {/* Triangle window frame inside the gable */}
                <polygon points="132,105 172,121 172,156 132,140" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2.5" strokeLinejoin="round" />
                <polygon points="137,109 167,121 167,151 137,139" fill="url(#windowGlass)" />
                <line x1="152" y1="105" x2="152" y2="156" stroke="#ffffff" strokeWidth="2.5" />
                <line x1="132" y1="130" x2="172" y2="146" stroke="#ffffff" strokeWidth="2.5" />

                {/* Front door (dark brown, left side) */}
                <polygon points="104,169 139,183 139,248 104,234" fill="url(#doorBrown)" stroke="#592b21" strokeWidth="1" />
                {/* White door frame */}
                <polygon points="104,169 139,183 139,248 104,234" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
                {/* Golden doorknob */}
                <circle cx="132" cy="216" r="2" fill="#ffd700" stroke="#ccac00" strokeWidth="0.5" />

                {/* Window to the right of the door */}
                <polygon points="159,180 199,196 199,251 159,235" fill="#ffffff" stroke="#e0e0e0" strokeWidth="2.5" strokeLinejoin="round" />
                <polygon points="164,185 194,197 194,246 164,234" fill="url(#windowGlass)" />
                <line x1="179" y1="191" x2="179" y2="246" stroke="#ffffff" strokeWidth="2.5" />
                <line x1="164" y1="215" x2="194" y2="227" stroke="#ffffff" strokeWidth="2.5" />
              </g>

              {/* SECTION 1: ROOF (Sky blue gabled roof - Solid Color) */}
              <g
                tabIndex={0}
                role="button"
                aria-label={t('house_explorer.aria_roof') ?? "Roofing layer. Click to explore roof shingles, metal roof, r-value insulation, and deck plans."}
                aria-current={activeSection?.id === "roof" ? "true" : undefined}
                className={`house-layer layer-roof ${activeSection?.id === "roof" ? "active-layer" : ""}`}
                onClick={() => handlePartClick(sectionMap.get("roof")!)}
                onMouseEnter={() => handleLayerMouseEnter(sectionMap.get("roof")!)}
                onKeyDown={(e) => handleLayerKeyDown(e, sectionMap.get("roof")!)}
              >
                {/* Main front-right blue slope - completely blue solid */}
                <polygon points="152,90 288,37 372,141 236,194" fill="url(#roofBlue)" stroke="#326bb3" strokeWidth="1.2" />
                
                {/* Front eave trim overhang gable border (fascia boards) - completely blue solid */}
                <polygon points="152,90 236,194 231,200 147,96" fill="url(#roofTrim)" stroke="#1a3f73" strokeWidth="0.75" />
                <polygon points="152,90 68,137 75,143 152,96" fill="url(#roofTrim)" stroke="#1a3f73" strokeWidth="0.75" />

                {/* Dark Brown Chimney sitting on the roof ridge */}
                <polygon points="255,54 270,49 270,20 255,25" fill="#5c2c20" stroke="#4a2218" strokeWidth="0.75" />
                <polygon points="270,49 282,53 282,24 270,20" fill="#421e16" stroke="#4a2218" strokeWidth="0.75" />
                <polygon points="255,25 270,20 282,24 267,29" fill="#2d130e" stroke="#4a2218" strokeWidth="0.75" />
              </g>
            </svg>
            </div>
          </div>
        </div>

        {/* Right Side: Information Panel */}
        <div className="lg:col-span-5 flex flex-col justify-center min-h-[360px]">
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {activeSection
              ? (t('house_explorer.sr_selected')?.replace('{name}', activeSection.name).replace('{count}', String(activeSection.toolsCount)) ?? `Selected: ${activeSection.name}. ${activeSection.toolsCount} tools available. Use arrow keys to navigate sections.`)
              : (t('house_explorer.sr_no_selection') ?? "No section selected. Tab into the house map and use arrow keys to navigate.")}
          </div>
          {activeSection ? (
            <div key={activeSection.id} className="flex flex-col gap-5 animate-fade-in-up">
              <div>
                <span className="text-[10px] font-mono text-[var(--fg-muted)] bg-[var(--bg-muted)] px-2 py-0.5 rounded border border-[var(--border)]">
                  {t(`house_explorer.section_cat_${activeSection.id}`) ?? activeSection.category}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-[var(--fg)] mt-2">
                  {t(`house_explorer.section_name_${activeSection.id}`) ?? activeSection.name}
                </h3>
              </div>
              <p className="text-xs text-[var(--fg-secondary)] leading-relaxed text-pretty">
                {t(`house_explorer.section_desc_${activeSection.id}`) ?? activeSection.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
                    {t('house_explorer.calculators_label')?.replace('{count}', String(activeSection.calculators.length)) ?? `Calculators (${activeSection.calculators.length})`}
                  </span>
                  <ul className="flex flex-col gap-1">
                    {activeSection.calculators.map((c, idx) => (
                      <li key={idx} className="text-[10px] text-[var(--fg-secondary)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"></span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
                    {t('house_explorer.planners_label')?.replace('{count}', String(activeSection.planners.length)) ?? `Planners (${activeSection.planners.length})`}
                  </span>
                  <ul className="flex flex-col gap-1">
                    {activeSection.planners.map((p, idx) => (
                      <li key={idx} className="text-[10px] text-[var(--fg-secondary)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0"></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
                    {t('house_explorer.maintenance_label') ?? 'Maintenance'}
                  </span>
                  <ul className="flex flex-col gap-1">
                    {activeSection.maintenance.map((m, idx) => (
                      <li key={idx} className="text-[10px] text-[var(--fg-secondary)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] shrink-0"></span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
                    {t('house_explorer.guides_label') ?? 'Guides & Reading'}
                  </span>
                  <ul className="flex flex-col gap-1">
                    {activeSection.guides.length > 0 ? activeSection.guides.map((g, idx) => (
                      <li key={idx}>
                        <a 
                          href={g.link}
                          className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                          </svg>
                          <span>{g.name}</span>
                        </a>
                      </li>
                    )) : (
                      <li className="text-[10px] text-[var(--fg-muted)] italic">{t('house_explorer.no_guides') ?? 'No guides yet'}</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-4 flex items-center gap-3">
                <a
                  href={activeSection.link}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 shadow-sm hover:shadow"
                >
                  {t('house_explorer.open_section') ?? 'Open Section'} →
                </a>
                <a
                  href={activeSection.guides[0]?.link || activeSection.link}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50"
                >
                  {t('common.learnMore') ?? 'Learn More'}
                </a>
                <div className="flex items-center gap-1 text-[10px] text-[var(--fg-muted)] font-mono ml-auto">
                  <svg className="w-3.5 h-3.5 text-[var(--warning)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0 1 12 2v6.5h4.5a1 1 0 0 1 .82 1.573l-7 10A1 1 0 0 1 8.5 19v-6.5H4a1 1 0 0 1-.82-1.573l7-10a1 1 0 0 1 1.12-.38z" clip-rule="evenodd" />
                  </svg>
                  <span>{t('house_explorer.tools_count')?.replace('{count}', String(activeSection.toolsCount)) ?? `${activeSection.toolsCount} Tools`}</span>
                </div>
              </div>
            </div>
          ) : isExploded ? (
            <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] min-h-[300px]">
              <svg className="w-8 h-8 text-[var(--fg-muted)] mb-3 opacity-60 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.303.197-1.591 1.591M21.75 12h-2.25m-.197 5.303-1.591-1.591M12 19.5v2.25m-5.303-.197 1.591-1.591M2.25 12h2.25m.197-5.303 1.591 1.591" />
              </svg>
              <h4 className="text-xs font-semibold text-[var(--fg)] mb-1">
                {t('house_explorer.structure_exploded') ?? 'Structure Exploded'}
              </h4>
              <p className="text-[11px] text-[var(--fg-muted)] max-w-[200px] leading-normal text-pretty">
                {hasHover ? (t('house_explorer.exploded_hover') ?? "Hover any floating layer, click to open") : (t('house_explorer.exploded_tap') ?? "Tap any floating layer to open")} {t('house_explorer.exploded_desc') ?? 'calculators, planners, maintenance, and guides for Roofing, Walls, Foundation, Interior, or Exterior.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] min-h-[300px]">
              <button
                type="button"
                className="w-12 h-12 rounded-full bg-[var(--bg-muted)] flex items-center justify-center mx-auto mb-4 hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] transition-all scale-100 hover:scale-105 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                onClick={() => setIsExploded(true)}
                aria-label={t('house_explorer.explode_aria') ?? "Explode house structure"}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v-4.5m0 4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </button>
              <h4 className="text-xs font-semibold text-[var(--fg)] mb-1">
                {t('house_explorer.house_assembled') ?? 'House Assembled'}
              </h4>
              <p className="text-[11px] text-[var(--fg-muted)] max-w-[200px] leading-normal text-pretty">
                {hasHover ? (t('house_explorer.assembled_hover') ?? "Click a house part to expand it, then click again to open its tools.") : (t('house_explorer.assembled_tap') ?? "Tap a house part to expand it, then tap again to open its tools.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withI18n(InteractiveHouseExplorer);
