type UnitSystem = "imperial" | "metric";

interface Props {
  unitSystem: UnitSystem;
  onChange: (unit: UnitSystem) => void;
}

export default function UnitToggle({ unitSystem, onChange }: Props) {
  return (
    <fieldset className="flex bg-[var(--bg-muted)] p-0.5 rounded-lg text-xs" aria-label="Unit system">
      <button
        type="button"
        aria-label="Use imperial units"
        className={`px-3 py-1.5 rounded-md font-medium transition-colors ${unitSystem === "imperial" ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"}`}
        onClick={() => onChange("imperial")}
      >Imperial</button>
      <button
        type="button"
        aria-label="Use metric units"
        className={`px-3 py-1.5 rounded-md font-medium transition-colors ${unitSystem === "metric" ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"}`}
        onClick={() => onChange("metric")}
      >Metric</button>
    </fieldset>
  );
}
