import { Card } from "./Card";

interface Props {
  bags80: number;
  bags60: number;
  bags50: number;
  bags40: number;
}

export default function ConcreteBagMatrix({ bags80, bags60, bags50, bags40 }: Props) {
  const rows = [
    { size: "80 lb", yield: "0.60 cu ft", count: bags80 },
    { size: "60 lb", yield: "0.45 cu ft", count: bags60 },
    { size: "50 lb", yield: "0.375 cu ft", count: bags50 },
    { size: "40 lb", yield: "0.30 cu ft", count: bags40 },
  ];

  return (
    <Card>
      <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Bags by Size</h3>
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.size} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tabular-nums">{row.size}</span>
              <span className="text-xs text-[var(--fg-muted)] font-mono">{row.yield}</span>
            </div>
            <span className="text-sm font-bold tabular-nums">{row.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
