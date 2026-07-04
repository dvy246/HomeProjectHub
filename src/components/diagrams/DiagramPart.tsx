import { useState, type ReactElement, cloneElement } from "react";

interface DiagramPartProps {
  title: string;
  children: ReactElement<{ className?: string }>;
  defaultActive?: boolean;
}

export default function DiagramPart({ title, children, defaultActive }: DiagramPartProps) {
  const [active, setActive] = useState(defaultActive || false);
  const existingClass = (children.props as { className?: string }).className || '';

  return (
    <g
      onClick={(e) => { e.stopPropagation(); setActive(!active); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(!active); } }}
      role="button"
      tabIndex={0}
      aria-label={title}
      aria-pressed={active}
    >
      {cloneElement(children, {
        className: `${existingClass} diagram-part${active ? ' diagram-part--active' : ''}`,
      })}
    </g>
  );
}