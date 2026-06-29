import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateRectArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs, CONCRETE_BAG_YIELDS } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";

export default function ConcreteSlabCalc() {
  // Unit system state
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");

  // Inputs
  const [length, setLength] = useState<string>("10");
  const [width, setWidth] = useState<string>("10");
  const [thickness, setThickness] = useState<string>("4"); // in inches for imperial, cm for metric
  const [wasteFactor, setWasteFactor] = useState<string>("10"); // percent
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");
  const [roomName, setRoomName] = useState<string>("");

  // Saved rooms list for integration
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handleRoomsChange = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handleRoomsChange);
    return () => window.removeEventListener("saved-rooms-changed", handleRoomsChange);
  }, []);

  // Parse helper
  const parseInput = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const lenNum = parseInput(length);
  const widNum = parseInput(width);
  const thickNum = parseInput(thickness);
  const wastePercent = parseInput(wasteFactor) / 100;

  // Geometry math
  let area = 0;
  let volumeCuFt = 0;
  let volumeCuYd = 0;
  let volumeCuM = 0;

  if (unitSystem === "imperial") {
    // Area in sq ft
    area = calculateRectArea(lenNum, widNum);
    // Thickness converted from inches to feet
    const thicknessFt = thickNum / 12;
    volumeCuFt = calculateVolume(area, thicknessFt);
    volumeCuYd = cuFeetToCuYards(volumeCuFt);
  } else {
    // Area in sq m
    area = calculateRectArea(lenNum, widNum);
    // Thickness converted from cm to meters
    const thicknessM = thickNum / 100;
    volumeCuM = calculateVolume(area, thicknessM);
    // Convert cubic meters to cubic feet for bag calculator engine compatibility
    volumeCuFt = volumeCuM * 35.3147;
    volumeCuYd = cuFeetToCuYards(volumeCuFt);
  }

  const totalVolumeCuFt = applyWasteFactor(volumeCuFt, wastePercent);
  const totalVolumeCuYd = cuFeetToCuYards(totalVolumeCuFt);
  const totalVolumeCuM = totalVolumeCuFt / 35.3147;

  // Bags needed
  const bags80 = calculateConcreteBags(totalVolumeCuFt, "80lb");
  const bags60 = calculateConcreteBags(totalVolumeCuFt, "60lb");
  const bags50 = calculateConcreteBags(totalVolumeCuFt, "50lb");
  const bags40 = calculateConcreteBags(totalVolumeCuFt, "40lb");

  const selectedBags = calculateConcreteBags(totalVolumeCuFt, bagSize);
  const estimatedWeightLbs = estimateConcreteWeightLbs(totalVolumeCuFt);

  // Save room handler
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    saveRoom({
      name: roomName.trim(),
      length: lenNum,
      width: widNum,
      height: thickNum,
      geometryType: "volume",
    });

    setRoomName("");
    setSuccessMessage(`Successfully saved "${roomName.trim()}"!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    setLength(room.length.toString());
    setWidth(room.width.toString());
    if (room.height) {
      setThickness(room.height.toString());
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 select-none">
      {/* Input panel */}
      <div className="md:col-span-7 flex flex-col gap-6">
        <Card>
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Slab Parameters
            </h3>
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-md text-xs">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  unitSystem === "imperial"
                    ? "bg-white text-black shadow-sm dark:bg-black dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
                onClick={() => setUnitSystem("imperial")}
              >
                Imperial
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  unitSystem === "metric"
                    ? "bg-white text-black shadow-sm dark:bg-black dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
                onClick={() => setUnitSystem("metric")}
              >
                Metric
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label={unitSystem === "imperial" ? "Length (ft)" : "Length (m)"}
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 10…"
            />
            <Input
              label={unitSystem === "imperial" ? "Width (ft)" : "Width (m)"}
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 10…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input
              label={unitSystem === "imperial" ? "Thickness (inches)" : "Thickness (cm)"}
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="e.g. 4…"
            />
            <Input
              label="Waste Factor (%)"
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={wasteFactor}
              onChange={(e) => setWasteFactor(e.target.value)}
              placeholder="e.g. 10…"
            />
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block cursor-pointer">
              Select Bag Size for Output
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["40lb", "50lb", "60lb", "80lb"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBagSize(size)}
                  className={`border rounded-md py-2 text-xs font-semibold font-mono tracking-tight transition-all ${
                    bagSize === size
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-800 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Save measurement form */}
        <Card>
          <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-4">
            Save Measurement Workspace
          </h4>
          <form onSubmit={handleSaveRoom} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input
                label="Save As (e.g. Backyard Patio, Shed Slab)"
                type="text"
                autocomplete="off"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Patio Project…"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-10">
              Save Room
            </Button>
          </form>
          {successMessage && (
            <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-2" aria-live="polite">
              {successMessage}
            </p>
          )}

          {/* Quick list of saved rooms */}
          {savedRooms.length > 0 && (
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-4">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-500 block mb-2">
                Apply Saved Dimensions:
              </span>
              <div className="flex flex-wrap gap-2">
                {savedRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => applySavedRoom(room)}
                    className="text-xs px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
                  >
                    {room.name} ({room.length}x{room.width})
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Output panel */}
      <div className="md:col-span-5 flex flex-col gap-6">
        <Card className="bg-black text-white dark:bg-neutral-950 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-6">
              Calculation Output
            </h3>
            
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-1">
                  Required Volume (Including {wasteFactor}% Waste)
                </span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {unitSystem === "imperial"
                      ? totalVolumeCuYd.toFixed(2)
                      : totalVolumeCuM.toFixed(2)}
                  </span>
                  <span className="text-lg text-neutral-400 font-semibold">
                    {unitSystem === "imperial" ? "cu yd" : "cu m"}
                  </span>
                </div>
                <span className="text-xs text-neutral-400 block mt-1 tabular-nums">
                  Raw volume: {unitSystem === "imperial" ? volumeCuYd.toFixed(2) : volumeCuM.toFixed(2)} {unitSystem === "imperial" ? "cu yd" : "cu m"} (yields {totalVolumeCuFt.toFixed(1)} cu ft)
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-1">
                  Bags Needed ({bagSize} bags)
                </span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight text-white">
                    {selectedBags}
                  </span>
                  <span className="text-lg text-neutral-400 font-semibold">bags</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-1">
                  Estimated Dry Weight
                </span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-xl font-bold tracking-tight text-neutral-200">
                    {Math.round(estimatedWeightLbs).toLocaleString()}&nbsp;lbs
                  </span>
                  <span className="text-xs text-neutral-400">
                    (~{(estimatedWeightLbs / 2000).toFixed(2)} tons)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Call-to-Action Link */}
          <div className="border-t border-neutral-800 dark:border-neutral-800 pt-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-2">
              ⚠️ Approved Supplier Link
            </span>
            <a
              href={`https://www.lowes.com/search?searchTerm=concrete+mix+${bagSize}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-850 px-4 py-3 rounded-md border border-neutral-800 hover:border-neutral-600 transition-all"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Order {selectedBags} Bags at Lowe's</span>
                <span className="text-[10px] text-neutral-400">Store pickup or delivery</span>
              </div>
              <svg
                className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </Card>

        {/* Dynamic packaging matrix (Tabular numbers) */}
        <Card>
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-3">
            Bags Matrix By Size
          </h4>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500">
                <th className="py-2 font-medium">Bag Size</th>
                <th className="py-2 font-medium">Bag Yield</th>
                <th className="py-2 text-right font-medium">Required Bags</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">80 lb</td>
                <td className="py-2 text-neutral-500">0.60 cu ft</td>
                <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{bags80}</td>
              </tr>
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">60 lb</td>
                <td className="py-2 text-neutral-500">0.45 cu ft</td>
                <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{bags60}</td>
              </tr>
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">50 lb</td>
                <td className="py-2 text-neutral-500">0.375 cu ft</td>
                <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{bags50}</td>
              </tr>
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">40 lb</td>
                <td className="py-2 text-neutral-500">0.30 cu ft</td>
                <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{bags40}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
