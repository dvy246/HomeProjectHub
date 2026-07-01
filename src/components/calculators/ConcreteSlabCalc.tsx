import { useState, useEffect, useCallback } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import UnitToggle from "../ui/UnitToggle";
import BagSizeSelector from "../ui/BagSizeSelector";
import ConcreteBagMatrix from "../ui/ConcreteBagMatrix";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { calculateRectArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { parseNumber } from "../../lib/helpers";

type UnitSystem = "imperial" | "metric";

function convertValue(value: number, from: UnitSystem, to: UnitSystem, field: "length" | "thickness"): number {
  if (from === to) return value;
  if (field === "thickness") {
    return from === "imperial" ? (value * 2.54).toFixed(1) : (value / 2.54).toFixed(1);
  }
  return from === "imperial" ? (value / 3.281).toFixed(2) : (value * 3.281).toFixed(2);
}

export default function ConcreteSlabCalc() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [length, setLength] = useState<string>("10");
  const [width, setWidth] = useState<string>("10");
  const [thickness, setThickness] = useState<string>("4");
  const [wasteFactor, setWasteFactor] = useState<string>("10");
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handler = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);
    return () => window.removeEventListener("saved-rooms-changed", handler);
  }, []);

  const handleUnitChange = useCallback((newUnit: UnitSystem) => {
    setUnitSystem((prev) => {
      if (prev === newUnit) return prev;
      setLength((v) => convertValue(parseFloat(v) || 0, prev, newUnit, "length"));
      setWidth((v) => convertValue(parseFloat(v) || 0, prev, newUnit, "length"));
      setThickness((v) => convertValue(parseFloat(v) || 0, prev, newUnit, "thickness"));
      return newUnit;
    });
  }, []);

  const lenNum = parseNumber(length);
  const widNum = parseNumber(width);
  const thickNum = parseNumber(thickness);
  const wastePercent = parseNumber(wasteFactor) / 100;

  let area = 0, volumeCuFt = 0, volumeCuYd = 0, volumeCuM = 0;

  if (unitSystem === "imperial") {
    area = calculateRectArea(lenNum, widNum);
    const thicknessFt = thickNum / 12;
    volumeCuFt = calculateVolume(area, thicknessFt);
    volumeCuYd = cuFeetToCuYards(volumeCuFt);
  } else {
    area = calculateRectArea(lenNum, widNum);
    const thicknessM = thickNum / 100;
    volumeCuM = calculateVolume(area, thicknessM);
    volumeCuFt = volumeCuM * 35.3147;
    volumeCuYd = cuFeetToCuYards(volumeCuFt);
  }

  const totalVolumeCuFt = applyWasteFactor(volumeCuFt, wastePercent);
  const totalVolumeCuYd = cuFeetToCuYards(totalVolumeCuFt);
  const totalVolumeCuM = totalVolumeCuFt / 35.3147;
  const selectedBags = calculateConcreteBags(totalVolumeCuFt, bagSize);
  const estimatedWeightLbs = estimateConcreteWeightLbs(totalVolumeCuFt);
  const bags80 = calculateConcreteBags(totalVolumeCuFt, "80lb");
  const bags60 = calculateConcreteBags(totalVolumeCuFt, "60lb");
  const bags50 = calculateConcreteBags(totalVolumeCuFt, "50lb");
  const bags40 = calculateConcreteBags(totalVolumeCuFt, "40lb");

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    saveRoom({ name: roomName.trim(), length: lenNum, width: widNum, height: thickNum, geometryType: "volume" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}" successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    setLength(room.length.toString());
    setWidth(room.width.toString());
    if (room.height) setThickness(room.height.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Slab Parameters</h3>
            <UnitToggle unitSystem={unitSystem} onChange={handleUnitChange} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={unitSystem === "imperial" ? "Length (ft)" : "Length (m)"} name="length" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 10" min="0" step="any" />
            <Input label={unitSystem === "imperial" ? "Width (ft)" : "Width (m)"} name="width" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 10" min="0" step="any" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label={unitSystem === "imperial" ? "Thickness (inches)" : "Thickness (cm)"} name="thickness" type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="e.g. 4" min="0" step="any" />
            <Input label="Waste Factor (%)" name="waste" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 10" min="0" max="50" step="1" />
          </div>

          <BagSizeSelector bagSize={bagSize} onChange={setBagSize} />
        </Card>

        <SaveMeasurementCard
          roomName={roomName}
          onRoomNameChange={setRoomName}
          onSave={handleSaveRoom}
          successMessage={successMessage}
          savedRooms={savedRooms}
          onApplyRoom={applySavedRoom}
          placeholder="e.g. Backyard Patio"
          projectsLabel="Apply Saved Dimensions:"
          showDimensions
        />
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Results</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Required Volume (incl. {wasteFactor}% waste)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight break-all">
                  {unitSystem === "imperial" ? totalVolumeCuYd.toFixed(2) : totalVolumeCuM.toFixed(2)}
                </span>
                <span className="text-base text-[var(--fg-muted)] font-medium">
                  {unitSystem === "imperial" ? "cu yd" : "cu m"}
                </span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                Raw: {unitSystem === "imperial" ? volumeCuYd.toFixed(2) : volumeCuM.toFixed(2)} {unitSystem === "imperial" ? "cu yd" : "cu m"} ({totalVolumeCuFt.toFixed(1)} cu ft)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Bags ({bagSize})</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight break-all">{selectedBags}</span>
                  <span className="text-xs text-[var(--fg-muted)]">bags</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Dry Weight</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight break-all">{Math.round(estimatedWeightLbs).toLocaleString()}</span>
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
