

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import UnitToggle from "../ui/UnitToggle";
import BagSizeSelector from "../ui/BagSizeSelector";
import ConcreteBagMatrix from "../ui/ConcreteBagMatrix";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import ConcreteSlabDiagram from "../diagrams/ConcreteSlabDiagram";
import PalletVisualizer from "../ui/PalletVisualizer";
import TruckVisualizer from "../ui/TruckVisualizer";
import { calculateRectArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { PRESETS } from "../../lib/presets";

type UnitSystem = "imperial" | "metric";

function convertValue(value: number, from: UnitSystem, to: UnitSystem, field: "length" | "thickness"): string {
  if (from === to) return String(value);
  if (field === "thickness") {
    return from === "imperial" ? (value * 2.54).toFixed(1) : (value / 2.54).toFixed(1);
  }
  return from === "imperial" ? (value / 3.281).toFixed(2) : (value * 3.281).toFixed(2);
}

export default function ConcreteSlabCalc() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [length, setLength] = useState<string>("10");
  const [width, setWidth] = useState<string>("10");
  const [thickness, setThickness] = useState<string>("4");
  const [wasteFactor, setWasteFactor] = useState<string>("10");
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [laborType, setLaborType] = useState<"diy" | "contractor">("diy");
  const [showMathStepper, setShowMathStepper] = useState<boolean>(false);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("concrete-slab", "Concrete Slab Calculator");

  // DOM Refs for focusing inputs from SVG click hotspots
  const lengthInputRef = useRef<HTMLInputElement>(null);
  const widthInputRef = useRef<HTMLInputElement>(null);
  const thicknessInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handler = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);
    return () => window.removeEventListener("saved-rooms-changed", handler);
  }, []);

  const handleUnitChange = useCallback((newUnit: UnitSystem) => {
    setUnitSystem((prev) => {
      if (prev === newUnit) return prev;
      setLength((v) => convertValue(parseFloat(v) || 0, prev, newUnit, "length"));
      setWidth((v) => convertValue(parseFloat(v) || 0, prev, newUnit, "length"));
      setThickness((v) => convertValue(parseFloat(v) || 0, prev, newUnit, "thickness"));
      return newUnit;
    });
  }, []);

  const lenNum = parseNumber(length);
  const widNum = parseNumber(width);
  const thickNum = parseNumber(thickness);
  const wastePercent = parseNumber(wasteFactor) / 100;

  let area = 0, volumeCuFt = 0, volumeCuYd = 0, volumeCuM = 0;

  if (unitSystem === "imperial") {
    area = calculateRectArea(lenNum, widNum);
    const thicknessFt = thickNum / 12;
    volumeCuFt = calculateVolume(area, thicknessFt);
    volumeCuYd = cuFeetToCuYards(volumeCuFt);
  } else {
    area = calculateRectArea(lenNum, widNum);
    const thicknessM = thickNum / 100;
    volumeCuM = calculateVolume(area, thicknessM);
    volumeCuFt = volumeCuM * 35.3147;
    volumeCuYd = cuFeetToCuYards(volumeCuFt);
  }

  const totalVolumeCuFt = applyWasteFactor(volumeCuFt, wastePercent);
  const totalVolumeCuYd = cuFeetToCuYards(totalVolumeCuFt);
  const totalVolumeCuM = totalVolumeCuFt / 35.3147;
  const selectedBags = calculateConcreteBags(totalVolumeCuFt, bagSize);
  const estimatedWeightLbs = estimateConcreteWeightLbs(totalVolumeCuFt);
  const bags80 = calculateConcreteBags(totalVolumeCuFt, "80lb");
  const bags60 = calculateConcreteBags(totalVolumeCuFt, "60lb");
  const bags50 = calculateConcreteBags(totalVolumeCuFt, "50lb");
  const bags40 = calculateConcreteBags(totalVolumeCuFt, "40lb");

  // Cost calculations
  const pricePerBag = bagSize === "80lb" ? 7.20 : bagSize === "60lb" ? 6.10 : bagSize === "50lb" ? 5.20 : 4.30;
  const materialCost = selectedBags * pricePerBag;
  const estimatedLaborCost = area * (unitSystem === "imperial" ? 8.50 : 91.50); // $8.50 per sq ft / $91.50 per sq m
  const readyMixCost = totalVolumeCuYd * 145 + 150; // $145/cy + $150 delivery fee

  const projectInputs = { length: lenNum, width: widNum, thickness: thickNum, wasteFactor: parseNumber(wasteFactor) };
  const projectResults = { volumeCuYd: totalVolumeCuYd, volumeCuM: totalVolumeCuM, bags80, bags60, bags50, bags40, weightLbs: estimatedWeightLbs };
  const projectMaterials: MaterialItem[] = [
    { name: `${bagSize} Concrete Mix`, quantity: selectedBags, unit: "bags", category: "Concrete" },
    { name: "Concrete (ready-mix)", quantity: totalVolumeCuYd, unit: "cu yd", category: "Concrete" },
  ];

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    saveRoom({ name: roomName.trim(), length: lenNum, width: widNum, height: thickNum, geometryType: "volume" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}" successfully`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    setLength(room.length.toString());
    setWidth(room.width.toString());
    if (room.height) setThickness(room.height.toString());
  };

  const handleDimensionClick = (dimension: "length" | "width" | "thickness") => {
    if (dimension === "length") {
      lengthInputRef.current?.focus();
      lengthInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (dimension === "width") {
      widthInputRef.current?.focus();
      widthInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (dimension === "thickness") {
      thicknessInputRef.current?.focus();
      thicknessInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Core Input Panel */}
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h2 className="text-sm font-semibold tracking-tight">Slab Parameters</h2>
            <UnitToggle unitSystem={unitSystem} onChange={handleUnitChange} />
          </div>

          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]">Size Presets</label>
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                if (idx > 0) {
                  const p = PRESETS.concrete[idx];
                  if (unitSystem === "imperial") {
                    setLength(p.length);
                    setWidth(p.width);
                    setThickness(p.thickness || "4");
                  } else {
                    setLength((parseFloat(p.length) * 0.3048).toFixed(2));
                    setWidth((parseFloat(p.width) * 0.3048).toFixed(2));
                    setThickness((parseFloat(p.thickness || "4") * 2.54).toFixed(0));
                  }
                }
              }}
              className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-9 px-2.5 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
            >
              {PRESETS.concrete.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              ref={lengthInputRef}
              label={unitSystem === "imperial" ? "Length (ft)" : "Length (m)"}
              name="length"
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 10"
              min="0"
              step="any"
              className="focus-within:ring-2 focus-within:ring-[var(--ring)]/10"
            />
            <Input
              ref={widthInputRef}
              label={unitSystem === "imperial" ? "Width (ft)" : "Width (m)"}
              name="width"
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 10"
              min="0"
              step="any"
              className="focus-within:ring-2 focus-within:ring-[var(--ring)]/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input
              ref={thicknessInputRef}
              label={unitSystem === "imperial" ? "Thickness (inches)" : "Thickness (cm)"}
              name="thickness"
              type="number"
              inputMode="decimal"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              placeholder="e.g. 4"
              min="0"
              step="any"
              className="focus-within:ring-2 focus-within:ring-[var(--ring)]/10"
            />
            <div>
              <label className="text-xs font-medium text-[var(--fg-secondary)] mb-1.5 block cursor-pointer">
                Waste Factor: {wasteFactor}%
              </label>
              <input
                type="range"
                aria-label="Waste Factor percentage"
                min="0"
                max="30"
                step="1"
                value={wasteFactor}
                onChange={(e) => setWasteFactor(e.target.value)}
                className="w-full h-1.5 bg-[var(--bg-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[9px] text-[var(--fg-muted)] mt-1 font-mono">
                <span>0% (Tight)</span>
                <span>10% (Std)</span>
                <span>30% (High)</span>
              </div>
            </div>
          </div>

          <BagSizeSelector bagSize={bagSize} onChange={setBagSize} />
        </Card>

        {/* Cost dial / labor mode */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Cost &amp; Labor Estimator
            </h4>
            <div className="flex bg-[var(--bg-muted)] p-0.5 rounded-lg text-xs">
              <button
                type="button"
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  laborType === "diy"
                    ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                }`}
                onClick={() => setLaborType("diy")}
              >
                DIY Material Only
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  laborType === "contractor"
                    ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                }`}
                onClick={() => setLaborType("contractor")}
              >
                Hired Contractor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {laborType === "diy" ? (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Estimated DIY Expense</span>
                <span className="text-3xl font-extrabold text-[var(--fg)] tabular-nums">
                  ${Math.round(materialCost).toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--fg-muted)]">
                  Based on {selectedBags} bags ({bagSize}) at ${pricePerBag.toFixed(2)}/ea. Ready-mix cost: ~${Math.round(readyMixCost)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Estimated Hired Labor + Materials</span>
                <span className="text-3xl font-extrabold text-[var(--fg)] tabular-nums">
                  ${Math.round(materialCost + estimatedLaborCost).toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--fg-muted)]">
                  Includes ~${Math.round(estimatedLaborCost).toLocaleString()} labor fees (${unitSystem === "imperial" ? "$8.50/sq ft" : "$91.50/sq m"})
                </span>
              </div>
            )}
            <div className="bg-[var(--bg-inset)] p-3 border border-[var(--border)] rounded-lg text-xs text-[var(--fg-muted)] leading-relaxed">
              {laborType === "diy" ? (
                <p>
                  <strong>DIY note:</strong> You save on contractor fees but need tools (wheelbarrow, floats, screed, shovel) and helper hands. 1 cubic yard requires ~45 bags of 80lb mix.
                </p>
              ) : (
                <p>
                  <strong>Contractor note:</strong> Includes subgrade preparation, setting wooden formwork, placing reinforcement mesh/rebar, pouring, and trowel finish.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Stepper Math Walkthrough */}
        <Card className="overflow-hidden">
          <button
            type="button"
            className="flex items-center justify-between w-full text-left focus:outline-none"
            onClick={() => setShowMathStepper(!showMathStepper)}
            aria-expanded={showMathStepper}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Visual Step-by-Step Math Breakdown
            </span>
            <svg
              className={`w-4 h-4 text-[var(--fg-muted)] transition-transform duration-200 ${
                showMathStepper ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className="accordion-content"
            data-open={showMathStepper ? "true" : "false"}
          >
            <div>
              <div className="pt-5 border-t border-[var(--border)] mt-4 flex flex-col gap-4 text-xs leading-relaxed text-[var(--fg-muted)]">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-muted)] text-[var(--fg)] font-bold text-[10px] shrink-0">1</span>
                  <div>
                    <strong className="text-[var(--fg)] block mb-0.5">Calculate Surface Area</strong>
                    <span>Multiply Length ({lenNum} {unitSystem === "imperial" ? "ft" : "m"}) by Width ({widNum} {unitSystem === "imperial" ? "ft" : "m"}):</span>
                    <div className="font-mono bg-[var(--bg-inset)] p-1.5 rounded mt-1 text-[var(--fg)] w-fit">
                      Area = {lenNum} &times; {widNum} = {area.toFixed(2)} {unitSystem === "imperial" ? "sq ft" : "sq m"}
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-muted)] text-[var(--fg)] font-bold text-[10px] shrink-0">2</span>
                  <div>
                    <strong className="text-[var(--fg)] block mb-0.5">Convert Thickness to Base Units</strong>
                    {unitSystem === "imperial" ? (
                      <span>Convert thickness ({thickNum} inches) to feet by dividing by 12:</span>
                    ) : (
                      <span>Convert thickness ({thickNum} cm) to meters by dividing by 100:</span>
                    )}
                    <div className="font-mono bg-[var(--bg-inset)] p-1.5 rounded mt-1 text-[var(--fg)] w-fit">
                      Thickness = {thickNum} &divide; {unitSystem === "imperial" ? "12" : "100"} = {(unitSystem === "imperial" ? thickNum / 12 : thickNum / 100).toFixed(4)} {unitSystem === "imperial" ? "ft" : "m"}
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-muted)] text-[var(--fg)] font-bold text-[10px] shrink-0">3</span>
                  <div>
                    <strong className="text-[var(--fg)] block mb-0.5">Compute Volume with Waste</strong>
                    <span>Multiply Area by converted Thickness, then apply the {wasteFactor}% safety margin:</span>
                    <div className="font-mono bg-[var(--bg-inset)] p-1.5 rounded mt-1 text-[var(--fg)] w-fit">
                      Volume = {volumeCuFt.toFixed(2)} cu ft + {wasteFactor}% = {totalVolumeCuFt.toFixed(2)} cu ft
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg-muted)] text-[var(--fg)] font-bold text-[10px] shrink-0">4</span>
                  <div>
                    <strong className="text-[var(--fg)] block mb-0.5">Convert to Output Units</strong>
                    <span>Divide cubic feet by 27 to find cubic yards:</span>
                    <div className="font-mono bg-[var(--bg-inset)] p-1.5 rounded mt-1 text-[var(--fg)] w-fit">
                      Cubic Yards = {totalVolumeCuFt.toFixed(2)} &divide; 27 = {totalVolumeCuYd.toFixed(2)} cu yd
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Saved workspace & projects modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SaveMeasurementCard
            roomName={roomName}
            onRoomNameChange={setRoomName}
            onSave={handleSaveRoom}
            successMessage={successMessage}
            savedRooms={savedRooms}
            onApplyRoom={applySavedRoom}
            placeholder="e.g. Backyard Patio"
            projectsLabel="Apply Saved Dimensions:"
            showDimensions
          />
          <div id="add-to-project-section">
            <AddToProjectCard
              projects={projects}
              onAdd={(pid) => {
                clearSuccess();
                addToProject(pid, projectInputs, projectResults, projectMaterials);
              }}
              successMessage={projectSuccess}
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Interactive Diagram Hotspot Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <ConcreteSlabDiagram
            length={lenNum}
            width={widNum}
            thickness={thickNum}
            unitSystem={unitSystem}
            onDimensionClick={handleDimensionClick}
          />
        </div>

        {/* Results Card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h2 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Results</h2>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Required Volume (incl. {wasteFactor}% waste)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight break-all">
                  {unitSystem === "imperial" ? totalVolumeCuYd.toFixed(2) : totalVolumeCuM.toFixed(2)}
                </span>
                <span className="text-base text-[var(--fg-muted)] font-medium">
                  {unitSystem === "imperial" ? "cu yd" : "cu m"}
                </span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                Raw: {unitSystem === "imperial" ? volumeCuYd.toFixed(2) : volumeCuM.toFixed(2)} {unitSystem === "imperial" ? "cu yd" : "cu m"} ({totalVolumeCuFt.toFixed(1)} cu ft)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Bags ({bagSize})</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight break-all">{selectedBags}</span>
                  <span className="text-xs text-[var(--fg-muted)]">bags</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Dry Weight</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight break-all">{Math.round(estimatedWeightLbs).toLocaleString()}</span>
                  <span className="text-xs text-[var(--fg-muted)]">lbs</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--border)] mt-1">
              <a
                href="#add-to-project-section"
                className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors text-center shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Save to Project Planner
              </a>
            </div>
          </div>
        </div>

        {/* Real-Time Logistics Visualizers */}
        <PalletVisualizer bagCount={selectedBags} bagSize={bagSize} />
        <TruckVisualizer volumeCuYd={totalVolumeCuYd} />

        {/* Bags Matrix */}
        <ConcreteBagMatrix bags80={bags80} bags60={bags60} bags50={bags50} bags40={bags40} />
      </div>
    </div>
  );
}
