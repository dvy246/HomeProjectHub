import { useState } from "react";
import { saveBudgetPlan, PROJECT_TYPES, type BudgetPlan } from "../../lib/budgetEngine";

export default function BudgetPlanNew() {
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState("Custom");
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState<BudgetPlan | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a plan name.");
      return;
    }
    setError("");
    const plan = saveBudgetPlan({
      name: name.trim(),
      projectType,
      description: description.trim(),
      totalBudget: 0,
      items: [],
      status: "planning",
    });
    setSaved(plan);
  };

  if (saved) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2">Budget Plan Created</h2>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">{saved.name} is ready. Add line items to start tracking costs.</p>
        <div className="flex gap-3 justify-center">
          <a
            href={`/renovate/plans/view/?id=${saved.id}`}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all"
          >
            Add Line Items
          </a>
          <a
            href="/renovate/plans/"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:border-[var(--border-hover)] transition-all"
          >
            Back to Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 flex flex-col gap-5">
      {error && (
        <div className="text-sm text-red-500 bg-red-500/5 p-3 rounded-lg border border-red-500/20" role="alert">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium block mb-1.5" htmlFor="plan-name">Plan Name</label>
        <input
          id="plan-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 placeholder:text-[var(--fg-muted)]"
          placeholder="e.g. Kitchen Remodel Budget"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5" htmlFor="plan-type">Project Type</label>
        <select
          id="plan-type"
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 appearance-none cursor-pointer"
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5" htmlFor="plan-desc">Description (optional)</label>
        <textarea
          id="plan-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 placeholder:text-[var(--fg-muted)] resize-none"
          placeholder="What does this renovation cover?"
        />
      </div>

      <div className="pt-2 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--fg-muted)] mb-4 leading-relaxed">
          You will add material costs, labor, and other line items after creating the plan. Your budget data is stored locally in your browser.
        </p>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Budget Plan
        </button>
      </div>
    </form>
  );
}
