import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import UnitToggle from "../ui/UnitToggle";
import BagSizeSelector from "../ui/BagSizeSelector";
import ConcreteBagMatrix from "../ui/ConcreteBagMatrix";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { calculateCircleArea, calculateRectArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { parseNumber } from "../../lib/helpers";
import ConcreteColumnDiagram from "../diagrams/ConcreteColumnDiagram";

export default function ConcreteColumnCalc() {
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [columnShape, setColumnShape] = useState<"round" | "square">("round");
  const [diameter, setDiameter] = useState<string>("12");
  const [sideLength, setSideLength] = useState<string>("12");
  const [height, setHeight] = useState<string>("8");
  const [quantity, setQuantity] = useState<string>("4");
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

  const diaNum = parseNumber(diameter);
  const sideNum = parseNumber(sideLength);
  const hNum = parseNumber(height);
  const qtyNum = Math.max(1, Math.round(parseNumber(quantity)));
  const waste = parseNumber(wasteFactor) / 100;

  let singleArea = 0;
  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    const hFt = hNum;
    if (columnShape === "round") {
      const rFt = diaNum / 2 / 12;
      singleArea = calculateCircleArea(rFt);
    } else {
      const sFt = sideNum / 12;
      singleArea = calculateRectArea(sFt, sFt);
    }
    totalVolumeCuFt = calculateVolume(singleArea, hFt) * qtyNum;
  } else {
    const hM = hNum;
    if (columnShape === "round") {
      const rM = diaNum / 2 / 100;
      singleArea = calculateCircleArea(rM);
    } else {
      const sM = sideNum / 100;
      singleArea = calculateRectArea(sM, sM);
    }
    const totalCuM = calculateVolume(singleArea, hM) * qtyNum;
    totalVolumeCuFt = totalCuM * 35.3147;
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
    saveRoom({ name: roomName.trim(), length: columnShape === "round" ? diaNum : sideNum, width: columnShape === "round" ? diaNum : sideNum, height: hNum, geometryType: "volume" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}" successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    if (columnShape === "round") {
      setDiameter(room.length.toString());
    } else {
      setSideLength(room.length.toString());
    }
    if (room.height) setHeight(room.height.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Column Parameters</h3>
            <UnitToggle unitSystem={unitSystem} onChange={setUnitSystem} />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-5">
            <button type="button" onClick={() => setColumnShape("round")} className={`border rounded-lg py-2.5 text-xs font-semibold transition-colors motion-safe:active:scale-[0.97] ${columnShape === "round" ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>Round Column</button>
            <button type="button" onClick={() => setColumnShape("square")} className={`border rounded-lg py-2.5 text-xs font-semibold transition-colors motion-safe:active:scale-[0.97] ${columnShape === "square" ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>Square Column</button>
          </div>

          <div className="flex flex-col gap-4 mb-5">
            {columnShape === "round" ? (
              <Input label={unitSystem === "imperial" ? "Diameter (inches)" : "Diameter (cm)"} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="e.g. 12" />
            ) : (
              <Input label={unitSystem === "imperial" ? "Side Length (inches)" : "Side Length (cm)"} type="number" inputMode="decimal" value={sideLength} onChange={(e) => setSideLength(e.target.value)} placeholder="e.g. 12" />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input label={unitSystem === "imperial" ? "Height (feet)" : "Height (meters)"} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 8" />
              <Input label="Number of Columns" type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 4" />
            </div>
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 10" />
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
          placeholder="e.g. Porch Columns"
        />
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <ConcreteColumnDiagram diameter={diaNum} height={hNum} isRound={columnShape === "round"} unitSystem={unitSystem} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Results</h3>
          <div className="flex flex-col gap-5">
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
