import { useState, useEffect } from "react";
import { getProject, updateProject, saveProject, type SavedProject, type MaterialItem, type ProjectCalculation } from "../../lib/projectEngine";
import workflowsData from "../../data/workflows.json";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

// Dynamic Calculator Import Mapping
import ConcreteSlabCalc from "../calculators/ConcreteSlabCalc";
import AggregateCalc from "../calculators/AggregateCalc";
import RebarCalc from "../calculators/RebarCalc";
import FramingCalc from "../calculators/FramingCalc";
import RoofShingleCalc from "../calculators/RoofShingleCalc";
import RoofPitchCalc from "../calculators/RoofPitchCalc";
import PlywoodDeckCalc from "../calculators/PlywoodDeckCalc";
import BlockFillCalc from "../calculators/BlockFillCalc";
import BoardBattenCalc from "../calculators/BoardBattenCalc";
import BoardFootCalc from "../calculators/BoardFootCalc";
import BrickCalc from "../calculators/BrickCalc";
import ConcreteColumnCalc from "../calculators/ConcreteColumnCalc";
import ConcreteFootingCalc from "../calculators/ConcreteFootingCalc";
import ConcreteStepsCalc from "../calculators/ConcreteStepsCalc";
import ConcreteTubeCalc from "../calculators/ConcreteTubeCalc";
import ConcreteWallCalc from "../calculators/ConcreteWallCalc";
import CubicYardCalc from "../calculators/CubicYardCalc";
import CurbGutterCalc from "../calculators/CurbGutterCalc";
import DeckingCalc from "../calculators/DeckingCalc";
import DrywallCalc from "../calculators/DrywallCalc";
import FireGlassCalc from "../calculators/FireGlassCalc";
import FrenchDrainCalc from "../calculators/FrenchDrainCalc";
import GallonsPerSqFtCalc from "../calculators/GallonsPerSqFtCalc";
import IceWaterShieldCalc from "../calculators/IceWaterShieldCalc";
import LogWeightCalc from "../calculators/LogWeightCalc";
import LumberCalc from "../calculators/LumberCalc";
import MetalRoofCalc from "../calculators/MetalRoofCalc";
import MixRatioCalc from "../calculators/MixRatioCalc";
import MulchCalc from "../calculators/MulchCalc";
import PaintCalc from "../calculators/PaintCalc";
import PipeWeightCalc from "../calculators/PipeWeightCalc";
import RetainingWallCalc from "../calculators/RetainingWallCalc";
import SealantCalc from "../calculators/SealantCalc";
import ShedCostCalc from "../calculators/ShedCostCalc";
import SizeToWeightCalc from "../calculators/SizeToWeightCalc";
import SnowLoadCalc from "../calculators/SnowLoadCalc";
import SonotubeCalc from "../calculators/SonotubeCalc";
import SpacingCalc from "../calculators/SpacingCalc";
import SpiralStaircaseCalc from "../calculators/SpiralStaircaseCalc";
import SquareFootageCalc from "../calculators/SquareFootageCalc";
import SquareYardsCalc from "../calculators/SquareYardsCalc";
import SqFtToCuYdCalc from "../calculators/SqFtToCuYdCalc";
import StoneWeightCalc from "../calculators/StoneWeightCalc";
import TileCalc from "../calculators/TileCalc";
import TonnageCalc from "../calculators/TonnageCalc";
import VinylFenceCalc from "../calculators/VinylFenceCalc";
import VinylSidingCalc from "../calculators/VinylSidingCalc";
import WeightCalc from "../calculators/WeightCalc";

import PatioCostCalc from "../calculators/renovation/PatioCostCalc";
import DeckCostCalc from "../calculators/renovation/DeckCostCalc";
import FenceCostCalc from "../calculators/renovation/FenceCostCalc";
import FlooringCostCalc from "../calculators/renovation/FlooringCostCalc";
import BasementFinishingCalc from "../calculators/renovation/BasementFinishingCalc";
import BathroomRenovationCalc from "../calculators/renovation/BathroomRenovationCalc";
import KitchenRenovationCalc from "../calculators/renovation/KitchenRenovationCalc";
import GarageRemodelCalc from "../calculators/renovation/GarageRemodelCalc";

const CALCULATOR_COMPONENTS: Record<string, React.ComponentType<any>> = {
  "concrete-slab": ConcreteSlabCalc,
  "gravel": (props: any) => (
    <AggregateCalc
      {...props}
      defaultKey="gravel"
      aggregates={[
        { id: "gravel", label: "Pea Gravel", tonsPerCuYd: 1.4 },
        { id: "crushed-stone", label: "Crushed Stone", tonsPerCuYd: 1.35 },
        { id: "sand", label: "Sand", tonsPerCuYd: 1.2 }
      ]}
    />
  ),
  "rebar": RebarCalc,
  "framing": FramingCalc,
  "roofing-shingles": RoofShingleCalc,
  "roof-pitch": RoofPitchCalc,
  "plywood": PlywoodDeckCalc,
  "block-fill": BlockFillCalc,
  "board-batten": BoardBattenCalc,
  "board-foot": BoardFootCalc,
  "brick": BrickCalc,
  "concrete-column": ConcreteColumnCalc,
  "concrete-footing": ConcreteFootingCalc,
  "concrete-steps": ConcreteStepsCalc,
  "concrete-tube": ConcreteTubeCalc,
  "concrete-wall": ConcreteWallCalc,
  "cubic-yard": CubicYardCalc,
  "curb-gutter": CurbGutterCalc,
  "decking": DeckingCalc,
  "drywall": DrywallCalc,
  "fire-glass": FireGlassCalc,
  "french-drain": FrenchDrainCalc,
  "gallons-per-sq-ft": GallonsPerSqFtCalc,
  "ice-water-shield": IceWaterShieldCalc,
  "log-weight": LogWeightCalc,
  "lumber": LumberCalc,
  "metal-roof": MetalRoofCalc,
  "mix-ratio": MixRatioCalc,
  "mulch": MulchCalc,
  "paint": PaintCalc,
  "pipe-weight": PipeWeightCalc,
  "retaining-wall": RetainingWallCalc,
  "sealant": SealantCalc,
  "shed-cost": ShedCostCalc,
  "size-to-weight": SizeToWeightCalc,
  "snow-load": SnowLoadCalc,
  "sonotube": SonotubeCalc,
  "baluster": (props: any) => <SpacingCalc {...props} labelSingular="baluster" labelPlural="balusters" defaultSpacing="4" defaultThickness="1.5" calculatorSlug="baluster" calculatorName="Baluster Spacing Calculator" />,
  "spindle-spacing": (props: any) => <SpacingCalc {...props} labelSingular="spindle" labelPlural="spindles" defaultSpacing="4" defaultThickness="1.5" calculatorSlug="spindle-spacing" calculatorName="Spindle Spacing Calculator" />,
  "spiral-staircase": SpiralStaircaseCalc,
  "square-footage": SquareFootageCalc,
  "square-yards": SquareYardsCalc,
  "sq-ft-to-cu-yard": SqFtToCuYdCalc,
  "stone-weight": StoneWeightCalc,
  "tile": TileCalc,
  "tonnage": TonnageCalc,
  "vinyl-fence": VinylFenceCalc,
  "vinyl-siding": VinylSidingCalc,
  "weight": (props: any) => <WeightCalc {...props} materials={[]} />,
  "patio-cost": PatioCostCalc,
  "deck-cost": DeckCostCalc,
  "fence-cost": FenceCostCalc,
  "flooring-cost": FlooringCostCalc,
  "basement-finishing": BasementFinishingCalc,
  "bathroom-renovation": BathroomRenovationCalc,
  "kitchen-renovation": KitchenRenovationCalc,
  "garage-remodel": GarageRemodelCalc
};

interface ProjectWorkflowProps {
  workflowId: string;
  projectId?: string;
  onBack?: () => void;
}

// Estimate baseline contractor labor hours by project type
const BASELINE_LABOR_HOURS: Record<string, { hours: number; baseRate: number }> = {
  patio: { hours: 24, baseRate: 55 },
  shed: { hours: 48, baseRate: 60 },
  roofing: { hours: 40, baseRate: 65 }
};

function ProjectWorkflow({ workflowId, projectId, onBack }: ProjectWorkflowProps) {
  const { t } = useI18n();
  const workflow = workflowsData.find((w) => w.id === workflowId);
  const [project, setProject] = useState<SavedProject | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [dimensions, setDimensions] = useState({
    name: "",
    length: "10",
    width: "10",
    depth: "4"
  });

  // Staged budget state inputs
  const [laborMultiplier, setLaborMultiplier] = useState<number>(1.0); // Medium Cost of Living
  const [contingencyRate, setContingencyRate] = useState<number>(0.15); // 15% contingency

  // Contractor comparison worksheet rows
  const [contractorRows, setContractorRows] = useState([
    { name: "", amount: "", license: false, references: false },
    { name: "", amount: "", license: false, references: false },
    { name: "", amount: "", license: false, references: false }
  ]);

  // Project punch list states
  const [punchList, setPunchList] = useState([
    { task: "Double check form boundary angles (3-4-5 rule)", done: false },
    { task: "Clean and rinse mixers and concrete hand tools", done: false },
    { task: "Apply joint sealant to prevent moisture cracking", done: false },
    { task: "Restore surrounding soil and landscaping slope", done: false }
  ]);

  // Track temporary calculation outputs from active step calculator
  const [tempCalculation, setTempCalculation] = useState<{
    inputs: Record<string, any>;
    results: Record<string, any>;
    materials: MaterialItem[];
  } | null>(null);

  // Load project on mount
  useEffect(() => {
    if (!workflow) return;

    let proj: SavedProject | null = null;
    if (projectId) {
      proj = getProject(projectId);
    }

    if (proj) {
      setProject(proj);
      setDimensions({
        name: proj.name,
        length: proj.sharedDimensions.length?.toString() || "10",
        width: proj.sharedDimensions.width?.toString() || "10",
        depth: proj.sharedDimensions.depth?.toString() || "4"
      });
      // Start at first calculator step
      setCurrentStepIndex(1);
    } else {
      // Setup default new project settings
      setDimensions({
        name: `My New ${workflow.name}`,
        length: "10",
        width: "10",
        depth: "4"
      });
      setCurrentStepIndex(0); // Setup dimensions step
    }
  }, [workflow, projectId]);

  if (!workflow) {
    return (
      <Card>
        <p className="text-sm text-[var(--fg-secondary)]">Workflow not found.</p>
        {onBack && <button type="button" onClick={onBack} className="text-xs text-[var(--accent)] font-medium underline mt-2 block">Go Back</button>}
      </Card>
    );
  }

  // Handle Dimensions step submit
  const handleSetupProject = () => {
    const l = parseFloat(dimensions.length) || 10;
    const w = parseFloat(dimensions.width) || 10;
    const d = parseFloat(dimensions.depth) || 4;

    const newProj = saveProject({
      name: dimensions.name.trim() || `My ${workflow.name}`,
      projectType: workflow.id as any,
      status: "planning",
      sharedDimensions: {
        length: l,
        width: w,
        depth: d,
        unitSystem: "imperial"
      },
      calculations: []
    });

    setProject(newProj);
    setCurrentStepIndex(1); // Proceed to first calculator
  };

  const handleStepCalculate = (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => {
    setTempCalculation({ inputs, results, materials });
  };

  const handleSaveStep = () => {
    if (!project || !tempCalculation) return;

    const currentStep = workflow.steps[currentStepIndex - 1];
    const newCalc: ProjectCalculation = {
      calculatorSlug: currentStep.calculatorId,
      calculatorName: currentStep.name,
      inputs: tempCalculation.inputs,
      results: tempCalculation.results,
      materials: tempCalculation.materials,
      completedAt: Date.now()
    };

    // Filter out previous calculation for this calculator to avoid duplicate lines
    const remainingCalcs = project.calculations.filter(c => c.calculatorSlug !== currentStep.calculatorId);

    const updated = updateProject(project.id, {
      calculations: [...remainingCalcs, newCalc],
      status: currentStepIndex === workflow.steps.length ? "complete" : "calculating"
    });

    if (updated) {
      setProject(updated);
    }
  };

  const handleNext = () => {
    handleSaveStep();
    setCurrentStepIndex((prev) => prev + 1);
    setTempCalculation(null);
  };

  const handleBack = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    setTempCalculation(null);
  };

  // Aggregated materials list
  const getAggregatedMaterials = () => {
    if (!project) return [];
    const matMap = new Map<string, { quantity: number; unit: string; name: string }>();
    for (const c of project.calculations) {
      for (const m of c.materials) {
        const key = `${m.name.toLowerCase()}||${m.unit}`;
        const existing = matMap.get(key);
        if (existing) {
          existing.quantity += m.quantity;
        } else {
          matMap.set(key, { quantity: m.quantity, unit: m.unit, name: m.name });
        }
      }
    }
    return Array.from(matMap.values());
  };

  // Estimate material costs based on quantities
  const getMaterialCostsTotal = () => {
    const materials = getAggregatedMaterials();
    let total = 0;
    for (const m of materials) {
      const qty = m.quantity;
      const name = m.name.toLowerCase();
      if (name.includes("concrete")) total += qty * 8.5; // $8.50 per bag
      else if (name.includes("gravel") || name.includes("stone")) total += qty * 65; // $65 per ton
      else if (name.includes("rebar")) total += qty * 12; // $12 per piece
      else if (name.includes("stud") || name.includes("lumber")) total += qty * 4.5; // $4.50 per stud
      else if (name.includes("plywood") || name.includes("sheathing")) total += qty * 32; // $32 per sheet
      else if (name.includes("shingle")) total += qty * 45; // $45 per bundle
      else total += qty * 15; // Fallback
    }
    return total;
  };

  // Navigation Steps Definitions
  const totalSteps = workflow.steps.length + 2; // Setup + Calculators + Summary
  const isCalculatorStep = currentStepIndex > 0 && currentStepIndex <= workflow.steps.length;
  const isSummaryStep = currentStepIndex === workflow.steps.length + 1;

  const currentStepObject = isCalculatorStep ? workflow.steps[currentStepIndex - 1] : null;
  const CalculatorComponent = currentStepObject ? CALCULATOR_COMPONENTS[currentStepObject.calculatorId] : null;

  // Staged budget calculations
  const matCost = getMaterialCostsTotal();
  const laborBase = BASELINE_LABOR_HOURS[workflowId] || { hours: 20, baseRate: 50 };
  const estimatedLaborCost = laborBase.hours * laborBase.baseRate * laborMultiplier;
  const contingencyCost = (matCost + estimatedLaborCost) * contingencyRate;
  const totalProjectCost = matCost + estimatedLaborCost + contingencyCost;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Workflow Navigation Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 flex flex-col gap-4 no-print shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">{workflow.name}</span>
            <h2 className="text-lg font-bold text-[var(--fg)] mt-0.5">{project ? project.name : "Setup Project Dimensions"}</h2>
          </div>
          {onBack && (
            <button type="button" onClick={onBack} className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-muted)] font-medium">
              Back to List
            </button>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
            <span>Progress</span>
            <span className="font-semibold">{Math.round((currentStepIndex / (totalSteps - 1)) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${(currentStepIndex / (totalSteps - 1)) * 100}%` }} />
          </div>
        </div>

        {/* Steps Bubbles */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)] text-xs">
          <span className={`px-2.5 py-1.5 rounded-lg font-medium ${currentStepIndex === 0 ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20" : "bg-[var(--bg-muted)] text-[var(--fg-muted)]"}`}>
            1. Dimensions
          </span>
          {workflow.steps.map((st, i) => (
            <span key={st.id} className={`px-2.5 py-1.5 rounded-lg font-medium ${currentStepIndex === i + 1 ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20" : "bg-[var(--bg-muted)] text-[var(--fg-muted)]"}`}>
              {i + 2}. {st.name}
            </span>
          ))}
          <span className={`px-2.5 py-1.5 rounded-lg font-medium ${isSummaryStep ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20" : "bg-[var(--bg-muted)] text-[var(--fg-muted)]"}`}>
            {workflow.steps.length + 2}. Project Planner Binder
          </span>
        </div>
      </div>

      {/* Render Steps */}
      {currentStepIndex === 0 && (
        <Card className="flex flex-col gap-5 p-6 animate-fade-in-up">
          <div>
            <h3 className="text-base font-bold text-[var(--fg)]">Configure Project Dimensions</h3>
            <p className="text-xs text-[var(--fg-secondary)] mt-1">These parameters pre-fill all step calculators. You can tweak individual fields later inside each step.</p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Project Name"
              type="text"
              value={dimensions.name}
              onChange={(e) => setDimensions({ ...dimensions, name: e.target.value })}
              placeholder="e.g. My Patio Extension"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="Length (ft)"
                type="number"
                inputMode="decimal"
                value={dimensions.length}
                onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
              />
              <Input
                label="Width (ft)"
                type="number"
                inputMode="decimal"
                value={dimensions.width}
                onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
              />
              <Input
                label="Depth / Thickness (in)"
                type="number"
                inputMode="decimal"
                value={dimensions.depth}
                onChange={(e) => setDimensions({ ...dimensions, depth: e.target.value })}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSetupProject}
            className="w-full mt-2 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-sm"
          >
            Create Project & Start Workflow
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </Card>
      )}

      {/* Render Calculator step */}
      {isCalculatorStep && CalculatorComponent && project && (
        <div className="flex flex-col gap-5 animate-fade-in-up">
          <div className="bg-[var(--bg-subtle)]/50 rounded-xl border border-[var(--border)] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">Step {currentStepIndex}: {currentStepObject?.name}</h3>
              <p className="text-xs text-[var(--fg-secondary)] mt-0.5">Using shared dimensions: {project.sharedDimensions.length}&prime; &times; {project.sharedDimensions.width}&prime;</p>
            </div>
            <a href={currentStepObject?.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium">
              View Guide Page
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>

          {/* Calculator Embed */}
          <CalculatorComponent
            initialLength={project.sharedDimensions.length?.toString()}
            initialWidth={project.sharedDimensions.width?.toString()}
            initialThickness={project.sharedDimensions.depth?.toString()}
            initialDepth={project.sharedDimensions.depth?.toString()}
            initialArea={(project.sharedDimensions.length! * project.sharedDimensions.width!).toString()}
            projectId={project.id}
            onCalculate={handleStepCalculate}
          />

          {/* Step Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] no-print">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2.5 text-xs font-semibold rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Previous Step
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center px-5 py-2.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
            >
              Save & Continue
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Summary / Binder Page */}
      {isSummaryStep && project && (
        <div className="flex flex-col gap-6 animate-fade-in-up">
          {/* Action buttons */}
          <div className="flex items-center justify-between no-print">
            <h3 className="text-base font-bold text-[var(--fg)]">Printable Project Planner Binder</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors gap-1.5 cursor-pointer shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Project Binder (PDF)
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Binder Header (shown in print only) */}
          <div className="hidden print:block border-b border-[var(--border)] pb-6 mb-4">
            <span className="text-xs uppercase tracking-wider text-[var(--accent)] font-semibold font-mono">HomePlanningHub Project Planner Binder</span>
            <h1 className="text-2xl font-black text-[var(--fg)] mt-1">{project.name}</h1>
            <p className="text-xs text-[var(--fg-secondary)] mt-1">Generated dynamically from project dimensions: {project.sharedDimensions.length}&prime; &times; {project.sharedDimensions.width}&prime; &times; {project.sharedDimensions.depth}&Prime;</p>
          </div>

          {/* Interactive Staged Budget Card */}
          <Card className="p-6">
            <h4 className="text-sm font-bold text-[var(--fg)] mb-4 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Staged Cost & Budget Estimator
            </h4>

            {/* Budget Inputs (hidden in print) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 no-print">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--fg-secondary)]">Regional Labor Cost Multiplier</label>
                <select
                  value={laborMultiplier}
                  onChange={(e) => setLaborMultiplier(parseFloat(e.target.value))}
                  className="w-full text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
                >
                  <option value={0.85}>Low Cost Area / Rural (0.85x)</option>
                  <option value={1.0}>National Average / Suburban (1.0x)</option>
                  <option value={1.25}>High Cost Area / Metro (1.25x)</option>
                  <option value={1.55}>Premium Area / Heavy Urban (1.55x)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--fg-secondary)]">Contingency Safety Buffer</label>
                <select
                  value={contingencyRate}
                  onChange={(e) => setContingencyRate(parseFloat(e.target.value))}
                  className="w-full text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
                >
                  <option value={0.1}>10% contingency buffer</option>
                  <option value={0.15}>15% contingency buffer (Recommended)</option>
                  <option value={0.2}>20% contingency buffer</option>
                </select>
              </div>
            </div>

            {/* Budget Cost Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-xs">
              <div>
                <span className="text-[var(--fg-muted)] block mb-0.5">Est. Materials Cost</span>
                <span className="text-base font-bold text-[var(--fg)] tabular-nums">${Math.round(matCost).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[var(--fg-muted)] block mb-0.5">Est. Pro Labor Cost</span>
                <span className="text-base font-bold text-[var(--fg)] tabular-nums">${Math.round(estimatedLaborCost).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[var(--fg-muted)] block mb-0.5">Contingency Buffer</span>
                <span className="text-base font-bold text-[var(--fg)] tabular-nums">${Math.round(contingencyCost).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[var(--fg-muted)] block mb-0.5 text-[var(--accent)] font-semibold">Total Staged Estimate</span>
                <span className="text-base font-bold text-[var(--accent)] tabular-nums">${Math.round(totalProjectCost).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 text-[11px] leading-relaxed text-[var(--fg-secondary)] border-t border-[var(--border)] pt-3 flex flex-col gap-1">
              <p><strong>Labor Assumptions:</strong> Baselines estimate {laborBase.hours} contractor labor hours at a standard index of ${laborBase.baseRate}/hour, scaled by your selected regional multiplier.</p>
              <p className="text-[var(--success)] font-medium"><strong>DIY Savings Opportunity:</strong> Save up to <strong>${Math.round(estimatedLaborCost).toLocaleString()}</strong> in contractor fees by conducting DIY tasks yourself!</p>
            </div>
          </Card>

          {/* Staged Materials Shopping List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Aggregated Shopping List */}
            <Card className="p-6">
              <h4 className="text-sm font-bold text-[var(--fg)] mb-4 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Precision Material Quantities
              </h4>
              <div className="flex flex-col gap-3">
                {getAggregatedMaterials().length === 0 ? (
                  <p className="text-xs text-[var(--fg-muted)]">No materials calculated yet. Step back to finish calculations.</p>
                ) : (
                  getAggregatedMaterials().map((mat) => (
                    <div key={mat.name} className="flex justify-between items-center py-2 border-b border-[var(--border)] text-xs">
                      <span className="font-medium text-[var(--fg)]">{mat.name}</span>
                      <span className="font-bold tabular-nums text-[var(--accent)] bg-[var(--accent)]/5 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/10">{mat.quantity.toFixed(1)} {mat.unit}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Smart Accessory & Tool Recommendations */}
            <Card className="p-6">
              <h4 className="text-sm font-bold text-[var(--fg)] mb-4 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Required Accessories (Buy vs. Rent)
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-[var(--fg-secondary)]">
                {workflow.accessoryTools.map((tool, i) => (
                  <li key={i} className="flex items-start justify-between border-b border-[var(--border)] pb-2 last:border-b-0">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="w-3.5 h-3.5 mt-0.5 rounded border-[var(--border)] text-[var(--accent)] accent-[var(--accent)] cursor-pointer" />
                      <span>{tool.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${tool.recommendation === "rent" ? "bg-[var(--warning)]/10 text-[var(--warning)]" : "bg-[var(--success)]/10 text-[var(--success)]"}`}>
                      {tool.recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Staged Renovation Timeline (With DIY vs Hire recommendations) */}
          <Card className="p-6">
            <h4 className="text-sm font-bold text-[var(--fg)] mb-4 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Staged Timeline & Phase Recommendations
            </h4>
            <div className="relative border-l border-[var(--border)] ml-3 pl-4 flex flex-col gap-6">
              {workflow.timeline.map((item, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--accent)] border-2 border-[var(--card-bg)]" />
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-bold text-[var(--accent)] uppercase font-mono">{item.duration}</span>
                    <strong className="text-xs text-[var(--fg)] font-semibold">{item.phase}</strong>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${item.diyDifficulty === "Hard" ? "bg-[var(--error)]/10 text-[var(--error)]" : item.diyDifficulty === "Medium" ? "bg-[var(--warning)]/10 text-[var(--warning)]" : "bg-[var(--success)]/10 text-[var(--success)]"}`}>
                      {item.diyDifficulty} Difficulty
                    </span>
                    <span className="text-[10px] text-[var(--fg-muted)] italic font-medium">({item.hiringRecommendation})</span>
                  </div>
                  <p className="text-xs text-[var(--fg-secondary)] mt-1.5 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Contractor Quote Comparison Worksheet */}
          <Card className="p-6">
            <h4 className="text-sm font-bold text-[var(--fg)] mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Contractor Bid Vetting Worksheet
            </h4>
            <p className="text-xs text-[var(--fg-secondary)] mb-4">Print this binder to fill out bids from regional builders. Compare licensing, pricing, and references side-by-side.</p>
            
            <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--bg-inset)] border-b border-[var(--border)] text-[var(--fg-secondary)]">
                    <th className="p-3 font-semibold">Contractor / Firm Name</th>
                    <th className="p-3 font-semibold">Quoted Price</th>
                    <th className="p-3 font-semibold text-center">License Verified</th>
                    <th className="p-3 font-semibold text-center">References Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {contractorRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-inset)]/20">
                      <td className="p-3">
                        <input
                          type="text"
                          className="w-full bg-transparent border-0 focus:ring-0 text-xs text-[var(--fg)] no-print placeholder:text-[var(--fg-muted)]"
                          placeholder="Enter builder name..."
                          value={row.name}
                          onChange={(e) => {
                            const newRows = [...contractorRows];
                            newRows[idx].name = e.target.value;
                            setContractorRows(newRows);
                          }}
                        />
                        <span className="hidden print:inline-block h-4 w-full border-b border-dotted border-[var(--border-strong)]"></span>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          className="w-28 bg-transparent border-0 focus:ring-0 text-xs text-[var(--fg)] no-print placeholder:text-[var(--fg-muted)]"
                          placeholder="e.g. $4,500"
                          value={row.amount}
                          onChange={(e) => {
                            const newRows = [...contractorRows];
                            newRows[idx].amount = e.target.value;
                            setContractorRows(newRows);
                          }}
                        />
                        <span className="hidden print:inline-block h-4 w-full border-b border-dotted border-[var(--border-strong)]"></span>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.license}
                          onChange={(e) => {
                            const newRows = [...contractorRows];
                            newRows[idx].license = e.target.checked;
                            setContractorRows(newRows);
                          }}
                          className="rounded border-[var(--border)] text-[var(--accent)] accent-[var(--accent)] cursor-pointer no-print"
                        />
                        <span className="hidden print:inline-block print:before:content-['[___]']"></span>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.references}
                          onChange={(e) => {
                            const newRows = [...contractorRows];
                            newRows[idx].references = e.target.checked;
                            setContractorRows(newRows);
                          }}
                          className="rounded border-[var(--border)] text-[var(--accent)] accent-[var(--accent)] cursor-pointer no-print"
                        />
                        <span className="hidden print:inline-block print:before:content-['[___]']"></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Project Finishing Punch List */}
          <Card className="p-6">
            <h4 className="text-sm font-bold text-[var(--fg)] mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Final Project Punch List & Cleanup
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-[var(--fg-secondary)] leading-relaxed">
              {punchList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) => {
                      const newList = [...punchList];
                      newList[idx].done = e.target.checked;
                      setPunchList(newList);
                    }}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-[var(--border)] text-[var(--accent)] accent-[var(--accent)] cursor-pointer"
                  />
                  <span>{item.task}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Common Mistakes */}
          <Card className="p-6 border-l-4 border-l-[var(--error)]">
            <h4 className="text-sm font-bold text-[var(--fg)] mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Common DIY Mistakes to Avoid
            </h4>
            <ul className="list-disc list-inside flex flex-col gap-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
              {workflow.mistakes.map((mistake, i) => (
                <li key={i}>{mistake}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

export default withI18n(ProjectWorkflow);
