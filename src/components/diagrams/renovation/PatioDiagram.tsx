import { useState } from "react";

interface PatioDiagramProps {
  length: number;
  width: number;
  baseDepth: number;
  sandDepth: number;
  paverType: string;
  onFocusElement?: (elementId: "paver" | "sand" | "gravel") => void;
}

export default function PatioDiagram({
  length,
  width,
  baseDepth,
  sandDepth,
  paverType,
  onFocusElement,
}: PatioDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const handlePartClick = (part: "paver" | "sand" | "gravel") => {
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
      aria-label={`Interactive Patio Diagram: ${length}x${width} feet. Cross-section layers showing pavers, sand bed, and gravel base.`}
    >
      <defs>
        {/* Paver Herringbone Pattern */}
        <pattern id="brickPattern" width="40" height="20" patternUnits="userSpaceOnUse">
          <rect width="40" height="20" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          <rect x="20" width="20" height="10" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" />
          <rect y="10" width="20" height="10" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" />
        </pattern>
        {/* Sand Bedding Texture */}
        <pattern id="sandPattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#fef08a" />
          <circle cx="2" cy="3" r="0.6" fill="#eab308" />
          <circle cx="7" cy="8" r="0.6" fill="#eab308" />
          <circle cx="5" cy="5" r="0.6" fill="#eab308" />
        </pattern>
        {/* Gravel Sub-base Texture */}
        <pattern id="gravelPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#d4d4d4" />
          <polygon points="2,3 6,2 8,5 4,7" fill="#737373" />
          <polygon points="12,12 16,10 18,14 14,16" fill="#888888" />
          <polygon points="5,15 9,13 8,17 4,16" fill="#525252" />
        </pattern>
      </defs>

      <text x="20" y="30" fill="var(--fg-muted)" fontSize="10" className="font-sans uppercase tracking-wider font-semibold">Patio Layer Cross-Section</text>

      {/* 1. PAVERS LAYER (Top) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Pavers Layer"
        onClick={() => handlePartClick("paver")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("paver"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "paver" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <rect x="30" y="60" width="340" height="50" fill="url(#brickPattern)" rx="4" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="35" y="65" width="70" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="70" y="78" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="bold">Paver Block ({paverType})</text>
      </g>

      {/* 2. BEDDING SAND LAYER (Middle) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Bedding Sand Layer"
        onClick={() => handlePartClick("sand")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("sand"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "sand" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <rect x="30" y="120" width="340" height="40" fill="url(#sandPattern)" rx="4" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="35" y="125" width="80" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="75" y="138" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="bold">Sand Bed ({sandDepth}\")</text>
      </g>

      {/* 3. GRAVEL BASE LAYER (Bottom) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Gravel Base Layer"
        onClick={() => handlePartClick("gravel")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("gravel"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "gravel" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <rect x="30" y="170" width="340" height="70" fill="url(#gravelPattern)" rx="4" stroke="var(--border-strong)" strokeWidth="1" />
        <rect x="35" y="175" width="85" height="18" fill="#ffffff" opacity="0.9" rx="3" />
        <text x="77" y="188" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="bold">Gravel Sub-base ({baseDepth}\")</text>
      </g>

      {/* Geotextile fabric line indicators */}
      <line x1="30" y1="166" x2="370" y2="166" stroke="#444444" strokeWidth="2.5" strokeDasharray="3,3" />
      <text x="360" y="162" textAnchor="end" fill="var(--fg-muted)" fontSize="8">Geotextile Barrier Fabric</text>

      {/* Annotations */}
      <g fill="var(--fg)" fontSize="10" fontWeight="600" className="font-mono">
        <text x="200" y="275" textAnchor="middle">{length} ft Length &times; {width} ft Width</text>
      </g>
    </svg>
  );
}
