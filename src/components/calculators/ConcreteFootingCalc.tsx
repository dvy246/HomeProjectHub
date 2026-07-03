import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import UnitToggle from "../ui/UnitToggle";
import BagSizeSelector from "../ui/BagSizeSelector";
import ConcreteBagMatrix from "../ui/ConcreteBagMatrix";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { calculateRectArea, calculateCircleArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { parseNumber } from "../../lib/helpers";
import ConcreteFootingDiagram from "../diagrams/ConcreteFootingDiagram";

export default function ConcreteFootingCalc() {
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [footingShape, setFootingShape] = useState<"cylinder" | "block">("cylinder");
  const [diameter, setDiameter] = useState<string>("12");
  const [length, setLength] = useState<string>("12");
  const [width, setWidth] = useState<string>("12");
  const [depth, setDepth] = useState<string>("36");
  const [quantity, setQuantity] = useState<string>("4");
  const [wasteFactor, setWasteFactor] = useState<string>("10");
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("concrete-footing", "Concrete Footing Calculator");

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handler = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);
    return () => window.removeEventListener("saved-rooms-changed", handler);
  }, []);

  const diaNum = parseNumber(diameter);
  const lenNum = parseNumber(length);
  const widNum = parseNumber(width);
  const depNum = parseNumber(depth);
  const qtyNum = parseNumber(quantity);
  const wastePercent = parseNumber(wasteFactor) / 100;

  let singleArea = 0;
  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    const depFt = depNum / 12;
    if (footingShape === "cylinder") {
      const radiusFt = (diaNum / 2) / 12;
      singleArea = calculateCircleArea(radiusFt);
    } else {
      const lenFt = lenNum / 12;
      const widFt = widNum / 12;
      singleArea = calculateRectArea(lenFt, widFt);
    }
    const singleVolumeCuFt = calculateVolume(singleArea, depFt);
    totalVolumeCuFt = singleVolumeCuFt * qtyNum;
  } else {
    const depM = depNum / 100;
    if (footingShape === "cylinder") {
      const radiusM = (diaNum / 2) / 100;
      singleArea = calculateCircleArea(radiusM);
    } else {
      const lenM = lenNum / 100;
      const widM = widNum / 100;
      singleArea = calculateRectArea(lenM, widM);
    }
    const singleVolumeCuM = calculateVolume(singleArea, depM);
    totalVolumeCuFt = singleVolumeCuM * qtyNum * 35.3147;
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
    ...(footingShape === "cylinder" ? { diameter: diaNum } : { length: lenNum, width: widNum }),
    depth: depNum,
    quantity: qtyNum,
    wasteFactor: parseNumber(wasteFactor),
  };
  const projectResults: Record<string, number> = {
    totalVolumeCuYd,
    totalVolumeCuM,
    totalVolumeCuFt: totalVolumeWithWasteCuFt,
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
    saveRoom({
      name: roomName.trim(),
      length: footingShape === "cylinder" ? diaNum : lenNum,
      width: footingShape === "cylinder" ? diaNum : widNum,
      height: depNum,
      geometryType: "volume",
    });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}" successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    if (footingShape === "cylinder") {
      setDiameter(room.length.toString());
    } else {
      setLength(room.length.toString());
      setWidth(room.width.toString());
    }
    if (room.height) setDepth(room.height.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Footing Parameters</h3>
            <UnitToggle unitSystem={unitSystem} onChange={(u) => setUnitSystem(u)} />
          </div>

          <Select label="Footing Shape" value={footingShape} onChange={(v) => setFootingShape(v as "cylinder" | "block")} options={[{ value: "cylinder", label: "Cylindrical (Pier / Hole)" }, { value: "block", label: "Square / Rectangular" }]} />

          <div className="flex flex-col gap-4 mb-5">
            {footingShape === "cylinder" ? (
              <Input label={unitSystem === "imperial" ? "Hole Diameter (inches)" : "Hole Diameter (cm)"} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="e.g. 12" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input label={unitSystem === "imperial" ? "Length (inches)" : "Length (cm)"} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 12" />
                <Input label={unitSystem === "imperial" ? "Width (inches)" : "Width (cm)"} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 12" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input label={unitSystem === "imperial" ? "Hole Depth (inches)" : "Hole Depth (cm)"} type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 36" />
              <Input label="Number of Footings" type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 4" />
            </div>
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 10" />
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
          placeholder="e.g. Deck Post Holes"
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
          <ConcreteFootingDiagram width={footingShape === "cylinder" ? diaNum : lenNum} depth={depNum} height={footingShape === "cylinder" ? diaNum : widNum} unitSystem={unitSystem} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Results</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Required Volume (incl. {wasteFactor}% waste)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{unitSystem === "imperial" ? totalVolumeCuYd.toFixed(2) : totalVolumeCuM.toFixed(2)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{unitSystem === "imperial" ? "cu yd" : "cu m"}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">{totalVolumeWithWasteCuFt.toFixed(1)} cu ft total</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Bags ({bagSize})</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{selectedBags}</span>
                  <span className="text-xs text-[var(--fg-muted)]">bags</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Dry Weight</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{Math.round(estimatedWeightLbs).toLocaleString()}</span>
                  <span className="text-xs text-[var(--fg-muted)]">lbs</span>
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
