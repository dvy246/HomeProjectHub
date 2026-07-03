import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import UnitToggle from "../ui/UnitToggle";
import BagSizeSelector from "../ui/BagSizeSelector";
import ConcreteBagMatrix from "../ui/ConcreteBagMatrix";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { calculateRectArea, subtractOpenings, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { parseNumber } from "../../lib/helpers";
import ConcreteWallDiagram from "../diagrams/ConcreteWallDiagram";

export default function ConcreteWallCalc() {
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [length, setLength] = useState<string>("10");
  const [height, setHeight] = useState<string>("8");
  const [thickness, setThickness] = useState<string>("8");
  const [doorCount, setDoorCount] = useState<string>("0");
  const [windowCount, setWindowCount] = useState<string>("0");
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

  const lenNum = parseNumber(length);
  const hNum = parseNumber(height);
  const thickNum = parseNumber(thickness);
  const doors = Math.round(parseNumber(doorCount));
  const windows = Math.round(parseNumber(windowCount));
  const waste = parseNumber(wasteFactor) / 100;

  let grossArea = 0, netArea = 0, totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    grossArea = calculateRectArea(lenNum, hNum);
    netArea = subtractOpenings(grossArea, [{ type: "door", count: doors }, { type: "window", count: windows }]);
    totalVolumeCuFt = calculateVolume(netArea, thickNum / 12);
  } else {
    grossArea = calculateRectArea(lenNum, hNum);
    netArea = subtractOpenings(grossArea, [{ type: "door", count: doors }, { type: "window", count: windows }]);
    totalVolumeCuFt = calculateVolume(netArea, thickNum / 100) * 35.3147;
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    saveRoom({ name: roomName.trim(), length: lenNum, width: thickNum, height: hNum, geometryType: "volume" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}" successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    setLength(room.length.toString());
    if (room.height) setHeight(room.height.toString());
    setThickness(room.width.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Wall Parameters</h3>
            <UnitToggle unitSystem={unitSystem} onChange={setUnitSystem} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={unitSystem === "imperial" ? "Wall Length (ft)" : "Wall Length (m)"} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 10" />
            <Input label={unitSystem === "imperial" ? "Wall Height (ft)" : "Wall Height (m)"} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 8" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={unitSystem === "imperial" ? "Thickness (inches)" : "Thickness (cm)"} type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="e.g. 8" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 10" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label="Standard Doors (21 sq ft each)" type="number" inputMode="numeric" value={doorCount} onChange={(e) => setDoorCount(e.target.value)} placeholder="0" helperText="Subtracted from wall area" />
            <Input label="Standard Windows (12 sq ft each)" type="number" inputMode="numeric" value={windowCount} onChange={(e) => setWindowCount(e.target.value)} placeholder="0" helperText="Subtracted from wall area" />
          </div>

          <BagSizeSelector bagSize={bagSize} onChange={setBagSize} />
        </Card>

        <SaveMeasurementCard
          roomName={roomName}
          onRoomNameChange={setRoomName}
          onSave={handleSave}
          successMessage={successMessage}
          savedRooms={savedRooms}
          onApplyRoom={applySavedRoom}
          placeholder="e.g. Basement Wall"
        />
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <ConcreteWallDiagram length={lenNum} width={thickNum} height={hNum} unitSystem={unitSystem} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Results</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Gross Wall Area</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold tracking-tight">{grossArea.toFixed(1)}</span>
                <span className="text-sm text-[var(--fg-muted)]">{unitSystem === "imperial" ? "sq ft" : "sq m"}</span>
              </div>
              {(doors > 0 || windows > 0) && (
                <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">Net after openings: {netArea.toFixed(1)} {unitSystem === "imperial" ? "sq ft" : "sq m"}</span>
              )}
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Required Volume (incl. {wasteFactor}% waste)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{unitSystem === "imperial" ? volCuYd.toFixed(2) : volCuM.toFixed(2)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{unitSystem === "imperial" ? "cu yd" : "cu m"}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">{volWithWaste.toFixed(1)} cu ft total</span>
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
                  <span className="text-2xl font-bold tracking-tight">{Math.round(weight).toLocaleString()}</span>
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
