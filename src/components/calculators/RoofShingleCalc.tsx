import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateRectArea } from "../../lib/geometry";
import { applyWasteFactor, calculatePackaging } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";

const SHINGLE_COVERAGE_PER_BUNDLE = 33.33; // sq ft per bundle (3 bundles = 1 square = 100 sq ft)

export default function RoofShingleCalc() {
  const [roofShape, setRoofShape] = useState<"gable" | "hip">("gable");
  const [length, setLength] = useState<string>("40");
  const [width, setWidth] = useState<string>("30");
  const [pitch, setPitch] = useState<string>("4"); // rise per 12 inches run
  const [wasteFactor, setWasteFactor] = useState<string>("12");
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
  const widNum = parse(width);
  const pitchNum = parse(pitch);
  const waste = parse(wasteFactor) / 100;

  // Calculate roof area based on pitch
  // Pitch factor = sqrt(1 + (pitch/12)^2)
  const pitchFactor = Math.sqrt(1 + Math.pow(pitchNum / 12, 2));

  // Gable roof: two sides, each = length * (width/2) * pitchFactor
  // Hip roof: total footprint * pitchFactor (simplified, slightly conservative)
  let roofArea = 0;
  if (roofShape === "gable") {
    const halfWidth = widNum / 2;
    const oneSide = calculateRectArea(lenNum, halfWidth) * pitchFactor;
    roofArea = oneSide * 2;
  } else {
    // Hip roof approximation: footprint * pitchFactor * 1.06 (hip factor for waste)
    roofArea = calculateRectArea(lenNum, widNum) * pitchFactor * 1.06;
  }

  const areaWithWaste = applyWasteFactor(roofArea, waste);
  const squares = areaWithWaste / 100;
  const bundles = calculatePackaging(areaWithWaste, SHINGLE_COVERAGE_PER_BUNDLE);
  const nails = Math.ceil(squares * 4); // ~4 boxes of nails per square
  const underlayment = Math.ceil(squares * 4 / 10); // rolls of underlayment (10 squares per roll)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    saveRoom({ name: roomName.trim(), length: lenNum, width: widNum, height: pitchNum, geometryType: "area" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}"!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input panel */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Roof Parameters</h3>
          </div>

          {/* Roof shape selection */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setRoofShape("gable")}
              className={`border rounded-lg py-2.5 text-xs font-semibold transition-all active:scale-[0.97] ${roofShape === "gable" ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}
            >
              Gable Roof
            </button>
            <button
              type="button"
              onClick={() => setRoofShape("hip")}
              className={`border rounded-lg py-2.5 text-xs font-semibold transition-all active:scale-[0.97] ${roofShape === "hip" ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}
            >
              Hip Roof
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Building Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 40" />
            <Input label="Building Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label="Roof Pitch (rise per 12 in)" type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="e.g. 4" helperText="Common: 4, 6, 8, 12" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 12" helperText="12-15% recommended for shingles" />
          </div>
        </Card>

        <Card>
          <h4 className="text-sm font-semibold tracking-tight mb-4">Save Roof Project</h4>
          <form onSubmit={handleSave} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input label="Project name" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. House Roof" />
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
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Shingle Material Output</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Total Roof Area</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{roofArea.toFixed(0)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">sq ft</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                With {wasteFactor}% waste: {areaWithWaste.toFixed(0)} sq ft
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Squares Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{squares.toFixed(1)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">squares</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">1 square = 100 sq ft</span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Bundles Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{bundles}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">bundles</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">3 bundles = 1 square</span>
            </div>
          </div>
        </div>

        {/* Additional materials */}
        <Card>
          <h4 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Additional Materials</h4>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Underlayment Rolls</span>
              <span className="text-sm font-bold tabular-nums">{underlayment}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Nail Boxes (1 lb each)</span>
              <span className="text-sm font-bold tabular-nums">{nails}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-medium">Drip Edge (linear ft)</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil((lenNum + widNum) * 2 * 1.1)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
