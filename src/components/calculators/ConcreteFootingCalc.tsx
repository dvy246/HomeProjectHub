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
    setSuccessMessage(`Successfully saved "${roomName.trim()}"!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Input Panel */}
      <div className="md:col-span-7 flex flex-col gap-6">
        <Card>
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Footing Parameters
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

          {/* Shape selection */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setFootingShape("cylinder")}
              className={`border rounded-md py-2.5 text-xs font-semibold transition-all ${
                footingShape === "cylinder"
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-800 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200"
              }`}
            >
              Cylindrical (Pier / Hole)
            </button>
            <button
              type="button"
              onClick={() => setFootingShape("block")}
              className={`border rounded-md py-2.5 text-xs font-semibold transition-all ${
                footingShape === "block"
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-800 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200"
              }`}
            >
              Square / Rectangular
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {footingShape === "cylinder" ? (
              <Input
                label={unitSystem === "imperial" ? "Hole Diameter (inches)" : "Hole Diameter (cm)"}
                type="number"
                inputMode="decimal"
                autocomplete="off"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                placeholder="e.g. 12…"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={unitSystem === "imperial" ? "Length (inches)" : "Length (cm)"}
                  type="number"
                  inputMode="decimal"
                  autocomplete="off"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 12…"
                />
                <Input
                  label={unitSystem === "imperial" ? "Width (inches)" : "Width (cm)"}
                  type="number"
                  inputMode="decimal"
                  autocomplete="off"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 12…"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={unitSystem === "imperial" ? "Hole Depth (inches)" : "Hole Depth (cm)"}
                type="number"
                inputMode="decimal"
                autocomplete="off"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="e.g. 36…"
              />
              <Input
                label="Number of Footings"
                type="number"
                inputMode="numeric"
                autocomplete="off"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 4…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Waste Factor (%)"
                type="number"
                inputMode="decimal"
                autocomplete="off"
                value={wasteFactor}
                onChange={(e) => setWasteFactor(e.target.value)}
                placeholder="e.g. 10…"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Bag Size</label>
                <select
                  value={bagSize}
                  onChange={(e) => setBagSize(e.target.value as any)}
                  className="w-full text-sm bg-transparent border rounded-md h-10 px-3 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-black dark:focus:border-white"
                >
                  <option value="80lb">80 lb bag</option>
                  <option value="60lb">60 lb bag</option>
                  <option value="50lb">50 lb bag</option>
                  <option value="40lb">40 lb bag</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Work */}
        <Card>
          <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-4">
            Save Footing Set
          </h4>
          <form onSubmit={handleSaveRoom} className="flex gap-2 items-end">
            <div className="flex-grow">
              <Input
                label="Save As (e.g. Deck Footings, Fence Posts)"
                type="text"
                autocomplete="off"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Deck Post Holes…"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-10">
              Save Set
            </Button>
          </form>
          {successMessage && (
            <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-2" aria-live="polite">
              {successMessage}
            </p>
          )}
        </Card>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 flex flex-col gap-6">
        <Card className="bg-black text-white dark:bg-neutral-950 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-6">
              Total Volume Required
            </h3>
            
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-1">
                  Required Volume (Including {wasteFactor}% Waste)
                </span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {unitSystem === "imperial"
                      ? totalVolumeCuYd.toFixed(3)
                      : totalVolumeCuM.toFixed(3)}
                  </span>
                  <span className="text-lg text-neutral-400 font-semibold">
                    {unitSystem === "imperial" ? "cu yd" : "cu m"}
                  </span>
                </div>
                <span className="text-xs text-neutral-400 block mt-1 tabular-nums">
                  Yields {totalVolumeWithWasteCuFt.toFixed(2)} cu ft total
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
                  Estimated Weight
                </span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-xl font-bold tracking-tight text-neutral-200">
                    {Math.round(estimatedWeightLbs).toLocaleString()}&nbsp;lbs
                  </span>
                </div>
              </div>
            </div>
          </div>

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
                <span className="text-[10px] text-neutral-400">Pick up in store</span>
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

        {/* Bags Matrix */}
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
