import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import UnitToggle from "../ui/UnitToggle";
import BagSizeSelector from "../ui/BagSizeSelector";
import ConcreteBagMatrix from "../ui/ConcreteBagMatrix";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { parseNumber } from "../../lib/helpers";
import ConcreteStepsDiagram from "../diagrams/ConcreteStepsDiagram";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function ConcreteStepsCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [numSteps, setNumSteps] = useState<string>("3");
  const [stepWidth, setStepWidth] = useState<string>("36");
  const [stepRise, setStepRise] = useState<string>("7");
  const [stepRun, setStepRun] = useState<string>("11");
  const [landingDepth, setLandingDepth] = useState<string>("0");
  const [wasteFactor, setWasteFactor] = useState<string>("10");
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("concrete-steps", "Concrete Steps Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [unitSystem, numSteps, stepWidth, stepRise, stepRun, landingDepth, wasteFactor, bagSize, roomName, savedRooms, successMessage, onCalculate]);

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handler = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);
    return () => window.removeEventListener("saved-rooms-changed", handler);
  }, []);

  const stepsCount = Math.max(1, Math.round(parseNumber(numSteps)));
  const widthVal = parseNumber(stepWidth);
  const riseVal = parseNumber(stepRise);
  const runVal = parseNumber(stepRun);
  const landingVal = parseNumber(landingDepth);
  const wastePercent = parseNumber(wasteFactor) / 100;

  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    const wFt = widthVal / 12;
    const rFt = riseVal / 12;
    const rnFt = runVal / 12;
    const lndFt = landingVal / 12;
    for (let i = 1; i <= stepsCount; i++) {
      const stepHeight = i * rFt;
      const isTopStep = i === stepsCount;
      const stepDepth = isTopStep ? (rnFt + lndFt) : rnFt;
      totalVolumeCuFt += stepHeight * stepDepth * wFt;
    }
  } else {
    const wM = widthVal / 100;
    const rM = riseVal / 100;
    const rnM = runVal / 100;
    const lndM = landingVal / 100;
    let totalVolumeCuM = 0;
    for (let i = 1; i <= stepsCount; i++) {
      const stepHeight = i * rM;
      const isTopStep = i === stepsCount;
      const stepDepth = isTopStep ? (rnM + lndM) : rnM;
      totalVolumeCuM += stepHeight * stepDepth * wM;
    }
    totalVolumeCuFt = totalVolumeCuM * 35.3147;
  }

  const totalVolumeWithWasteCuFt = applyWasteFactor(totalVolumeCuFt, wastePercent);
  const totalVolumeCuYd = cuFeetToCuYards(totalVolumeWithWasteCuFt);
  const totalVolumeCuM = totalVolumeWithWasteCuFt / 35.3147;

  const bags80 = calculateConcreteBags(totalVolumeWithWasteCuFt, "80lb");
  const bags60 = calculateConcreteBags(totalVolumeWithWasteCuFt, "60lb");
  const bags50 = calculateConcreteBags(totalVolumeWithWasteCuFt, "50lb");
  const bags40 = calculateConcreteBags(totalVolumeWithWasteCuFt, "40lb");
  const selectedBags = calculateConcreteBags(totalVolumeWithWasteCuFt, bagSize);
  const estimatedWeightLbs = estimateConcreteWeightLbs(totalVolumeWithWasteCuFt);

  const projectInputs: Record<string, number> = {
    numSteps: stepsCount,
    stepWidth: widthVal,
    stepRise: riseVal,
    stepRun: runVal,
    landingDepth: landingVal,
    wasteFactor: parseNumber(wasteFactor),
  };
  const projectResults: Record<string, number> = {
    totalVolumeCuFt: totalVolumeWithWasteCuFt,
    volumeCuYd: totalVolumeCuYd,
    volumeCuM: totalVolumeCuM,
    bagCount: selectedBags,
    weightLbs: estimatedWeightLbs,
  };
  const projectMaterials: MaterialItem[] = [
    { name: "Concrete Mix", quantity: selectedBags, unit: `bags (${bagSize})`, category: "concrete" },
    { name: "Ready-Mix Concrete", quantity: Number(totalVolumeCuYd.toFixed(2)), unit: "cu yd", category: "concrete" },
  ];

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    const totalStairLength = stepsCount * runVal + landingVal;
    saveRoom({
      name: roomName.trim(),
      length: unitSystem === "imperial" ? totalStairLength / 12 : totalStairLength / 100,
      width: unitSystem === "imperial" ? widthVal / 12 : widthVal / 100,
      height: stepsCount * riseVal,
      geometryType: "volume",
    });
    setRoomName("");
    setSuccessMessage(`Successfully saved "${roomName.trim()}"!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    const scale = unitSystem === "imperial" ? 12 : 100;
    setStepWidth((room.width * scale).toString());
    const estimatedRun = (room.length * scale) / stepsCount;
    setStepRun(estimatedRun.toFixed(0));
    if (room.height) {
      const estimatedRise = room.height / stepsCount;
      setStepRise(estimatedRise.toFixed(0));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.concrete.steps.parameters') ?? 'Steps Geometry'}</h3>
            <UnitToggle unitSystem={unitSystem} onChange={setUnitSystem} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.concrete.steps.num_steps') ?? 'Number of Steps'} type="number" inputMode="numeric" value={numSteps} onChange={(e) => setNumSteps(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 3'} />
            <Input label={unitSystem === "imperial" ? (t('calculators.detail.concrete.steps.width_in') ?? 'Step Width (inches)') : (t('calculators.detail.concrete.steps.width_cm') ?? 'Step Width (cm)')} type="number" inputMode="decimal" value={stepWidth} onChange={(e) => setStepWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 36'} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.concrete.steps.rise') ?? 'Step Rise (height)'} type="number" inputMode="decimal" value={stepRise} onChange={(e) => setStepRise(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 7'} />
            <Input label={t('calculators.detail.concrete.steps.run') ?? 'Step Run (depth)'} type="number" inputMode="decimal" value={stepRun} onChange={(e) => setStepRun(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 11'} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label={t('calculators.detail.concrete.steps.landing_extra') ?? 'Top Landing Extra Depth'} type="number" inputMode="decimal" value={landingDepth} onChange={(e) => setLandingDepth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 0'} helperText={t('calculators.detail.concrete.steps.landing_helper') ?? 'Optional landing depth extension'} />
            <Input label={t('calculators.detail.concrete.steps.waste_factor_pct') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 10'} />
          </div>

          <BagSizeSelector bagSize={bagSize} onChange={setBagSize} />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SaveMeasurementCard
          roomName={roomName}
          onRoomNameChange={setRoomName}
          onSave={handleSaveRoom}
          successMessage={successMessage}
          savedRooms={savedRooms}
          onApplyRoom={applySavedRoom}
          heading={t('calculators.detail.concrete.steps.save_workspace') ?? 'Save Stair Workspace'}
          saveLabel={t('calculators.detail.concrete.steps.save_set') ?? 'Save Set'}
          placeholder={t('calculators.common.placeholder') ?? 'e.g. Porch Stairs'}
          projectsLabel={t('calculators.common.apply_saved_dimensions') ?? 'Apply Saved Dimensions:'}
        />
        <AddToProjectCard
          projects={projects}
          onAdd={(pid) => {
            clearSuccess();
            addToProject(pid, projectInputs, projectResults, projectMaterials);
          }}
          successMessage={projectSuccess}
        />
      </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <ConcreteStepsDiagram treadDepth={runVal} riserHeight={riseVal} numSteps={stepsCount} width={widthVal} unitSystem={unitSystem} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.concrete.steps.volume_output') ?? 'Steps Volume Output'}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.common.volume') ?? 'Required Volume'} (With {wasteFactor}% {t('calculators.detail.concrete.steps.waste') ?? 'Waste'})</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{unitSystem === "imperial" ? totalVolumeCuYd.toFixed(3) : totalVolumeCuM.toFixed(3)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{unitSystem === "imperial" ? (t('units.cu_yd') ?? 'cu yd') : (t('units.cu_m') ?? 'cu m')}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">{t('calculators.detail.concrete.steps.yields') ?? 'Yields'} {totalVolumeWithWasteCuFt.toFixed(2)} {t('units.cu_ft') ?? 'cu ft'} {t('calculators.common.total') ?? 'total'}</span>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.concrete.steps.bags_needed') ?? 'Bags Needed'} ({bagSize} {t('units.bags') ?? 'bags'})</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{selectedBags}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('units.bags') ?? 'bags'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.concrete.steps.estimated_weight') ?? 'Estimated Weight'}</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{Math.round(estimatedWeightLbs).toLocaleString()}</span>
                  <span className="text-xs text-[var(--fg-muted)]">{t('units.lbs') ?? 'lbs'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ConcreteBagMatrix bags80={bags80} bags60={bags60} bags50={bags50} bags40={bags40} />
      </div>
    </div>
  );
}

export default withI18n(ConcreteStepsCalc);
