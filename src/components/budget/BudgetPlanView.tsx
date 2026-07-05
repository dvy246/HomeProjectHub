import { useState, useEffect } from "react";
import { getBudgetPlan, saveBudgetPlan, addItemToPlan, updateItemInPlan, deleteItemFromPlan, BUDGET_CATEGORIES, type BudgetPlan, type BudgetLineItem } from "../../lib/budgetEngine";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function BudgetPlanView() {
  const { t } = useI18n();
  const [plan, setPlan] = useState<BudgetPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Form state
  const [itemCategory, setItemCategory] = useState<string>(BUDGET_CATEGORIES[0]);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemUnit, setItemUnit] = useState("each");
  const [itemUnitPrice, setItemUnitPrice] = useState("");
  const [itemActual, setItemActual] = useState("");
  const [itemNotes, setItemNotes] = useState("");

  // Plan-level state
  const [editingPlan, setEditingPlan] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [planStatus, setPlanStatus] = useState<BudgetPlan["status"]>("planning");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const p = getBudgetPlan(id);
      setPlan(p || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        setPlan(getBudgetPlan(id) || null);
      }
    };
    window.addEventListener("budget-plans-changed", handler);
    return () => window.removeEventListener("budget-plans-changed", handler);
  }, []);

  const resetForm = () => {
    setItemCategory(BUDGET_CATEGORIES[0]);
    setItemName("");
    setItemQty("1");
    setItemUnit("each");
    setItemUnitPrice("");
    setItemActual("");
    setItemNotes("");
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !itemName.trim() || !itemUnitPrice) return;

    const qty = parseFloat(itemQty) || 1;
    const unitPrice = parseFloat(itemUnitPrice) || 0;
    const totalBudget = qty * unitPrice;

    if (editingItem) {
      updateItemInPlan(plan.id, editingItem, {
        category: itemCategory,
        name: itemName.trim(),
        quantity: qty,
        unit: itemUnit,
        unitPrice,
        totalBudget,
        actualCost: itemActual ? parseFloat(itemActual) : null,
        notes: itemNotes.trim(),
      });
    } else {
      addItemToPlan(plan.id, {
        category: itemCategory,
        name: itemName.trim(),
        quantity: qty,
        unit: itemUnit,
        unitPrice,
        totalBudget,
        actualCost: itemActual ? parseFloat(itemActual) : null,
        notes: itemNotes.trim(),
      });
    }

    resetForm();
  };

  const handleEditItem = (item: BudgetLineItem) => {
    setEditingItem(item.id);
    setItemCategory(item.category);
    setItemName(item.name);
    setItemQty(item.quantity.toString());
    setItemUnit(item.unit);
    setItemUnitPrice(item.unitPrice.toString());
    setItemActual(item.actualCost?.toString() || "");
    setItemNotes(item.notes);
    setShowAddForm(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!plan) return;
    if (!confirm(t('budget.confirm_remove_item') ?? "Remove this line item?")) return;
    deleteItemFromPlan(plan.id, itemId);
  };

  const handleSavePlanDetails = () => {
    if (!plan || !planName.trim()) return;
    saveBudgetPlan({
      id: plan.id,
      name: planName.trim(),
      projectType: plan.projectType,
      description: planDesc.trim(),
      totalBudget: plan.totalBudget,
      items: plan.items,
      status: planStatus,
    });
    setEditingPlan(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-sm text-[var(--fg-muted)]">{t('common.loading') ?? 'Loading...'}</div>;
  }

  if (!plan) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--bg-muted)] flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('budget.plan_not_found') ?? 'Plan Not Found'}</h3>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">{t('budget.plan_not_found_desc') ?? 'This budget plan could not be found or the URL is invalid.'}</p>
        <a href="/renovate/plans/" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-all">{t('budget.back_to_plans') ?? 'Back to Budget Plans'}</a>
      </div>
    );
  }

  const totalActual = plan.items.reduce((sum, i) => sum + (i.actualCost ?? 0), 0);
  const totalBudget = plan.totalBudget;
  const pctUsed = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
  const isOver = totalActual > totalBudget;
  const remaining = totalBudget - totalActual;

  return (
    <div className="flex flex-col gap-5">
      {/* Plan Header */}
      {editingPlan ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" htmlFor="edit-plan-name">{t('budget.plan_name') ?? 'Plan Name'}</label>
            <input id="edit-plan-name" type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" htmlFor="edit-plan-desc">{t('budget.description') ?? 'Description'}</label>
            <textarea id="edit-plan-desc" value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} rows={2} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" htmlFor="edit-plan-status">{t('budget.status') ?? 'Status'}</label>
            <select id="edit-plan-status" value={planStatus} onChange={(e) => setPlanStatus(e.target.value as BudgetPlan["status"])} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] appearance-none cursor-pointer">
              <option value="planning">{t('budget.status_planning') ?? 'Planning'}</option>
              <option value="in_progress">{t('budget.status_in_progress') ?? 'In Progress'}</option>
              <option value="complete">{t('budget.status_complete') ?? 'Complete'}</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleSavePlanDetails} className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-all">{t('common.save') ?? 'Save'}</button>
            <button type="button" onClick={() => setEditingPlan(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:border-[var(--border-hover)] transition-all">{t('common.cancel') ?? 'Cancel'}</button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--fg)]">{plan.name}</h2>
              <p className="text-xs text-[var(--fg-muted)]">{plan.projectType}{plan.description ? ` — ${plan.description}` : ""}</p>
            </div>
            <button
              type="button"
              onClick={() => { setEditingPlan(true); setPlanName(plan.name); setPlanDesc(plan.description); setPlanStatus(plan.status); }}
              className="p-1.5 rounded-md hover:bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
              aria-label={t('budget.edit_plan_aria') ?? 'Edit plan details'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="bg-[var(--bg-subtle)] rounded-lg p-3">
              <p className="text-[11px] text-[var(--fg-muted)] uppercase tracking-wider font-medium">{t('budget.total_budget') ?? 'Total Budget'}</p>
              <p className="text-xl font-bold text-[var(--fg)] mt-1">${totalBudget.toLocaleString()}</p>
            </div>
            <div className="bg-[var(--bg-subtle)] rounded-lg p-3">
              <p className="text-[11px] text-[var(--fg-muted)] uppercase tracking-wider font-medium">{t('budget.spent') ?? 'Spent'}</p>
              <p className={`text-xl font-bold mt-1 ${isOver ? "text-red-500" : "text-[var(--fg)]"}`}>${totalActual.toLocaleString()}</p>
            </div>
            <div className="bg-[var(--bg-subtle)] rounded-lg p-3">
              <p className="text-[11px] text-[var(--fg-muted)] uppercase tracking-wider font-medium">{t('budget.remaining') ?? 'Remaining'}</p>
              <p className={`text-xl font-bold mt-1 ${isOver ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                {isOver ? `-$${Math.abs(remaining).toLocaleString()}` : `$${remaining.toLocaleString()}`}
              </p>
            </div>
          </div>

          <div className="w-full h-2.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-[var(--accent)]"}`} style={{ width: `${Math.min(pctUsed, 100)}%` }} />
          </div>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">{t('budget.percent_used')?.replace('{pct}', String(pctUsed)) ?? `${pctUsed}% of budget used`} &middot; {t('budget.line_items_count')?.replace('{count}', String(plan.items.length)) ?? `${plan.items.length} line item${plan.items.length !== 1 ? "s" : ""}`}</p>
        </div>
      )}

      {/* Line Items */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--fg)]">{t('budget.line_items') ?? 'Line Items'}</h3>
        <button
          type="button"
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('budget.add_item') ?? 'Add Item'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddItem} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-medium block mb-1" htmlFor="item-category">{t('budget.category') ?? 'Category'}</label>
              <select id="item-category" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none appearance-none cursor-pointer">
                {BUDGET_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
                <label className="text-xs font-medium block mb-1" htmlFor="item-name">{t('budget.item_name') ?? 'Item Name'}</label>
              <input id="item-name" type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none" placeholder={t('common.placeholder')?.replace('{value}', '80lb Concrete Bags') ?? "e.g. 80lb Concrete Bags"} />
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div>
                <label className="text-xs font-medium block mb-1" htmlFor="item-qty">{t('budget.quantity') ?? 'Quantity'}</label>
              <input id="item-qty" type="number" step="any" min="0" value={itemQty} onChange={(e) => setItemQty(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" htmlFor="item-unit">{t('budget.unit') ?? 'Unit'}</label>
              <select id="item-unit" value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none appearance-none cursor-pointer">
                <option value="each">{t('budget.unit_each') ?? 'Each'}</option>
                <option value="sq ft">{t('units.sq_ft') ?? 'Sq Ft'}</option>
                <option value="cu yd">{t('units.cu_yd') ?? 'Cu Yd'}</option>
                <option value="linear ft">{t('units.linear_ft') ?? 'Linear Ft'}</option>
                <option value="gal">{t('units.gallons') ?? 'Gallon'}</option>
                <option value="lb">{t('units.lbs') ?? 'Pound'}</option>
                <option value="hr">{t('budget.unit_hour') ?? 'Hour'}</option>
                <option value="lump sum">{t('budget.unit_lump_sum') ?? 'Lump Sum'}</option>
              </select>
            </div>
            <div>
                <label className="text-xs font-medium block mb-1" htmlFor="item-price">{t('budget.unit_price') ?? 'Unit Price ($)'}</label>
              <input id="item-price" type="number" step="0.01" min="0" value={itemUnitPrice} onChange={(e) => setItemUnitPrice(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" htmlFor="item-actual">{t('budget.actual_cost') ?? 'Actual Cost ($)'}</label>
              <input id="item-actual" type="number" step="0.01" min="0" value={itemActual} onChange={(e) => setItemActual(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none" placeholder={t('budget.optional') ?? 'Optional'} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" htmlFor="item-notes">{t('budget.notes') ?? 'Notes'}</label>
            <input id="item-notes" type="text" value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none" placeholder={t('budget.notes_placeholder') ?? 'Optional notes or supplier name'} />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--fg-muted)]">
              {itemQty && itemUnitPrice ? `${t('budget.budget') ?? 'Budget'}: $${(parseFloat(itemQty || "0") * parseFloat(itemUnitPrice || "0")).toFixed(2)}` : ""}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:border-[var(--border-hover)] transition-all">{t('common.cancel') ?? 'Cancel'}</button>
              <button type="submit" className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-all" disabled={!itemName.trim() || !itemUnitPrice}>
                {editingItem ? (t('budget.update_item') ?? "Update") : (t('budget.add_item') ?? "Add")} {t('budget.item_suffix') ?? 'Item'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Items List */}
      {plan.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-sm text-[var(--fg-muted)]">{t('budget.no_items') ?? 'No line items yet. Add materials, labor, and other costs to build your budget.'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {plan.items.map((item) => {
            const actual = item.actualCost ?? 0;
            const overItem = actual > item.totalBudget;
            return (
              <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">{item.category}</span>
                    <h4 className="text-sm font-semibold text-[var(--fg)]">{item.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleEditItem(item)} className="p-1 rounded hover:bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors" aria-label={t('budget.edit_item_aria') ?? 'Edit item'}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => handleDeleteItem(item.id)} className="p-1 rounded hover:bg-red-500/10 text-[var(--fg-muted)] hover:text-red-500 transition-colors" aria-label={t('budget.delete_item_aria') ?? 'Delete item'}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--fg-muted)]">{t('budget.qty') ?? 'Qty:'}</span> {item.quantity} {item.unit}
                  </div>
                  <div>
                    <span className="text-[var(--fg-muted)]">@</span> ${item.unitPrice.toFixed(2)}
                  </div>
                  <div>
                    <span className="text-[var(--fg-muted)]">{t('budget.budget_label') ?? 'Budget:'}</span> ${item.totalBudget.toFixed(2)}
                  </div>
                  <div>
                    <span className="text-[var(--fg-muted)]">{t('budget.actual_label') ?? 'Actual:'}</span>
                    <span className={overItem ? "text-red-500 font-semibold" : ""}>
                      ${actual.toFixed(2)}
                    </span>
                  </div>
                </div>
                {item.notes && <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">{item.notes}</p>}
                {actual > 0 && (
                  <div className="mt-2 w-full h-1 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${overItem ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.min((actual / item.totalBudget) * 100, 100)}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default withI18n(BudgetPlanView);
