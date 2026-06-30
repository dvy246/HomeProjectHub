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
    setSuccessMessage(`Saved "${roomName.trim()}"!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 select-none">
      <div className="md:col-span-7 flex flex-col gap-6">
        <Card>
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200">Tube Form Parameters</h3>
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-md text-xs">
              <button type="button" className={`px-3 py-1.5 rounded-md font-medium transition-all ${unitSystem === "imperial" ? "bg-white text-black shadow-sm dark:bg-black dark:text-white" : "text-neutral-500"}`} onClick={() => setUnitSystem("imperial")}>Imperial</button>
              <button type="button" className={`px-3 py-1.5 rounded-md font-medium transition-all ${unitSystem === "metric" ? "bg-white text-black shadow-sm dark:bg-black dark:text-white" : "text-neutral-500"}`} onClick={() => setUnitSystem("metric")}>Metric</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Input label={unitSystem === "imperial" ? "Tube Diameter (inches)" : "Tube Diameter (cm)"} type="number" inputMode="decimal" autocomplete="off" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="e.g. 8" helperText="Common sizes: 6, 8, 10, 12 inches" />
            <div className="grid grid-cols-2 gap-4">
              <Input label={unitSystem === "imperial" ? "Tube Depth (inches)" : "Tube Depth (cm)"} type="number" inputMode="decimal" autocomplete="off" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 48" />
              <Input label="Number of Tubes" type="number" inputMode="numeric" autocomplete="off" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Waste Factor (%)" type="number" inputMode="decimal" autocomplete="off" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 10" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Bag Size</label>
                <select value={bagSize} onChange={(e) => setBagSize(e.target.value as any)} className="w-full text-sm bg-transparent border rounded-md h-10 px-3 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white">
                  <option value="80lb">80 lb bag</option>
                  <option value="60lb">60 lb bag</option>
                  <option value="50lb">50 lb bag</option>
                  <option value="40lb">40 lb bag</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-4">Save Tube Set</h4>
          <form onSubmit={handleSave} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input label="Save As" type="text" autocomplete="off" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Deck Post Tubes" />
            </div>
            <Button type="submit" variant="secondary" className="h-10">Save</Button>
          </form>
          {successMessage && <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-2" aria-live="polite">{successMessage}</p>}
        </Card>
      </div>

      <div className="md:col-span-5 flex flex-col gap-6">
        <Card className="bg-black text-white dark:bg-neutral-950 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400 mb-6">Tube Volume Output</h3>
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <span className="text-xs font-medium text-neutral-400 block mb-1">Required Volume (With {wasteFactor}% Waste)</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight">{unitSystem === "imperial" ? volCuYd.toFixed(3) : volCuM.toFixed(3)}</span>
                  <span className="text-lg text-neutral-400 font-semibold">{unitSystem === "imperial" ? "cu yd" : "cu m"}</span>
                </div>
                <span className="text-xs text-neutral-400 block mt-1">{volWithWaste.toFixed(2)} cu ft total</span>
              </div>
              <div>
                <span className="text-xs font-medium text-neutral-400 block mb-1">Bags Needed ({bagSize})</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{selectedBags}</span>
                  <span className="text-lg text-neutral-400 font-semibold">bags</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-neutral-400 block mb-1">Estimated Weight</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-xl font-bold tracking-tight text-neutral-200">{Math.round(weight).toLocaleString()} lbs</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-6">
            <a href={`https://www.lowes.com/search?searchTerm=concrete+mix+${bagSize}`} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between bg-neutral-900 hover:bg-neutral-800 px-4 py-3 rounded-md border border-neutral-800 hover:border-neutral-600 transition-all">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Order {selectedBags} Bags at Lowe's</span>
                <span className="text-[10px] text-neutral-400">Store pickup or delivery</span>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>
        </Card>

        <Card>
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-3">Bags Matrix By Size</h4>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400">
                <th className="py-2 font-medium">Bag Size</th>
                <th className="py-2 font-medium">Yield</th>
                <th className="py-2 text-right font-medium">Bags</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {(["80lb", "60lb", "50lb", "40lb"] as const).map((s, i) => (
                <tr key={s} className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                  <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">{s}</td>
                  <td className="py-2 text-neutral-500">{CONCRETE_BAG_YIELDS[s]} cu ft</td>
                  <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{[bags80, bags60, bags50, bags40][i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
