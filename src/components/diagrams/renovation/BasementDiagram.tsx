import { useState } from "react";

interface BasementDiagramProps {
  length: number;
  width: number;
  height: number;
  ceilingType: string;
  onFocusElement?: (elementId: "drywall" | "framing" | "ceiling" | "insulation") => void;
}

export default function BasementDiagram({
  length,
  width,
  height,
  ceilingType,
  onFocusElement,
}: BasementDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const handlePartClick = (part: "drywall" | "framing" | "ceiling" | "insulation") => {
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
      aria-label={`Interactive Basement Diagram: ${length}x${width}x${height} feet. Shows wall framing studs, insulation rolls, drywall boards, and suspended ceilings.`}
    >
      <defs>
        {/* Stud Wood Pattern */}
        <pattern id="studWoodPattern" width="10" height="40" patternUnits="userSpaceOnUse">
          <rect width="6" height="40" fill="#f59e0b" opacity="0.9" />
          <line x1="6" y1="0" x2="6" y2="40" stroke="#d97706" strokeWidth="1" />
        </pattern>
        {/* Pink Insulation Pattern */}
        <pattern id="insulationPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="8" fill="none" stroke="#f472b6" strokeWidth="2.5" />
          <path d="M 0,10 Q 5,5 10,10 T 20,10" fill="none" stroke="#f472b6" strokeWidth="1.5" />
        </pattern>
      </defs>

      <text x="20" y="25" fill="var(--fg-muted)" fontSize="10" className="font-sans uppercase tracking-wider font-semibold">Basement Wall Cross-Section</text>

      {/* 1. FRAMING STUDS (Back layer, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Framing Studs"
        onClick={() => handlePartClick("framing")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("framing"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "framing" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <rect x="40" y="80" width="320" height="130" fill="url(#studWoodPattern)" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="45" y="85" width="80" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="85" y="97" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">Framing Studs</text>
      </g>

      {/* 2. WALL INSULATION BATTS (Middle layer, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Fiberglass Insulation"
        onClick={() => handlePartClick("insulation")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("insulation"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "insulation" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-80 hover:opacity-100"}`}
      >
        <rect x="70" y="110" width="260" height="90" fill="url(#insulationPattern)" stroke="#f472b6" strokeWidth="1" rx="4" />
        <rect x="160" y="115" width="80" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="200" y="127" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">R-Value Insulation</text>
      </g>

      {/* 3. CEILING GRID (Top layer, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Ceiling Structure"
        onClick={() => handlePartClick("ceiling")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("ceiling"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "ceiling" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
      >
        <rect x="30" y="45" width="340" height="25" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" rx="2" />
        <line x1="30" y1="58" x2="370" y2="58" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,5" />
        <rect x="45" y="48" width="105" height="16" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="97" y="59" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">{ceilingType} Ceiling</text>
      </g>

      {/* 4. DRYWALL FRONT FACE (Foreground panel representation, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Drywall Boards"
        onClick={() => handlePartClick("drywall")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("drywall"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "drywall" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <rect x="30" y="220" width="340" height="30" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" rx="2" />
        <rect x="45" y="226" width="90" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="90" y="238" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">Finished Drywall</text>
      </g>

      {/* Dimensions labels */}
      <g fill="var(--fg)" fontSize="10" fontWeight="600" className="font-mono">
        <text x="200" y="280" textAnchor="middle">{length} ft Length &times; {width} ft Width</text>
        <text x="350" y="145" textAnchor="middle" transform="rotate(90 350 145)">{height} ft Height</text>
      </g>
    </svg>
  );
}
