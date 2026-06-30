import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateRectArea, subtractOpenings, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs, CONCRETE_BAG_YIELDS } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";

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

  const parse = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const lenNum = parse(length);
  const hNum = parse(height);
  const thickNum = parse(thickness);
  const doors = Math.round(parse(doorCount));
  const windows = Math.round(parse(windowCount));
  const waste = parse(wasteFactor) / 100;

  let grossArea = 0;
  let netArea = 0;
  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    grossArea = calculateRectArea(lenNum, hNum);
    netArea = subtractOpenings(grossArea, [
      { type: "door", count: doors },
      { type: "window", count: windows },
    ]);
    const thickFt = thickNum / 12;
    totalVolumeCuFt = calculateVolume(netArea, thickFt);
  } else {
    grossArea = calculateRectArea(lenNum, hNum);
    netArea = subtractOpenings(grossArea, [
      { type: "door", count: doors },
      { type: "window", count: windows },
    ]);
    const thickM = thickNum / 100;
    const volCuM = calculateVolume(netArea, thickM);
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
    saveRoom({ name: roomName.trim(), length: lenNum, width: thickNum, height: hNum, geometryType: "volume" });
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
            <h3 className="text-sm font-semibold tracking-tight">Wall Parameters</h3>
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

          <div className="border-t border-[var(--border)] pt-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Bag Size for Output</label>
            <div className="grid grid-cols-4 gap-2">
              {(["40lb", "50lb", "60lb", "80lb"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setBagSize(s)} className={`border rounded-lg py-2 text-xs font-semibold font-mono transition-all active:scale-[0.97] ${bagSize === s ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>{s}</button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="text-sm font-semibold tracking-tight mb-4">Save Measurement</h4>
          <form onSubmit={handleSave} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input label="Project name" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Basement Wall" />
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
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Gross Wall Area</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold tracking-tight">{grossArea.toFixed(1)}</span>
                <span className="text-sm text-[var(--fg-muted)]">{unitSystem === "imperial" ? "sq ft" : "sq m"}</span>
              </div>
              {(doors > 0 || windows > 0) && (
                <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                  Net after openings: {netArea.toFixed(1)} {unitSystem === "imperial" ? "sq ft" : "sq m"}
                </span>
              )}
            </div>

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
