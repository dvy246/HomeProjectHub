export type ProjectType = "bathroom" | "kitchen" | "deck" | "flooring" | "roofing" | "fence" | "painting" | "tile" | "shed" | "patio" | "wall";
export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface DIYVsProInput {
  projectType: ProjectType;
  areaSqFt: number;
  materialCost: number;
  contractorQuote: number;
  hourlyValue: number;
  skillLevel: SkillLevel;
  toolCost: number;
  permitCost: number;
}

export interface CostBreakdown {
  materials: number;
  tools: number;
  laborValue: number;
  wasteCost: number;
  reworkContingency: number;
  permits: number;
}

export interface ProBreakdown {
  labor: number;
  materials: number;
  markup: number;
}

export interface DIYVsProOutput {
  diyCost: number;
  diyBreakdown: CostBreakdown;
  proCost: number;
  proBreakdown: ProBreakdown;
  savings: number;
  savingsPercent: number;
  hoursEstimate: number;
  costPerHourSaved: number;
  riskLevel: "low" | "medium" | "high";
}

const PROJECT_META: Record<ProjectType, {
  label: string;
  baseHours: number;
  hoursPer100SqFt: number;
  complexity: "low" | "medium" | "high";
  difficulty: "easy" | "medium" | "hard";
  typicalArea: number;
  proLaborRate: number;
}> = {
  bathroom: { label: "Bathroom Remodel", baseHours: 60, hoursPer100SqFt: 20, complexity: "high", difficulty: "hard", typicalArea: 100, proLaborRate: 75 },
  kitchen: { label: "Kitchen Remodel", baseHours: 100, hoursPer100SqFt: 30, complexity: "high", difficulty: "hard", typicalArea: 150, proLaborRate: 85 },
  deck: { label: "Deck Build", baseHours: 30, hoursPer100SqFt: 10, complexity: "medium", difficulty: "medium", typicalArea: 200, proLaborRate: 55 },
  flooring: { label: "Flooring Installation", baseHours: 12, hoursPer100SqFt: 4, complexity: "low", difficulty: "easy", typicalArea: 300, proLaborRate: 45 },
  roofing: { label: "Roof Replacement", baseHours: 24, hoursPer100SqFt: 8, complexity: "medium", difficulty: "hard", typicalArea: 200, proLaborRate: 65 },
  fence: { label: "Fence Installation", baseHours: 16, hoursPer100SqFt: 6, complexity: "low", difficulty: "easy", typicalArea: 150, proLaborRate: 50 },
  painting: { label: "Painting", baseHours: 6, hoursPer100SqFt: 2, complexity: "low", difficulty: "easy", typicalArea: 300, proLaborRate: 40 },
  tile: { label: "Tile Flooring", baseHours: 16, hoursPer100SqFt: 5, complexity: "low", difficulty: "medium", typicalArea: 200, proLaborRate: 50 },
  shed: { label: "Shed Construction", baseHours: 40, hoursPer100SqFt: 15, complexity: "medium", difficulty: "medium", typicalArea: 120, proLaborRate: 60 },
  patio: { label: "Patio / Walkway", baseHours: 20, hoursPer100SqFt: 6, complexity: "medium", difficulty: "medium", typicalArea: 200, proLaborRate: 55 },
  wall: { label: "Wall & Siding", baseHours: 16, hoursPer100SqFt: 5, complexity: "low", difficulty: "medium", typicalArea: 200, proLaborRate: 50 },
};

const SKILL_WASTE: Record<SkillLevel, { waste: number; rework: number }> = {
  beginner: { waste: 0.20, rework: 0.15 },
  intermediate: { waste: 0.10, rework: 0.08 },
  advanced: { waste: 0.05, rework: 0.03 },
};

const PRO_MARKUP_RATE = 0.25;
const RISK_THRESHOLDS = {
  low: 4,
  medium: 7,
};

function computeRisk(complexity: number, difficultyScore: number, skillScore: number): "low" | "medium" | "high" {
  const risk = complexity * difficultyScore * (1 + (1 - skillScore));
  if (risk <= RISK_THRESHOLDS.low) return "low";
  if (risk <= RISK_THRESHOLDS.medium) return "medium";
  return "high";
}

function difficultyToScore(difficulty: "easy" | "medium" | "hard"): number {
  return difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
}

function complexityToScore(complexity: "low" | "medium" | "high"): number {
  return complexity === "low" ? 1 : complexity === "medium" ? 2 : 3;
}

function skillToScore(skill: SkillLevel): number {
  return skill === "advanced" ? 1 : skill === "intermediate" ? 0.7 : 0.4;
}

export function computeDIYVsPro(input: DIYVsProInput): DIYVsProOutput {
  const meta = PROJECT_META[input.projectType];
  const skill = SKILL_WASTE[input.skillLevel];

  const areaFactor = Math.max(0.5, input.areaSqFt / meta.typicalArea);
  const hoursEstimate = Math.round(meta.baseHours + meta.hoursPer100SqFt * (input.areaSqFt / 100));

  const laborValue = hoursEstimate * input.hourlyValue;
  const wasteCost = input.materialCost * skill.waste;
  const reworkContingency = input.materialCost * skill.rework;

  const diyCost = input.materialCost + input.toolCost + laborValue + wasteCost + reworkContingency + input.permitCost;

  const proMaterials = input.materialCost * (1 + PRO_MARKUP_RATE);
  const proLabor = meta.proLaborRate * hoursEstimate;
  const proMarkup = (proMaterials + proLabor) * 0.1;
  const proCostFromComponents = proLabor + proMaterials + proMarkup;

  const proCost = input.contractorQuote > 0 ? input.contractorQuote : proCostFromComponents;

  const savings = proCost - diyCost;
  const savingsPercent = proCost > 0 ? Math.round((savings / proCost) * 100) : 0;

  const costPerHourSaved = savings > 0 && hoursEstimate > 0 ? 0 : hoursEstimate > 0 ? Math.abs(savings) / hoursEstimate : 0;

  const riskLevel = computeRisk(
    complexityToScore(meta.complexity),
    difficultyToScore(meta.difficulty),
    skillToScore(input.skillLevel)
  );

  return {
    diyCost: Math.round(diyCost),
    diyBreakdown: {
      materials: Math.round(input.materialCost),
      tools: Math.round(input.toolCost),
      laborValue: Math.round(laborValue),
      wasteCost: Math.round(wasteCost),
      reworkContingency: Math.round(reworkContingency),
      permits: Math.round(input.permitCost),
    },
    proCost: Math.round(proCost),
    proBreakdown: {
      labor: Math.round(proLabor),
      materials: Math.round(proMaterials),
      markup: Math.round(proMarkup),
    },
    savings: Math.round(savings),
    savingsPercent,
    hoursEstimate,
    costPerHourSaved: Math.round(costPerHourSaved * 100) / 100,
    riskLevel,
  };
}

export type Mistakes = "none" | "minor" | "major";

export interface SunkCostInput {
  projectType: ProjectType;
  materialCost: number;
  toolCost: number;
  permitCost: number;
  hoursInvested: number;
  progressPercent: number;
  mistakes: Mistakes;
  contractorQuoteToFinish: number;
  skillLevel: SkillLevel;
  hourlyValue: number;
}

export interface SunkCostOutput {
  totalInvested: number;
  sunkMaterials: number;
  timeValueInvested: number;
  costToFinishDIY: number;
  costToHireProFinish: number;
  totalIfContinueDIY: number;
  totalIfHireProNow: number;
  totalIfAbandon: number;
  bestPath: "continue_diy" | "hire_pro" | "neutral";
  savingsByHiringPro: number;
  originalDIYEstimate: number;
  hoursRemaining: number;
}

const MISTAKE_COST: Record<Mistakes, number> = {
  none: 0,
  minor: 0.10,
  major: 0.25,
};

export function computeSunkCost(input: SunkCostInput): SunkCostOutput {
  const meta = PROJECT_META[input.projectType];
  const skill = SKILL_WASTE[input.skillLevel];

  const progress = Math.max(0, Math.min(1, input.progressPercent / 100));
  const areaFactor = Math.max(0.5, meta.typicalArea > 0 ? 1 : 1);

  const totalHoursEstimate = Math.round(meta.baseHours + meta.hoursPer100SqFt * (areaFactor));
  const hoursRemaining = Math.max(0, Math.round(totalHoursEstimate * (1 - progress)));

  const timeValueInvested = input.hoursInvested * input.hourlyValue;
  const timeValueToFinish = hoursRemaining * input.hourlyValue;

  const sunkMaterials = input.materialCost * MISTAKE_COST[input.mistakes];
  const consumedMaterials = input.materialCost * progress * (1 - MISTAKE_COST[input.mistakes]);
  const materialsToFinishDIY = input.materialCost * (1 - progress) + sunkMaterials;

  const costToFinishDIY = materialsToFinishDIY + timeValueToFinish + (input.toolCost * (1 - progress));

  const remainingWorkPercent = 1 - progress;
  const proLaborRate = meta.proLaborRate;
  const proHours = Math.round(meta.baseHours * remainingWorkPercent + meta.hoursPer100SqFt * remainingWorkPercent);
  const proLaborFinish = proHours * proLaborRate;
  const proMaterialsFinish = (input.materialCost - consumedMaterials) * (1 + PRO_MARKUP_RATE);
  const proMarkupFinish = (proLaborFinish + proMaterialsFinish) * 0.1;

  const costToHireProFinish = input.contractorQuoteToFinish > 0
    ? input.contractorQuoteToFinish
    : Math.round(proLaborFinish + proMaterialsFinish + proMarkupFinish);

  const totalInvested = input.materialCost * progress + input.toolCost * progress + input.permitCost * progress + timeValueInvested;

  const totalIfContinueDIY = totalInvested + costToFinishDIY + sunkMaterials;

  const totalIfHireProNow = totalInvested + costToHireProFinish;

  const totalIfAbandon = totalInvested;

  const savingsByHiringPro = costToFinishDIY - costToHireProFinish;

  const originalDIYEstimate = Math.round(
    input.materialCost + input.toolCost + input.permitCost + totalHoursEstimate * input.hourlyValue
  );

  const diff = costToFinishDIY - costToHireProFinish;
  const threshold = originalDIYEstimate * 0.05;
  const bestPath = diff > threshold ? "hire_pro" : diff < -threshold ? "continue_diy" : "neutral";

  return {
    totalInvested: Math.round(totalInvested),
    sunkMaterials: Math.round(sunkMaterials),
    timeValueInvested: Math.round(timeValueInvested),
    costToFinishDIY: Math.round(costToFinishDIY),
    costToHireProFinish: Math.round(costToHireProFinish),
    totalIfContinueDIY: Math.round(totalIfContinueDIY),
    totalIfHireProNow: Math.round(totalIfHireProNow),
    totalIfAbandon: Math.round(totalIfAbandon),
    bestPath,
    savingsByHiringPro: Math.round(savingsByHiringPro),
    originalDIYEstimate,
    hoursRemaining,
  };
}

export function getProjectLabel(type: ProjectType): string {
  return PROJECT_META[type].label;
}

export const PROJECT_TYPES: ProjectType[] = Object.keys(PROJECT_META) as ProjectType[];
