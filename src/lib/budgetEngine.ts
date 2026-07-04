export interface BudgetLineItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalBudget: number;
  actualCost: number | null;
  notes: string;
  calculatorSlug?: string;
}

export interface BudgetPlan {
  id: string;
  name: string;
  projectType: string;
  description: string;
  totalBudget: number;
  items: BudgetLineItem[];
  createdAt: number;
  updatedAt: number;
  status: "planning" | "in_progress" | "complete";
}

const STORAGE_KEY = "homeplanninghub_budget_plans";

export function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
}

export function getBudgetPlans(): BudgetPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getBudgetPlan(id: string): BudgetPlan | undefined {
  return getBudgetPlans().find((p) => p.id === id);
}

export function saveBudgetPlan(plan: Omit<BudgetPlan, "id" | "createdAt" | "updatedAt"> & { id?: string }): BudgetPlan {
  const plans = getBudgetPlans();
  const existing = plan.id ? plans.find((p) => p.id === plan.id) : undefined;

  const updatedPlan: BudgetPlan = {
    id: plan.id || generateId(),
    name: plan.name,
    projectType: plan.projectType,
    description: plan.description,
    totalBudget: plan.totalBudget,
    items: plan.items || [],
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
    status: plan.status || "planning",
  };

  const idx = plans.findIndex((p) => p.id === updatedPlan.id);
  if (idx > -1) {
    plans[idx] = updatedPlan;
  } else {
    plans.push(updatedPlan);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    window.dispatchEvent(new Event("budget-plans-changed"));
  } catch {}

  return updatedPlan;
}

export function deleteBudgetPlan(id: string): void {
  const plans = getBudgetPlans().filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    window.dispatchEvent(new Event("budget-plans-changed"));
  } catch {}
}

export function addItemToPlan(planId: string, item: Omit<BudgetLineItem, "id">): BudgetPlan | null {
  const plan = getBudgetPlan(planId);
  if (!plan) return null;

  const newItem: BudgetLineItem = {
    ...item,
    id: generateId(),
  };

  plan.items.push(newItem);
  plan.totalBudget = plan.items.reduce((sum, i) => sum + i.totalBudget, 0);
  plan.updatedAt = Date.now();

  return saveBudgetPlan(plan);
}

export function updateItemInPlan(planId: string, itemId: string, updates: Partial<BudgetLineItem>): BudgetPlan | null {
  const plan = getBudgetPlan(planId);
  if (!plan) return null;

  const idx = plan.items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;

  plan.items[idx] = { ...plan.items[idx], ...updates };
  plan.totalBudget = plan.items.reduce((sum, i) => sum + i.totalBudget, 0);
  plan.updatedAt = Date.now();

  return saveBudgetPlan(plan);
}

export function deleteItemFromPlan(planId: string, itemId: string): BudgetPlan | null {
  const plan = getBudgetPlan(planId);
  if (!plan) return null;

  plan.items = plan.items.filter((i) => i.id !== itemId);
  plan.totalBudget = plan.items.reduce((sum, i) => sum + i.totalBudget, 0);
  plan.updatedAt = Date.now();

  return saveBudgetPlan(plan);
}

export const BUDGET_CATEGORIES = [
  "Concrete & Masonry",
  "Lumber & Framing",
  "Roofing",
  "Siding & Trim",
  "Flooring",
  "Paint & Finishes",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Insulation",
  "Drywall & Ceilings",
  "Doors & Windows",
  "Cabinets & Countertops",
  "Fixtures & Hardware",
  "Landscaping",
  "Tools & Equipment",
  "Permits & Fees",
  "Labor",
  "Miscellaneous",
] as const;

export const PROJECT_TYPES = [
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Basement Finish",
  "Deck Build",
  "Patio/Porch",
  "Roof Replacement",
  "Siding Replacement",
  "Flooring Installation",
  "Fence Installation",
  "Room Addition",
  "Whole House Renovation",
  "Landscaping",
  "Driveway/Paving",
  "Custom",
] as const;
