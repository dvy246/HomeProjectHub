import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateRectArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";

export default function ConcreteStepsCalc() {
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");

  // Inputs
  const [numSteps, setNumSteps] = useState<string>("3");
  const [stepWidth, setStepWidth] = useState<string>("36"); // inches or cm
  const [stepRise, setStepRise] = useState<string>("7"); // inches or cm
  const [stepRun, setStepRun] = useState<string>("11"); // inches or cm
  const [landingDepth, setLandingDepth] = useState<string>("0"); // extra depth on the top step (inches or cm)
  const [wasteFactor, setWasteFactor] = useState<string>("10"); // percent
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");
  
  // Storage Integration
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handleRoomsChange = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handleRoomsChange);
    return () => window.removeEventListener("saved-rooms-changed", handleRoomsChange);
  }, []);

  const parseInput = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const stepsCount = Math.max(1, Math.round(parseInput(numSteps)));
  const widthVal = parseInput(stepWidth);
  const riseVal = parseInput(stepRise);
  const runVal = parseInput(stepRun);
  const landingVal = parseInput(landingDepth);
  const wastePercent = parseInput(wasteFactor) / 100;

  // Calculation Logic (rigorous step volume sum)
  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    // Convert inputs from inches to feet
    const wFt = widthVal / 12;
    const rFt = riseVal / 12;
    const rnFt = runVal / 12;
    const lndFt = landingVal / 12;

    // Calculate individual steps:
    for (let i = 1; i <= stepsCount; i++) {
      const stepHeight = i * rFt;
      const isTopStep = i === stepsCount;
      const stepDepth = isTopStep ? (rnFt + lndFt) : rnFt;
      totalVolumeCuFt += stepHeight * stepDepth * wFt;
    }
  } else {
    // Metric: inputs are in cm, convert to meters
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
    // Convert cu m to cu ft for bag logic
    totalVolumeCuFt = totalVolumeCuM * 35.3147;
  }

  const totalVolumeWithWasteCuFt = applyWasteFactor(totalVolumeCuFt, wastePercent);
  const totalVolumeCuYd = cuFeetToCuYards(totalVolumeWithWasteCuFt);
  const totalVolumeCuM = totalVolumeWithWasteCuFt / 35.3147;

  // Bags needed
  const bags80 = calculateConcreteBags(totalVolumeWithWasteCuFt, "80lb");
  const bags60 = calculateConcreteBags(totalVolumeWithWasteCuFt, "60lb");
  const bags50 = calculateConcreteBags(totalVolumeWithWasteCuFt, "50lb");
  const bags40 = calculateConcreteBags(totalVolumeWithWasteCuFt, "40lb");

  const selectedBags = calculateConcreteBags(totalVolumeWithWasteCuFt, bagSize);
  const estimatedWeightLbs = estimateConcreteWeightLbs(totalVolumeWithWasteCuFt);

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    // Save stair footprint in saved workspace
    // Stair length = steps * run + landing
    const totalStairLength = stepsCount * runVal + landingVal;
    
    saveRoom({
      name: roomName.trim(),
      length: unitSystem === "imperial" ? totalStairLength / 12 : totalStairLength / 100, // convert back to feet/meters
      width: unitSystem === "imperial" ? widthVal / 12 : widthVal / 100, // convert to feet/meters
      height: stepsCount * riseVal, // total height in inches/cm
      geometryType: "volume",
    });

    setRoomName("");
    setSuccessMessage(`Successfully saved "${roomName.trim()}"!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    // Convert back from feet/meters to inches/cm if necessary
    const scale = unitSystem === "imperial" ? 12 : 100;
    setStepWidth((room.width * scale).toString());
    
    // Estimate stair rise and run based on saved dimensions
    const estimatedRun = (room.length * scale) / stepsCount;
    setStepRun(estimatedRun.toFixed(0));
    
    if (room.height) {
      const estimatedRise = room.height / stepsCount;
      setStepRise(estimatedRise.toFixed(0));
    }
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
            <h3 className="text-sm font-semibold tracking-tight">Steps Geometry</h3>
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
            <Input label="Number of Steps" type="number" inputMode="numeric" value={numSteps} onChange={(e) => setNumSteps(e.target.value)} placeholder="e.g. 3" />
            <Input label={unitSystem === "imperial" ? "Step Width (inches)" : "Step Width (cm)"} type="number" inputMode="decimal" value={stepWidth} onChange={(e) => setStepWidth(e.target.value)} placeholder="e.g. 36" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Step Rise (height)" type="number" inputMode="decimal" value={stepRise} onChange={(e) => setStepRise(e.target.value)} placeholder="e.g. 7" />
            <Input label="Step Run (depth)" type="number" inputMode="decimal" value={stepRun} onChange={(e) => setStepRun(e.target.value)} placeholder="e.g. 11" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label="Top Landing Extra Depth" type="number" inputMode="decimal" value={landingDepth} onChange={(e) => setLandingDepth(e.target.value)} placeholder="e.g. 0" helperText="Optional landing depth extension" />
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
          <h4 className="text-sm font-semibold tracking-tight mb-4">Save Stair Workspace</h4>
          <form onSubmit={handleSaveRoom} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input label="Save As (e.g. Front Porch, Garden Steps)" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Porch Stairs" />
            </div>
            <Button type="submit" variant="secondary" className="h-10">Save Set</Button>
          </form>
          {successMessage && (
            <p className="text-xs text-[var(--success)] font-medium mt-2 animate-fade-in-up" aria-live="polite">{successMessage}</p>
          )}
          {savedRooms.length > 0 && (
            <div className="border-t border-[var(--border)] pt-4 mt-4">
              <span className="text-xs font-medium text-[var(--fg-muted)] block mb-2">Apply Saved Dimensions:</span>
              <div className="flex flex-wrap gap-2">
                {savedRooms.map((room) => (
                  <button key={room.id} type="button" onClick={() => applySavedRoom(room)} className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--fg-secondary)] font-medium transition-colors">
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
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Steps Volume Output</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Required Volume (With {wasteFactor}% Waste)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">
                  {unitSystem === "imperial" ? totalVolumeCuYd.toFixed(3) : totalVolumeCuM.toFixed(3)}
                </span>
                <span className="text-base text-[var(--fg-muted)] font-medium">
                  {unitSystem === "imperial" ? "cu yd" : "cu m"}
                </span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                Yields {totalVolumeWithWasteCuFt.toFixed(2)} cu ft total
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Bags Needed ({bagSize} bags)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{selectedBags}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">bags</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Estimated Weight</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{Math.round(estimatedWeightLbs).toLocaleString()}</span>
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
