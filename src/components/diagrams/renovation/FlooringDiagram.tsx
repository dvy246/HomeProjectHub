import { useState } from "react";

interface FlooringDiagramProps {
  length: number;
  width: number;
  flooringType: string;
  onFocusElement?: (elementId: "subfloor" | "underlayment" | "finish") => void;
}

export default function FlooringDiagram({
  length,
  width,
  flooringType,
  onFocusElement,
}: FlooringDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const handlePartClick = (part: "subfloor" | "underlayment" | "finish") => {
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
      aria-label={`Interactive Flooring Diagram: ${length}x${width} feet. Cross-section layers showing wooden subfloor, underlayment padding, and finished floorboards.`}
    >
      <defs>
        {/* Wood Board Plank Texture */}
        <pattern id="boardPlankPattern" width="40" height="20" patternUnits="userSpaceOnUse">
          <rect width="40" height="20" fill="#a16207" stroke="#713f12" strokeWidth="1" />
          <line x1="20" y1="0" x2="20" y2="20" stroke="#713f12" strokeWidth="1" />
        </pattern>
        {/* Underlayment Padding Grid */}
        <pattern id="paddingPattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#a7f3d0" />
          <circle cx="5" cy="5" r="1.5" fill="#34d399" />
        </pattern>
        {/* Subfloor Wood Grain */}
        <pattern id="plywoodPattern" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#d97706" />
          <path d="M 0,15 C 10,5 20,25 30,15" fill="none" stroke="#b45309" strokeWidth="1.5" />
        </pattern>
      </defs>

      <text x="20" y="25" fill="var(--fg-muted)" fontSize="10" className="font-sans uppercase tracking-wider font-semibold">Flooring Layer Cross-Section</text>

      {/* 1. FINISH FLOORBOARD LAYER (Top, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Finished Flooring Layer"
        onClick={() => handlePartClick("finish")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("finish"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "finish" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <rect x="30" y="60" width="340" height="50" fill="url(#boardPlankPattern)" rx="4" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="35" y="65" width="105" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="87" y="78" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="bold">Finish Layer ({flooringType})</text>
      </g>

      {/* 2. UNDERLAYMENT ROLLS LAYER (Middle, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Underlayment Foam Padding"
        onClick={() => handlePartClick("underlayment")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("underlayment"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "underlayment" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <rect x="30" y="120" width="340" height="40" fill="url(#paddingPattern)" rx="4" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="35" y="125" width="125" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="97" y="138" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="bold">Underlayment Padding</text>
      </g>

      {/* 3. SUBFLOOR PLYWOOD LAYER (Bottom, Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Subfloor Framing Panels"
        onClick={() => handlePartClick("subfloor")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("subfloor"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "subfloor" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <rect x="30" y="170" width="340" height="60" fill="url(#plywoodPattern)" rx="4" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="35" y="175" width="115" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="92" y="188" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="bold">OSB Plywood Subfloor</text>
      </g>

      {/* Dimensions labels */}
      <g fill="var(--fg)" fontSize="10" fontWeight="600" className="font-mono">
        <text x="200" y="265" textAnchor="middle">{length} ft Length &times; {width} ft Width</text>
      </g>
    </svg>
  );
}
