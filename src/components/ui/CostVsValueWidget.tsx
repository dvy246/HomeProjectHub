import React from "react";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { Card } from "./Card";
import cvvData from "../../data/cost-vs-value.json";

interface CostVsValueWidgetProps {
  projectKey: string;
  customCost?: number;
}

interface ProjectStats {
  recoupPercent: number;
  projectType: string;
  typicalCost: number;
  resaleValue: number;
}

function CostVsValueWidget({ projectKey, customCost }: CostVsValueWidgetProps) {
  const { locale } = useI18n();

  // Hide in non-English locales due to US-centric nature of the Zonda dataset
  if (locale !== "en") return null;

  const data = (cvvData as Record<string, ProjectStats>)[projectKey];
  if (!data) return null;

  const activeCost = customCost && customCost > 0 ? customCost : data.typicalCost;
  const estimatedReturn = Math.round(activeCost * (data.recoupPercent / 100));

  return (
    <Card className="border border-[var(--border)] bg-[var(--card-bg)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
          Resale Valuation ROI
        </span>
        <span className="text-[9px] text-[var(--fg-muted)]">
          Source: Zonda CVV Report
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-2 border-[var(--border)] bg-[var(--bg-muted)]">
          <div className="text-center">
            <span className="text-sm font-black text-[var(--fg)] tabular-nums">{data.recoupPercent.toFixed(0)}%</span>
            <span className="block text-[8px] text-[var(--fg-muted)] leading-none uppercase">Recoup</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-[var(--fg)] truncate">
            {data.projectType}
          </h4>
          <div className="mt-1 flex flex-col">
            <span className="text-xs text-[var(--fg-muted)]">
              Estimated Value Added:
            </span>
            <span className="text-lg font-black text-[var(--fg)] tabular-nums">
              ${estimatedReturn.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--bg-inset)] h-1.5 rounded-full overflow-hidden border border-[var(--border)]">
        <div
          className="bg-[var(--accent)] h-full transition-all duration-500"
          style={{ width: `${data.recoupPercent}%` }}
        />
      </div>

      <p className="text-[10px] text-[var(--fg-muted)] leading-normal mt-0.5">
        ROI calculation matches a national midrange cost average. Actual return depends on local market conditions and finish quality.
      </p>

      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[9px] text-[var(--fg-muted)]">
        <span>Cost vs. Value © Zonda Media</span>
        <a
          href="https://www.costvsvalue.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline font-semibold"
        >
          View Local Reports
        </a>
      </div>
    </Card>
  );
}

export default withI18n(CostVsValueWidget);
