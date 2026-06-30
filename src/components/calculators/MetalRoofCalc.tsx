import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateRectArea } from "../../lib/geometry";
import { applyWasteFactor, calculatePackaging } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";

const METAL_PANEL_WIDTH = 36; // inches of coverage per panel (standard standing seam)
const METAL_PANEL_LENGTH = 144; // 12 ft standard panel

export default function MetalRoofCalc() {
  const [length, setLength] = useState<string>("40");
  const [width, setWidth] = useState<string>("30");
  const [pitch, setPitch] = useState<string>("6");
  const [panelWidth, setPanelWidth] = useState<string>("36");
  const [panelLength, setPanelLength] = useState<string>("144");
  const [wasteFactor, setWasteFactor] = useState<string>("7");
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
  const pWidth = parse(panelWidth) || METAL_PANEL_WIDTH;
  const pLength = parse(panelLength) || METAL_PANEL_LENGTH;
  const waste = parse(wasteFactor) / 100;

  const pitchFactor = Math.sqrt(1 + Math.pow(pitchNum / 12, 2));
  const roofArea = calculateRectArea(lenNum, widNum) * pitchFactor;
  const areaWithWaste = applyWasteFactor(roofArea, waste);

  // Panel coverage in sq ft
  const panelCoverageSqFt = (pWidth / 12) * (pLength / 12);
  const panels = calculatePackaging(areaWithWaste, panelCoverageSqFt);
  const screws = Math.ceil(roofArea * 1.5); // ~1.5 screws per sq ft
  const closureStrips = Math.ceil((lenNum * pitchFactor) / (pWidth / 12)) * 2; // top + bottom

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
            <h3 className="text-sm font-semibold tracking-tight">Metal Roof Parameters</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Building Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 40" />
            <Input label="Building Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label="Roof Pitch (rise per 12 in)" type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="e.g. 6" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 7" helperText="5-10% for metal roofing" />
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Panel Dimensions</label>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Panel Coverage Width (inches)" type="number" inputMode="decimal" value={panelWidth} onChange={(e) => setPanelWidth(e.target.value)} placeholder="e.g. 36" />
              <Input label="Panel Length (inches)" type="number" inputMode="decimal" value={panelLength} onChange={(e) => setPanelLength(e.target.value)} placeholder="e.g. 144" />
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="text-sm font-semibold tracking-tight mb-4">Save Roof Project</h4>
          <form onSubmit={handleSave} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input label="Project name" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Garage Metal Roof" />
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
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Metal Panel Output</h3>
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
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Metal Panels Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{panels}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">panels</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                {pWidth}in × {pLength}in panels
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Screws Needed</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{screws.toLocaleString()}</span>
                  <span className="text-xs text-[var(--fg-muted)]">screws</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Closure Strips</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{closureStrips}</span>
                  <span className="text-xs text-[var(--fg-muted)]">pairs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional materials */}
        <Card>
          <h4 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Additional Materials</h4>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Butyl Tape (rolls)</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(roofArea / 100)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-medium">Ridge Cap (linear ft)</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(lenNum * 1.1)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
