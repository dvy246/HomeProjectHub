import { useState } from "react";

interface KitchenDiagramProps {
  length: number;
  width: number;
  hasIsland: boolean;
  onFocusElement?: (elementId: "countertop" | "cabinet" | "island" | "sink") => void;
}

export default function KitchenDiagram({
  length,
  width,
  hasIsland,
  onFocusElement,
}: KitchenDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const handlePartClick = (part: "countertop" | "cabinet" | "island" | "sink") => {
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
      aria-label={`Interactive Kitchen Diagram: ${length}x${width} feet. Shows cabinetry runs, stone countertops, central island, and sink fixtures.`}
    >
      <defs>
        {/* Stone Granite/Marble Pattern */}
        <linearGradient id="graniteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        {/* Wood Cabinet Grain representation */}
        <pattern id="cabinetPattern" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#78350f" />
          <line x1="0" y1="15" x2="30" y2="15" stroke="#451a03" strokeWidth="1" />
        </pattern>
      </defs>

      <text x="20" y="25" fill="var(--fg-muted)" fontSize="10" className="font-sans uppercase tracking-wider font-semibold">Kitchen Layout (Top-Down)</text>

      {/* 1. L-Shaped CABINETRY RUN (Bottom layer, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Kitchen Base Cabinets"
        onClick={() => handlePartClick("cabinet")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("cabinet"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "cabinet" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
      >
        {/* Back cabinet run */}
        <rect x="30" y="50" width="340" height="40" fill="url(#cabinetPattern)" stroke="var(--border-strong)" strokeWidth="1" />
        {/* Left cabinet run */}
        <rect x="30" y="90" width="40" height="150" fill="url(#cabinetPattern)" stroke="var(--border-strong)" strokeWidth="1" />
        <text x="180" y="74" fill="#ffffff" fontSize="9" fontWeight="bold">Cabinetry Base Run</text>
      </g>

      {/* 2. L-Shaped COUNTERTOP SLAB (Top Layer, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Stone Countertops"
        onClick={() => handlePartClick("countertop")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("countertop"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "countertop" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
      >
        {/* Top slab */}
        <rect x="30" y="50" width="340" height="30" fill="url(#graniteGrad)" stroke="var(--border-strong)" strokeWidth="1" />
        {/* Left slab */}
        <rect x="30" y="80" width="30" height="160" fill="url(#graniteGrad)" stroke="var(--border-strong)" strokeWidth="1" />
        <text x="180" y="68" fill="#ffffff" fontSize="9" fontWeight="bold">Stone Countertops</text>
      </g>

      {/* 3. SINK fixture (On top of countertop, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Under-mount Sink Basin"
        onClick={() => handlePartClick("sink")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("sink"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "sink" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-95 hover:opacity-100"}`}
      >
        {/* Sink Basin */}
        <rect x="230" y="52" width="60" height="26" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" rx="3" />
        <ellipse cx="260" cy="65" rx="20" ry="8" fill="#cbd5e1" />
        {/* Faucet */}
        <circle cx="260" cy="54" r="2.5" fill="#475569" />
      </g>

      {/* 4. KITCHEN ISLAND (Clickable, rendered conditionally) */}
      {hasIsland && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Kitchen Central Island"
          onClick={() => handlePartClick("island")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("island"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "island" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-95 hover:opacity-100"}`}
        >
          {/* Island Wood base */}
          <rect x="130" y="130" width="160" height="70" fill="url(#cabinetPattern)" rx="4" stroke="var(--border-strong)" strokeWidth="1" />
          {/* Island Granite Countertop */}
          <rect x="125" y="125" width="170" height="70" fill="url(#graniteGrad)" rx="5" stroke="var(--border-strong)" strokeWidth="1" />
          <text x="210" y="165" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Central Island Prep Slab</text>
        </g>
      )}

      {/* Dimensions labels */}
      <g fill="var(--fg)" fontSize="10" fontWeight="600" className="font-mono">
        <text x="200" y="275" textAnchor="middle">{length} ft Width</text>
        <text x="350" y="165" textAnchor="middle" transform="rotate(90 350 165)">{width} ft Length</text>
      </g>
    </svg>
  );
}
