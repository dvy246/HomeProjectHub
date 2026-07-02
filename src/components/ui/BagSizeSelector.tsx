type BagSize = "40lb" | "50lb" | "60lb" | "80lb";

interface Props {
  bagSize: BagSize;
  onChange: (size: BagSize) => void;
}

const bagSizes: BagSize[] = ["40lb", "50lb", "60lb", "80lb"];

export default function BagSizeSelector({ bagSize, onChange }: Props) {
  return (
    <div className="border-t border-[var(--border)] pt-4">
      <p className="text-xs font-medium text-[var(--fg-secondary)] mb-2">Bag Size for Output</p>
      <div className="grid grid-cols-4 gap-2">
        {bagSizes.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={bagSize === size}
            onClick={() => onChange(size)}
            className={`border rounded-lg py-2.5 text-xs font-semibold font-mono transition-colors min-h-[44px] flex items-center justify-center motion-safe:active:scale-[0.97] ${bagSize === size ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--fg)]"}`}
          >{size}</button>
        ))}
      </div>
    </div>
  );
}
