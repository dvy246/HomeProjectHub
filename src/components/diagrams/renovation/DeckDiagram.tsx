import { useState } from "react";

interface DeckDiagramProps {
  length: number;
  width: number;
  height: number;
  hasRailing: boolean;
  numStairs: number;
  onFocusElement?: (elementId: "decking" | "posts" | "railing" | "stairs") => void;
}

export default function DeckDiagram({
  length,
  width,
  height,
  hasRailing,
  numStairs,
  onFocusElement,
}: DeckDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const handlePartClick = (part: "decking" | "posts" | "railing" | "stairs") => {
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
      aria-label={`Interactive Deck Diagram: ${length}x${width} feet, ${height} feet high`}
    >
      <defs>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="postGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>

      {/* House Wall Indicator (Background Anchor) */}
      <path d="M 10,60 L 390,60" stroke="var(--border-strong)" strokeWidth="3" strokeDasharray="5,5" />
      <text x="200" y="45" textAnchor="middle" fill="var(--fg-muted)" fontSize="10" className="font-sans uppercase tracking-wider font-semibold">House Attachment Line (Ledger)</text>

      {/* Support Posts (Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Support Posts"
        onClick={() => handlePartClick("posts")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("posts"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "posts" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-80 hover:opacity-100"}`}
      >
        {/* Left Post */}
        <rect x="70" y="150" width="16" height="100" fill="url(#postGrad)" rx="2" stroke="#78350f" strokeWidth="1" />
        {/* Center Post */}
        <rect x="192" y="160" width="16" height="90" fill="url(#postGrad)" rx="2" stroke="#78350f" strokeWidth="1" />
        {/* Right Post */}
        <rect x="314" y="150" width="16" height="100" fill="url(#postGrad)" rx="2" stroke="#78350f" strokeWidth="1" />
        {/* Concrete Footings */}
        <ellipse cx="78" cy="250" rx="14" ry="6" fill="#a3a3a3" stroke="#737373" strokeWidth="1" />
        <ellipse cx="200" cy="250" rx="14" ry="6" fill="#a3a3a3" stroke="#737373" strokeWidth="1" />
        <ellipse cx="322" cy="250" rx="14" ry="6" fill="#a3a3a3" stroke="#737373" strokeWidth="1" />
      </g>

      {/* Under-structure Framing Joists */}
      <path d="M 50,150 L 350,150 L 350,162 L 50,162 Z" fill="#d97706" opacity="0.6" stroke="#92400e" strokeWidth="1" />

      {/* Decking Surface Boards (Clickable) */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Decking Surface"
        onClick={() => handlePartClick("decking")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("decking"); }}
        className={`cursor-pointer transition-all duration-200 ${activePart === "decking" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-85 hover:opacity-100"}`}
      >
        <polygon points="50,60 350,60 350,150 50,150" fill="url(#woodGrad)" stroke="#451a03" strokeWidth="1.5" />
        {/* Plank Lines representing wood texture */}
        <line x1="80" y1="60" x2="80" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
        <line x1="110" y1="60" x2="110" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
        <line x1="140" y1="60" x2="140" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
        <line x1="170" y1="60" x2="170" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
        <line x1="200" y1="60" x2="200" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
        <line x1="230" y1="60" x2="230" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
        <line x1="260" y1="60" x2="260" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
        <line x1="290" y1="60" x2="290" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
        <line x1="320" y1="60" x2="320" y2="150" stroke="#451a03" strokeWidth="0.5" opacity="0.5" />
      </g>

      {/* Railing Assembly (Clickable - rendered if hasRailing is true) */}
      {hasRailing && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Railing"
          onClick={() => handlePartClick("railing")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("railing"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "railing" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
        >
          {/* Top Handrails */}
          <line x1="50" y1="120" x2="350" y2="120" stroke="#1c1917" strokeWidth="4" />
          <line x1="50" y1="120" x2="50" y2="150" stroke="#1c1917" strokeWidth="4" />
          <line x1="350" y1="120" x2="350" y2="150" stroke="#1c1917" strokeWidth="4" />

          {/* Balusters (spindles) */}
          {Array.from({ length: 25 }, (_, i) => {
            const x = 55 + i * 12;
            return <line key={i} x1={x} y1="120" x2={x} y2="150" stroke="#44403c" strokeWidth="1.5" />;
          })}
        </g>
      )}

      {/* Stairs representation (Clickable - rendered if numStairs > 0) */}
      {numStairs > 0 && (
        <g
          role="button"
          tabIndex={0}
          aria-label="Stairs"
          onClick={() => handlePartClick("stairs")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePartClick("stairs"); }}
          className={`cursor-pointer transition-all duration-200 ${activePart === "stairs" ? "opacity-100 filter drop-shadow-[0_0_8px_var(--accent)]" : "opacity-90 hover:opacity-100"}`}
        >
          {/* 3 Step Stairs descending down */}
          <polygon points="170,150 230,150 230,165 170,165" fill="#78350f" stroke="#451a03" strokeWidth="1" />
          <polygon points="175,165 225,165 225,180 175,180" fill="#92400e" stroke="#451a03" strokeWidth="1" />
          <polygon points="180,180 220,180 220,195 180,195" fill="#b45309" stroke="#451a03" strokeWidth="1" />
        </g>
      )}

      {/* Measurement Annotations */}
      <g fill="var(--fg)" fontSize="10" fontWeight="600" className="font-mono">
        <text x="200" y="140" textAnchor="middle" fill="#ffffff" stroke="#451a03" strokeWidth="2" paintOrder="stroke">{length} ft</text>
        <text x="40" y="105" textAnchor="middle" fill="#ffffff" stroke="#451a03" strokeWidth="2" paintOrder="stroke">{width} ft</text>
      </g>
    </svg>
  );
}
