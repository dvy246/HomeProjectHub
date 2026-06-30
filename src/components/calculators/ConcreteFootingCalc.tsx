import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateRectArea, calculateCircleArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";

export default function ConcreteFootingCalc() {
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [footingShape, setFootingShape] = useState<"cylinder" | "block">("cylinder");

  // Inputs
  const [diameter, setDiameter] = useState<string>("12"); // in inches for imperial, cm for metric
  const [length, setLength] = useState<string>("12"); // in inches/cm
  const [width, setWidth] = useState<string>("12"); // in inches/cm
  const [depth, setDepth] = useState<string>("36"); // in inches/cm
  const [quantity, setQuantity] = useState<string>("4");
  const [wasteFactor, setWasteFactor] = useState<string>("10"); // percent
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");
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

  const diaNum = parseInput(diameter);
  const lenNum = parseInput(length);
  const widNum = parseInput(width);
  const depNum = parseInput(depth);
  const qtyNum = parseInput(quantity);
  const wastePercent = parseInput(wasteFactor) / 100;

  // Geometry calculations
  let singleArea = 0;
  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    // Imperial: inputs are in inches, convert to feet for calculations
    const depFt = depNum / 12;
    if (footingShape === "cylinder") {
      const radiusFt = (diaNum / 2) / 12;
      singleArea = calculateCircleArea(radiusFt); // sq ft
    } else {
      const lenFt = lenNum / 12;
      const widFt = widNum / 12;
      singleArea = calculateRectArea(lenFt, widFt); // sq ft
    }
    const singleVolumeCuFt = calculateVolume(singleArea, depFt);
    totalVolumeCuFt = singleVolumeCuFt * qtyNum;
  } else {
    // Metric: inputs are in cm, convert to meters
    const depM = depNum / 100;
    if (footingShape === "cylinder") {
      const radiusM = (diaNum / 2) / 100;
      singleArea = calculateCircleArea(radiusM); // sq m
    } else {
      const lenM = lenNum / 100;
      const widM = widNum / 100;
      singleArea = calculateRectArea(lenM, widM); // sq m
    }
    const singleVolumeCuM = calculateVolume(singleArea, depM);
    const totalVolumeCuM = singleVolumeCuM * qtyNum;
    // Convert to cu ft for bag calculations
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

    // Convert cylinder dimensions to approximate box dimensions or save as diameter
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
            <h3 className="text-sm font-semibold tracking-tight">Footing Parameters</h3>
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

          {/* Shape selection */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setFootingShape("cylinder")}
              className={`border rounded-lg py-2.5 text-xs font-semibold transition-all active:scale-[0.97] ${footingShape === "cylinder" ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}
            >
              Cylindrical (Pier / Hole)
            </button>
            <button
              type="button"
              onClick={() => setFootingShape("block")}
              className={`border rounded-lg py-2.5 text-xs font-semibold transition-all active:scale-[0.97] ${footingShape === "block" ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}
            >
              Square / Rectangular
            </button>
          </div>

          <div className="flex flex-col gap-4 mb-5">
            {footingShape === "cylinder" ? (
              <Input
                label={unitSystem === "imperial" ? "Hole Diameter (inches)" : "Hole Diameter (cm)"}
                type="number"
                inputMode="decimal"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                placeholder="e.g. 12"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={unitSystem === "imperial" ? "Length (inches)" : "Length (cm)"}
                  type="number"
                  inputMode="decimal"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 12"
                />
                <Input
                  label={unitSystem === "imperial" ? "Width (inches)" : "Width (cm)"}
                  type="number"
                  inputMode="decimal"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 12"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={unitSystem === "imperial" ? "Hole Depth (inches)" : "Hole Depth (cm)"}
                type="number"
                inputMode="decimal"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="e.g. 36"
              />
              <Input
                label="Number of Footings"
                type="number"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 4"
              />
            </div>

            <Input
              label="Waste Factor (%)"
              type="number"
              inputMode="decimal"
              value={wasteFactor}
              onChange={(e) => setWasteFactor(e.target.value)}
              placeholder="e.g. 10"
            />
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
          <form onSubmit={handleSaveRoom} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input label="Project name" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Deck Post Holes" />
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
                  {unitSystem === "imperial" ? totalVolumeCuYd.toFixed(2) : totalVolumeCuM.toFixed(2)}
                </span>
                <span className="text-base text-[var(--fg-muted)] font-medium">
                  {unitSystem === "imperial" ? "cu yd" : "cu m"}
                </span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                {totalVolumeWithWasteCuFt.toFixed(1)} cu ft total
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
