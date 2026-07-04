import { useState } from "react";

interface GarageDiagramProps {
  length: number;
  width: number;
  hasShelving: boolean;
  numDoors: number;
  onFocusElement?: (elementId: "floor" | "door" | "shelving") => void;
}

export default function GarageDiagram({
  length,
  width,
  hasShelving,
  numDoors,
  onFocusElement,
}: GarageDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const handlePartClick = (part: "floor" | "door" | "shelving") => {
    setActivePart(part);
    if (onFocusElement) {
      onFocusElement(part);
    }
  };

  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-auto diagram-svg border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]"
      role="img"
      aria-label={`Interactive Garage Diagram: ${length}x${width} feet. Shows epoxy flooring, storage racks, and overhead insulated garage doors.`}
    >
      <defs>
        {/* Epoxy Speckle Pattern */}
        <pattern id="epoxyPattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#475569" />
          <circle cx="2" cy="3" r="0.8" fill="#e2e8f0" />
          <circle cx="8" cy="9" r="0.8" fill="#94a3b8" />
          <circle cx="13" cy="5" r="0.8" fill="#f8fafc" />
          <circle cx="5" cy="12" r="0.8" fill="#334155" />
        </pattern>
        {/* Storage Shelves Pattern */}
        <pattern id="shelvingPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#78350f" />
          <rect x="2" y="2" width="16" height="16" fill="#92400e" stroke="#451a03" strokeWidth="1" />
        </pattern>
      </defs>

      <text x="20" y="25" fill="var(--fg-muted)" fontSize="10" className="font-sans uppercase tracking-wider font-semibold">Garage Layout (Top-Down)</text>

      {/* 1. EPOXY FLOOR AREA (Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Epoxy Floor Coating"
        onClick={() => handlePartClick("floor")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("floor"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "floor" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
      >
        <rect x="35" y="55" width="330" height="215" fill="url(#epoxyPattern)" rx="4" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="45" y="65" width="85" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="87" y="77" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">Epoxy Flooring</text>
      </g>

      {/* 2. OVERHEAD GARAGE DOORS (Clickable, rendered conditionally based on numDoors) */}
      {numDoors > 0 && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Insulated Garage Doors"
          onClick={() => handlePartClick("door")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("door"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "door" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-95 hover:opacity-100"}`}
        >
          {/* Main overhead line at front entry (typically bottom of SVG view) */}
          <rect x="70" y="260" width="110" height="10" fill="#94a3b8" rx="2" stroke="#475569" strokeWidth="1.5" />
          {numDoors > 1 && (
            <rect x="220" y="260" width="110" height="10" fill="#94a3b8" rx="2" stroke="#475569" strokeWidth="1.5" />
          )}
          <rect x="150" y="235" width="100" height="18" fill="#ffffff" opacity="0.9" rx="3" />
          <text x="200" y="247" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">{numDoors} Overhead Doors</text>
        </g>
      )}

      {/* 3. WALL STORAGE SHELVES (Clickable, rendered conditionally) */}
      {hasShelving && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Wall Shelving Units"
          onClick={() => handlePartClick("shelving")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("shelving"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "shelving" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-95 hover:opacity-100"}`}
        >
          {/* Shelves along Left Wall */}
          <rect x="35" y="70" width="18" height="150" fill="url(#shelvingPattern)" stroke="#451a03" strokeWidth="1" />
          {/* Shelves along Back Wall */}
          <rect x="53" y="55" width="150" height="18" fill="url(#shelvingPattern)" stroke="#451a03" strokeWidth="1" />
          <rect x="90" y="85" width="85" height="18" fill="#ffffff" opacity="0.9" rx="3" />
          <text x="132" y="97" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">Storage Shelves</text>
        </g>
      )}

      {/* Dimensions labels */}
      <g fill="var(--fg)" fontSize="10" fontWeight="600" className="font-mono">
        <text x="200" y="285" textAnchor="middle">{length} ft Width</text>
        <text x="20" y="160" textAnchor="middle" transform="rotate(-90 20 160)">{width} ft Length</text>
      </g>
    </svg>
  );
}
