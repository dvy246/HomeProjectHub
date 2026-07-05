import { useState, useEffect } from "react";
import { getBudgetPlans, deleteBudgetPlan, type BudgetPlan } from "../../lib/budgetEngine";
import { useI18n } from "../i18n/I18nProvider";

export default function BudgetDashboard() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<BudgetPlan[]>([]);

  useEffect(() => {
    setPlans(getBudgetPlans());
    const handler = () => setPlans(getBudgetPlans());
    window.addEventListener("budget-plans-changed", handler);
    return () => window.removeEventListener("budget-plans-changed", handler);
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(t('budget.confirm_delete')?.replace('{name}', name) ?? `Delete "${name}"? This cannot be undone.`)) return;
    deleteBudgetPlan(id);
  };

  const getStatusBadge = (status: BudgetPlan["status"]) => {
    const styles = {
      planning: "bg-[var(--bg-muted)] text-[var(--fg-secondary)]",
      in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      complete: "bg-green-500/10 text-green-600 dark:text-green-400",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${styles[status]}`}>
        {t(`budget.status_${status}`) ?? (status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1))}
      </span>
    );
  };

  const getTotalActual = (plan: BudgetPlan): number => {
    return plan.items.reduce((sum, i) => sum + (i.actualCost ?? 0), 0);
  };

  if (plans.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--bg-muted)] flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('budget.no_plans') ?? 'No Budget Plans Yet'}</h3>
        <p className="text-sm text-[var(--fg-secondary)] mb-6 max-w-sm mx-auto">
          {t('budget.no_plans_desc') ?? 'Create a renovation budget plan to track your project costs. Add your own material and labor prices to stay on budget.'}
        </p>
        <a
          href="/renovate/plans/new/"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('budget.create_plan') ?? 'Create Budget Plan'}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--fg-secondary)]">{t('budget.plan_count')?.replace('{count}', String(plans.length)) ?? `${plans.length} budget plan${plans.length !== 1 ? "s" : ""}`}</p>
        <a
          href="/renovate/plans/new/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('budget.new_plan') ?? 'New Plan'}
        </a>
      </div>

      <div className="flex flex-col gap-3">
        {plans.map((plan) => {
          const totalActual = getTotalActual(plan);
          const pctUsed = plan.totalBudget > 0 ? Math.round((totalActual / plan.totalBudget) * 100) : 0;
          const isOver = totalActual > plan.totalBudget;

          return (
            <a
              key={plan.id}
              href={`/renovate/plans/view/?id=${plan.id}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 hover:border-[var(--border-hover)] transition-all block"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--fg)]">{plan.name}</h3>
                  <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">{plan.projectType} &middot; {plan.items.length} {t('budget.line_items') ?? 'line items'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(plan.status)}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(plan.id, plan.name);
                    }}
                    className="p-1 rounded-md hover:bg-red-500/10 text-[var(--fg-muted)] hover:text-red-500 transition-colors"
                    aria-label={t('budget.delete_aria')?.replace('{name}', plan.name) ?? `Delete ${plan.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-[11px] text-[var(--fg-muted)]">{t('budget.budget') ?? 'Budget'}</p>
                  <p className="text-sm font-semibold text-[var(--fg)]">${plan.totalBudget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--fg-muted)]">{t('budget.spent') ?? 'Spent'}</p>
                  <p className={`text-sm font-semibold ${isOver ? "text-red-500" : "text-[var(--fg)]"}`}>
                    ${totalActual.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--fg-muted)]">{t('budget.remaining') ?? 'Remaining'}</p>
                  <p className={`text-sm font-semibold ${isOver ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                    ${isOver ? (t('budget.over_budget') ?? "Over budget") : (plan.totalBudget - totalActual).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-[var(--accent)]"}`}
                  style={{ width: `${Math.min(pctUsed, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">{t('budget.percent_used')?.replace('{pct}', String(pctUsed)) ?? `${pctUsed}% of budget used`}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
