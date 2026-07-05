import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import UnitToggle from "../ui/UnitToggle";
import BagSizeSelector from "../ui/BagSizeSelector";
import ConcreteBagMatrix from "../ui/ConcreteBagMatrix";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { calculateCircleArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { parseNumber } from "../../lib/helpers";
import ConcreteTubeDiagram from "../diagrams/ConcreteTubeDiagram";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function ConcreteTubeCalc() {
  const { t } = useI18n();
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [diameter, setDiameter] = useState<string>("8");
  const [depth, setDepth] = useState<string>("48");
  const [quantity, setQuantity] = useState<string>("6");
  const [wasteFactor, setWasteFactor] = useState<string>("10");
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("concrete-tube", "Concrete Tube Calculator");

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handler = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);
    return () => window.removeEventListener("saved-rooms-changed", handler);
  }, []);

  const diaNum = parseNumber(diameter);
  const depNum = parseNumber(depth);
  const qtyNum = Math.max(1, Math.round(parseNumber(quantity)));
  const waste = parseNumber(wasteFactor) / 100;

  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    const rFt = diaNum / 2 / 12;
    const depFt = depNum / 12;
    totalVolumeCuFt = calculateVolume(calculateCircleArea(rFt), depFt) * qtyNum;
  } else {
    const rM = diaNum / 2 / 100;
    const depM = depNum / 100;
    totalVolumeCuFt = calculateVolume(calculateCircleArea(rM), depM) * qtyNum * 35.3147;
  }

  const volWithWaste = applyWasteFactor(totalVolumeCuFt, waste);
  const volCuYd = cuFeetToCuYards(volWithWaste);
  const volCuM = volWithWaste / 35.3147;

  const bags80 = calculateConcreteBags(volWithWaste, "80lb");
  const bags60 = calculateConcreteBags(volWithWaste, "60lb");
  const bags50 = calculateConcreteBags(volWithWaste, "50lb");
  const bags40 = calculateConcreteBags(volWithWaste, "40lb");
  const selectedBags = calculateConcreteBags(volWithWaste, bagSize);
  const weight = estimateConcreteWeightLbs(volWithWaste);

  const projectInputs: Record<string, number> = {
    diameter: diaNum,
    depth: depNum,
    quantity: qtyNum,
    wasteFactor: parseNumber(wasteFactor),
  };
  const projectResults: Record<string, number> = {
    totalVolumeCuFt: volWithWaste,
    volumeCuYd: volCuYd,
    volumeCuM: volCuM,
    bagCount: selectedBags,
    weightLbs: weight,
  };
  const projectMaterials: MaterialItem[] = [
    { name: "Concrete Mix", quantity: selectedBags, unit: `bags (${bagSize})`, category: "concrete" },
    { name: "Ready-Mix Concrete", quantity: Number(volCuYd.toFixed(2)), unit: "cu yd", category: "concrete" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    saveRoom({ name: roomName.trim(), length: diaNum, width: diaNum, height: depNum, geometryType: "volume" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}" successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    setDiameter(room.length.toString());
    if (room.height) setDepth(room.height.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.concrete.tube.parameters') ?? 'Tube Form Parameters'}</h3>
            <UnitToggle unitSystem={unitSystem} onChange={setUnitSystem} />
          </div>

          <div className="flex flex-col gap-4 mb-5">
            <Input label={unitSystem === "imperial" ? (t('calculators.detail.concrete.tube.diameter_in') ?? 'Tube Diameter (inches)') : (t('calculators.detail.concrete.tube.diameter_cm') ?? 'Tube Diameter (cm)')} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 8'} helperText={t('calculators.detail.concrete.tube.common_sizes') ?? 'Common sizes: 6, 8, 10, 12 inches'} />
            <div className="grid grid-cols-2 gap-4">
              <Input label={unitSystem === "imperial" ? (t('calculators.detail.concrete.tube.depth_in') ?? 'Tube Depth (inches)') : (t('calculators.detail.concrete.tube.depth_cm') ?? 'Tube Depth (cm)')} type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 48'} />
              <Input label={t('calculators.detail.concrete.tube.num_tubes') ?? 'Number of Tubes'} type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 6'} />
            </div>
            <Input label={t('calculators.detail.concrete.tube.waste_factor_pct') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 10'} />
          </div>

          <BagSizeSelector bagSize={bagSize} onChange={setBagSize} />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SaveMeasurementCard
          roomName={roomName}
          onRoomNameChange={setRoomName}
          onSave={handleSave}
          successMessage={successMessage}
          savedRooms={savedRooms}
          onApplyRoom={applySavedRoom}
          placeholder={t('calculators.common.placeholder') ?? 'e.g. Deck Post Tubes'}
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
          <ConcreteTubeDiagram diameter={diaNum} height={depNum} unitSystem={unitSystem} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.common.results') ?? 'Results'}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.common.volume') ?? 'Required Volume'} (incl. {wasteFactor}% waste)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{unitSystem === "imperial" ? volCuYd.toFixed(2) : volCuM.toFixed(2)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{unitSystem === "imperial" ? (t('units.cu_yd') ?? 'cu yd') : (t('units.cu_m') ?? 'cu m')}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">{volWithWaste.toFixed(1)} {t('units.cu_ft') ?? 'cu ft'} {t('calculators.common.total') ?? 'total'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.common.bags') ?? 'Bags'} ({bagSize})</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{selectedBags}</span>
                  <span className="text-xs text-[var(--fg-muted)]">{t('units.bags') ?? 'bags'}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.common.dry_weight') ?? 'Dry Weight'}</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{Math.round(weight).toLocaleString()}</span>
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

export default withI18n(ConcreteTubeCalc);
