import { useState } from "react";

interface FenceDiagramProps {
  length: number;
  postSpacing: number;
  numGates: number;
  onFocusElement?: (elementId: "post" | "picket" | "gate") => void;
}

export default function FenceDiagram({
  length,
  postSpacing,
  numGates,
  onFocusElement,
}: FenceDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const handlePartClick = (part: "post" | "picket" | "gate") => {
    setActivePart(part);
    if (onFocusElement) {
      onFocusElement(part);
    }
  };

  return (
    <svg
      viewBox="0 0 400 250"
      className="w-full h-auto diagram-svg border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)]"
      role="img"
      aria-label={`Interactive Fence Diagram: ${length} feet total span. Shows line posts spaced every ${postSpacing} feet, horizontal rails, vertical pickets, and entry gates.`}
    >
      <defs>
        {/* Wood grain picket pattern */}
        <pattern id="picketPattern" width="10" height="80" patternUnits="userSpaceOnUse">
          <rect width="8" height="80" fill="#d97706" />
          <line x1="8" y1="0" x2="8" y2="80" stroke="#b45309" strokeWidth="1" />
        </pattern>
      </defs>

      <text x="20" y="25" fill="var(--fg-muted)" fontSize="10" className="font-sans uppercase tracking-wider font-semibold">Fence Elevation View</text>

      {/* Ground Line */}
      <line x1="20" y1="210" x2="380" y2="210" stroke="#4b5563" strokeWidth="3" />
      <text x="360" y="225" textAnchor="end" fill="var(--fg-muted)" fontSize="8">Ground Line (Subgrade soil)</text>

      {/* 1. HORIZONTAL WOOD RAILS (Backing bars) */}
      <rect x="30" y="90" width="340" height="8" fill="#92400e" stroke="#451a03" strokeWidth="1" />
      <rect x="30" y="160" width="340" height="8" fill="#92400e" stroke="#451a03" strokeWidth="1" />

      {/* 2. PICKETS FILL LAYER (Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Fence Pickets"
        onClick={() => handlePartClick("picket")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("picket"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "picket" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
      >
        {/* Pickets box */}
        <rect x="30" y="70" width="220" height="135" fill="url(#picketPattern)" stroke="#b45309" strokeWidth="1.5" />
        <rect x="45" y="75" width="80" height="16" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="85" y="86" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">Vertical Pickets</text>
      </g>

      {/* 3. GATE PANEL (Clickable, rendered conditionally if numGates > 0) */}
      {numGates > 0 && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Access Gate"
          onClick={() => handlePartClick("gate")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("gate"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "gate" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-95 hover:opacity-100"}`}
        >
          {/* Gate Box */}
          <rect x="280" y="70" width="70" height="135" fill="url(#picketPattern)" stroke="#991b1b" strokeWidth="2.5" />
          {/* Gate Cross-brace brace line */}
          <line x1="280" y1="70" x2="350" y2="205" stroke="#991b1b" strokeWidth="3" />
          <rect x="285" y="75" width="55" height="16" fill="#ffffff" opacity="0.9" rx="3" />
          <text x="312" y="86" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">Entry Gate</text>
        </g>
      )}

      {/* 4. LINE POSTS (Clickable structural vertical studs) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Fence Line Posts"
        onClick={() => handlePartClick("post")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("post"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "post" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
      >
        {/* Left Post */}
        <rect x="25" y="60" width="12" height="175" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
        {/* Concrete footing pier indicator under ground */}
        <ellipse cx="31" cy="235" rx="10" ry="15" fill="#cbd5e1" stroke="#94a3b8" />
        
        {/* Middle Post */}
        <rect x="260" y="60" width="12" height="175" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
        <ellipse cx="266" cy="235" rx="10" ry="15" fill="#cbd5e1" stroke="#94a3b8" />

        {/* Right Post */}
        <rect x="360" y="60" width="12" height="175" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
        <ellipse cx="366" cy="235" rx="10" ry="15" fill="#cbd5e1" stroke="#94a3b8" />

        <rect x="150" y="215" width="100" height="16" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="200" y="226" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">Line Posts & Footings</text>
      </g>

      {/* Dimensions labels */}
      <g fill="var(--fg)" fontSize="10" fontWeight="600" className="font-mono">
        <text x="200" y="45" textAnchor="middle">{length} ft Total Length</text>
      </g>
    </svg>
  );
}
