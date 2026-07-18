import { useState } from "react";
import CostEstimatorWidget, { type CostItem } from "../ui/CostEstimatorWidget";
import { BID_BUILDER_SEEDS } from "../../data/bid-builder-seeds";
import { saveMaterialPrice } from "../../lib/storage";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

interface BidBuilderProps {
  slug: string;
}

function BidBuilder({ slug }: BidBuilderProps) {
  const { t } = useI18n();
  const seed = BID_BUILDER_SEEDS.find((s) => s.slug === slug);
  const [key, setKey] = useState(0); // For forcing re-render after reset

  if (!seed) {
    return <div>Project not found</div>;
  }

  const defaultLaborHours = Math.max(8, Math.round(seed.sqftDefault / 20));

  const handleReset = () => {
    seed.items.forEach((item) => {
      saveMaterialPrice(item.key, item.defaultPrice);
    });
    setKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      {/* Transparent Pricing Info Box */}
      <div className="rounded-xl border border-[var(--accent)] bg-[var(--card-bg)] p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]"></div>
        <h2 className="text-xl font-extrabold text-[var(--fg)] mb-2">
          Transparent Project Cost Estimator
        </h2>
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
          Unlike other tools, every line item is visible, editable, and saved to
          your browser. Your prices persist across visits.
        </p>
      </div>

      {/* Cost Estimator Widget */}
      <div key={key}>
        <CostEstimatorWidget
          items={seed.items as CostItem[]}
          defaultLaborHours={defaultLaborHours}
          projectId={`bid-builder-${seed.slug}`}
        />
      </div>

      {/* Persistence Tip & Reset */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--fg)] mb-1">
            Your Saved Prices Persist
          </h3>
          <p className="text-xs text-[var(--fg-secondary)]">
            Any prices you edit are saved in your browser's localStorage. Come
            back anytime to see your customized estimate.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="whitespace-nowrap px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-sm font-semibold text-[var(--fg)] hover:bg-[var(--card-bg-hover)] transition-colors cursor-pointer"
        >
          Reset to National Averages
        </button>
      </div>
    </div>
  );
}

export default withI18n(BidBuilder);
