import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
type UnitSystem = "imperial" | "metric";

interface Props {
  unitSystem: UnitSystem;
  onChange: (unit: UnitSystem) => void;
}

function UnitToggle({ unitSystem, onChange }: Props) {
  const { t } = useI18n();

  return (
    <fieldset className="flex bg-[var(--bg-muted)] p-0.5 rounded-lg text-xs" aria-label={t('units.imperial') ?? 'Unit system'}>
      <button
        type="button"
        aria-label={t('units.imperial') ?? 'Use imperial units'}
        className={`px-3 py-1.5 rounded-md font-medium transition-colors ${unitSystem === "imperial" ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"}`}
        onClick={() => onChange("imperial")}
      >{t('units.imperial') ?? 'Imperial'}</button>
      <button
        type="button"
        aria-label={t('units.metric') ?? 'Use metric units'}
        className={`px-3 py-1.5 rounded-md font-medium transition-colors ${unitSystem === "metric" ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"}`}
        onClick={() => onChange("metric")}
      >{t('units.metric') ?? 'Metric'}</button>
    </fieldset>
  );
}

export default withI18n(UnitToggle);
