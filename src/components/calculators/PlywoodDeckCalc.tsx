import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateRectArea } from "../../lib/geometry";
import { applyWasteFactor, calculatePackaging } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";

const PLYWOOD_SHEET_AREA = 32; // 4x8 sheet = 32 sq ft

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

  const parse = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const lenNum = parse(length);
  const widNum = parse(width);
  const pitchNum = parse(pitch);
  const waste = parse(wasteFactor) / 100;

  const sheetAreas: Record<string, number> = { "4x8": 32, "4x10": 40, "4x12": 48 };
  const sheetArea = sheetAreas[sheetSize];

  const pitchFactor = Math.sqrt(1 + Math.pow(pitchNum / 12, 2));
  const roofArea = calculateRectArea(lenNum, widNum) * pitchFactor;
  const areaWithWaste = applyWasteFactor(roofArea, waste);
  const sheets = calculatePackaging(areaWithWaste, sheetArea);
  const screws = Math.ceil(roofArea / 4); // ~1 screw per 4 sq ft
  const hClips = Math.ceil((lenNum * pitchFactor) / 2); // every 2 ft on edges

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    saveRoom({ name: roomName.trim(), length: lenNum, width: widNum, height: pitchNum, geometryType: "area" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}"!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-7 flex flex-col gap-6">
        <Card>
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200">Deck / Sheathing Parameters</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Building Length (ft)" type="number" inputMode="decimal" autocomplete="off" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 40" />
            <Input label="Building Width (ft)" type="number" inputMode="decimal" autocomplete="off" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input label="Roof Pitch (rise per 12 in)" type="number" inputMode="decimal" autocomplete="off" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="e.g. 6" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" autocomplete="off" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 10" />
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Sheet Size</label>
            <div className="grid grid-cols-3 gap-2">
              {(["4x8", "4x10", "4x12"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setSheetSize(s)} className={`border rounded-md py-2 text-xs font-semibold font-mono transition-all ${sheetSize === s ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-neutral-200 text-neutral-600 hover:border-neutral-800 dark:border-neutral-800 dark:text-neutral-400"}`}>{s}</button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-4">Save Deck Project</h4>
          <form onSubmit={handleSave} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input label="Save As" type="text" autocomplete="off" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Roof Sheathing" />
            </div>
            <Button type="submit" variant="secondary" className="h-10">Save</Button>
          </form>
          {successMessage && <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-2" aria-live="polite">{successMessage}</p>}
        </Card>
      </div>

      <div className="md:col-span-5 flex flex-col gap-6">
        <Card className="bg-black text-white dark:bg-neutral-950 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400 mb-6">Plywood / OSB Output</h3>
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <span className="text-xs font-medium text-neutral-400 block mb-1">Total Roof Area</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight">{roofArea.toFixed(0)}</span>
                  <span className="text-lg text-neutral-400 font-semibold">sq ft</span>
                </div>
                <span className="text-xs text-neutral-400 block mt-1">With {wasteFactor}% waste: {areaWithWaste.toFixed(0)} sq ft</span>
              </div>
              <div>
                <span className="text-xs font-medium text-neutral-400 block mb-1">Sheets Needed ({sheetSize})</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{sheets}</span>
                  <span className="text-lg text-neutral-400 font-semibold">sheets</span>
                </div>
                <span className="text-xs text-neutral-400 block mt-1">{sheetArea} sq ft per sheet</span>
              </div>
              <div>
                <span className="text-xs font-medium text-neutral-400 block mb-1">Screws / Nails</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-3xl font-extrabold tracking-tight text-white">{screws.toLocaleString()}</span>
                  <span className="text-lg text-neutral-400 font-semibold">fasteners</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-6">
            <a href={`https://www.lowes.com/search?searchTerm=plywood+sheathing+${sheetSize.replace("x", "ft+")}`} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between bg-neutral-900 hover:bg-neutral-800 px-4 py-3 rounded-md border border-neutral-800 hover:border-neutral-600 transition-all">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Shop Plywood at Lowe's</span>
                <span className="text-[10px] text-neutral-400">{sheets} sheets needed</span>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>
        </Card>

        <Card>
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-3">Additional Materials</h4>
          <table className="w-full text-xs text-left">
            <tbody className="tabular-nums">
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2.5 font-medium text-neutral-800 dark:text-neutral-200">H-Clips</td>
                <td className="py-2.5 text-right font-bold text-neutral-950 dark:text-white">{hClips}</td>
              </tr>
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2.5 font-medium text-neutral-800 dark:text-neutral-200">Underlayment (squares)</td>
                <td className="py-2.5 text-right font-bold text-neutral-950 dark:text-white">{Math.ceil(roofArea / 100)}</td>
              </tr>
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2.5 font-medium text-neutral-800 dark:text-neutral-200">Drip Edge (linear ft)</td>
                <td className="py-2.5 text-right font-bold text-neutral-950 dark:text-white">{Math.ceil((lenNum + widNum) * 2 * 1.1)}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
