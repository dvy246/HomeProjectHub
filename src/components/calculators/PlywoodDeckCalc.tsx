import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { calculateRectArea } from "../../lib/geometry";
import { applyWasteFactor, calculatePackaging } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { parseNumber } from "../../lib/helpers";

const PLYWOOD_SHEET_AREA = 32;

export default function PlywoodDeckCalc() {
  const [length, setLength] = useState<string>("40");
  const [width, setWidth] = useState<string>("30");
  const [pitch, setPitch] = useState<string>("6");
  const [sheetSize, setSheetSize] = useState<"4x8" | "4x10" | "4x12">("4x8");
  const [wasteFactor, setWasteFactor] = useState<string>("10");
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
  const widNum = parseNumber(width);
  const pitchNum = parseNumber(pitch);
  const waste = parseNumber(wasteFactor) / 100;

  const sheetAreas: Record<string, number> = { "4x8": 32, "4x10": 40, "4x12": 48 };
  const sheetArea = sheetAreas[sheetSize];

  const pitchFactor = Math.sqrt(1 + Math.pow(pitchNum / 12, 2));
  const roofArea = calculateRectArea(lenNum, widNum) * pitchFactor;
  const areaWithWaste = applyWasteFactor(roofArea, waste);
  const sheets = calculatePackaging(areaWithWaste, sheetArea);
  const screws = Math.ceil(roofArea / 4);
  const hClips = Math.ceil((lenNum * pitchFactor) / 2);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    saveRoom({ name: roomName.trim(), length: lenNum, width: widNum, height: pitchNum, geometryType: "area" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}"!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    setLength(room.length.toString());
    setWidth(room.width.toString());
    if (room.height) setPitch(room.height.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Deck / Sheathing Parameters</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Building Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 40" />
            <Input label="Building Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label="Roof Pitch (rise per 12 in)" type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="e.g. 6" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 10" />
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <fieldset>
              <legend className="text-xs font-medium text-[var(--fg-secondary)] mb-2">Sheet Size</legend>
              <div className="grid grid-cols-3 gap-2">
                {(["4x8", "4x10", "4x12"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setSheetSize(s)} className={`border rounded-lg py-2 text-xs font-semibold font-mono transition-all active:scale-[0.97] ${sheetSize === s ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>{s}</button>
                ))}
              </div>
            </fieldset>
          </div>
        </Card>

        <SaveMeasurementCard
          roomName={roomName}
          onRoomNameChange={setRoomName}
          onSave={handleSave}
          successMessage={successMessage}
          savedRooms={savedRooms}
          onApplyRoom={applySavedRoom}
          heading="Save Deck Project"
          placeholder="e.g. Roof Sheathing"
          projectsLabel="Saved Projects:"
        />
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Plywood / OSB Output</h3>
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
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Sheets Needed ({sheetSize})</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{sheets}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">sheets</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">{sheetArea} sq ft per sheet</span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Screws / Nails</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{screws.toLocaleString()}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">fasteners</span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Additional Materials</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">H-Clips</span>
              <span className="text-sm font-bold tabular-nums">{hClips}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Underlayment (squares)</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(roofArea / 100)}</span>
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
