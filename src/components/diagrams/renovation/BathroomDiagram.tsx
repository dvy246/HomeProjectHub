import { useState } from "react";

interface BathroomDiagramProps {
  length: number;
  width: number;
  hasVanity: boolean;
  hasShower: boolean;
  hasToilet: boolean;
  onFocusElement?: (elementId: "flooring" | "walls" | "vanity" | "shower" | "toilet") => void;
}

export default function BathroomDiagram({
  length,
  width,
  hasVanity,
  hasShower,
  hasToilet,
  onFocusElement,
}: BathroomDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const handlePartClick = (part: "flooring" | "walls" | "vanity" | "shower" | "toilet") => {
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
      aria-label={`Interactive Bathroom Diagram: ${length}x${width} feet. Shows vanity, shower, toilet, and tile flooring.`}
    >
      <defs>
        {/* Tile Floor Grid Pattern */}
        <pattern id="tileFloorPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1" />
        </pattern>
        {/* Wall Paint Texture */}
        <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      <text x="20" y="25" fill="var(--fg-muted)" fontSize="10" className="font-sans uppercase tracking-wider font-semibold">Bathroom Layout (Top-Down)</text>

      {/* WALLS boundary representation (Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Walls Paint/Drywall"
        onClick={() => handlePartClick("walls")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("walls"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "walls" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        {/* Back Wall */}
        <rect x="20" y="40" width="360" height="15" fill="url(#wallGradient)" stroke="var(--border-strong)" strokeWidth="1.5" />
        {/* Left Wall */}
        <rect x="20" y="40" width="15" height="230" fill="url(#wallGradient)" stroke="var(--border-strong)" strokeWidth="1.5" />
        {/* Right Wall */}
        <rect x="365" y="40" width="15" height="230" fill="url(#wallGradient)" stroke="var(--border-strong)" strokeWidth="1.5" />
      </g>

      {/* FLOOR area representation (Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Floor Tile Area"
        onClick={() => handlePartClick("flooring")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("flooring"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "flooring" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
      >
        <rect x="35" y="55" width="330" height="215" fill="url(#tileFloorPattern)" />
      </g>

      {/* SHOWER/TUB unit (Clickable - rendered if hasShower is true) */}
      {hasShower && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Shower/Tub Unit"
          onClick={() => handlePartClick("shower")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("shower"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "shower" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-95 hover:opacity-100"}`}
        >
          {/* Shower Tub Basin */}
          <rect x="35" y="55" width="110" height="70" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" rx="4" />
          <ellipse cx="90" cy="90" rx="35" ry="18" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Shower Drain */}
          <circle cx="90" cy="90" r="4" fill="#64748b" />
        </g>
      )}

      {/* VANITY CABINET & SINK (Clickable - rendered if hasVanity is true) */}
      {hasVanity && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Vanity Cabinet"
          onClick={() => handlePartClick("vanity")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("vanity"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "vanity" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-95 hover:opacity-100"}`}
        >
          {/* Wooden Vanity Cabinet */}
          <rect x="265" y="55" width="100" height="60" fill="#d97706" stroke="#b45309" strokeWidth="2" rx="3" />
          {/* Sink Bowl */}
          <ellipse cx="315" cy="85" rx="25" ry="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Faucet */}
          <circle cx="315" cy="74" r="3" fill="#94a3b8" />
          <line x1="315" y1="74" x2="315" y2="78" stroke="#94a3b8" strokeWidth="2" />
        </g>
      )}

      {/* TOILET unit (Clickable - rendered if hasToilet is true) */}
      {hasToilet && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Toilet Unit"
          onClick={() => handlePartClick("toilet")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("toilet"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "toilet" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-95 hover:opacity-100"}`}
        >
          {/* Tank */}
          <rect x="205" y="55" width="45" height="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="2" />
          {/* Bowl */}
          <ellipse cx="227" cy="90" rx="16" ry="20" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="227" cy="86" rx="10" ry="12" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
        </g>
      )}

      {/* Dimension labels */}
      <g fill="var(--fg)" fontSize="10" fontWeight="600" className="font-mono">
        <text x="200" y="255" textAnchor="middle">{length} ft Width</text>
        <text x="350" y="170" textAnchor="middle" transform="rotate(90 350 170)">{width} ft Length</text>
      </g>
    </svg>
  );
}
