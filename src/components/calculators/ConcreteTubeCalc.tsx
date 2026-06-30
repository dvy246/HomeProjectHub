import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateCircleArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs, CONCRETE_BAG_YIELDS } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";

export default function ConcreteTubeCalc() {
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [diameter, setDiameter] = useState<string>("8");
  const [depth, setDepth] = useState<string>("48");
  const [quantity, setQuantity] = useState<string>("6");
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

  const parse = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const diaNum = parse(diameter);
  const depNum = parse(depth);
  const qtyNum = Math.max(1, Math.round(parse(quantity)));
  const waste = parse(wasteFactor) / 100;

  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    const rFt = diaNum / 2 / 12;
    const depFt = depNum / 12;
    const area = calculateCircleArea(rFt);
    totalVolumeCuFt = calculateVolume(area, depFt) * qtyNum;
  } else {
    const rM = diaNum / 2 / 100;
    const depM = depNum / 100;
    const area = calculateCircleArea(rM);
    const volCuM = calculateVolume(area, depM) * qtyNum;
    totalVolumeCuFt = volCuM * 35.3147;
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
    saveRoom({ name: roomName.trim(), length: diaNum, width: diaNum, height: depNum, geometryType: "volume" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}" successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const bagMatrix = [
    { size: "80 lb", yield: "0.60 cu ft", count: bags80 },
    { size: "60 lb", yield: "0.45 cu ft", count: bags60 },
    { size: "50 lb", yield: "0.375 cu ft", count: bags50 },
    { size: "40 lb", yield: "0.30 cu ft", count: bags40 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input panel */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Tube Form Parameters</h3>
            <div className="flex bg-[var(--bg-muted)] p-0.5 rounded-lg text-xs">
              <button
                type="button"
                aria-label="Use imperial units"
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${unitSystem === "imperial" ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-muted)]"}`}
                onClick={() => setUnitSystem("imperial")}
              >Imperial</button>
              <button
                type="button"
                aria-label="Use metric units"
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${unitSystem === "metric" ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-muted)]"}`}
                onClick={() => setUnitSystem("metric")}
              >Metric</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-5">
            <Input label={unitSystem === "imperial" ? "Tube Diameter (inches)" : "Tube Diameter (cm)"} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="e.g. 8" helperText="Common sizes: 6, 8, 10, 12 inches" />
            <div className="grid grid-cols-2 gap-4">
              <Input label={unitSystem === "imperial" ? "Tube Depth (inches)" : "Tube Depth (cm)"} type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 48" />
              <Input label="Number of Tubes" type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 6" />
            </div>
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 10" />
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Bag Size for Output</label>
            <div className="grid grid-cols-4 gap-2">
              {(["40lb", "50lb", "60lb", "80lb"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBagSize(size)}
                  className={`border rounded-lg py-2 text-xs font-semibold font-mono transition-all active:scale-[0.97] ${bagSize === size ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}
                >{size}</button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="text-sm font-semibold tracking-tight mb-4">Save Measurement</h4>
          <form onSubmit={handleSave} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input label="Project name" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Deck Post Tubes" />
            </div>
            <Button type="submit" variant="secondary" className="h-10">Save</Button>
          </form>
          {successMessage && (
            <p className="text-xs text-[var(--success)] font-medium mt-2 animate-fade-in-up" aria-live="polite">{successMessage}</p>
          )}
          {savedRooms.length > 0 && (
            <div className="border-t border-[var(--border)] pt-4 mt-4">
              <span className="text-xs font-medium text-[var(--fg-muted)] block mb-2">Saved Projects:</span>
              <div className="flex flex-wrap gap-2">
                {savedRooms.map((room) => (
                  <button key={room.id} type="button" className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--fg-secondary)] font-medium transition-colors">
                    {room.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Output panel */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Primary result card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Results</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Required Volume (incl. {wasteFactor}% waste)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">
                  {unitSystem === "imperial" ? volCuYd.toFixed(2) : volCuM.toFixed(2)}
                </span>
                <span className="text-base text-[var(--fg-muted)] font-medium">
                  {unitSystem === "imperial" ? "cu yd" : "cu m"}
                </span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                {volWithWaste.toFixed(1)} cu ft total
              </span>
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

        {/* Bag matrix */}
        <Card>
          <h4 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Bags by Size</h4>
          <div className="flex flex-col gap-1">
            {bagMatrix.map((row) => (
              <div key={row.size} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium tabular-nums">{row.size}</span>
                  <span className="text-xs text-[var(--fg-muted)] font-mono">{row.yield}</span>
                </div>
                <span className="text-sm font-bold tabular-nums">{row.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
