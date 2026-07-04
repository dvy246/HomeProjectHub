import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import RoofShinglesDiagram from "../diagrams/RoofShinglesDiagram";
import { calculateRectArea } from "../../lib/geometry";
import { applyWasteFactor, calculatePackaging } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { parseNumber } from "../../lib/helpers";

const SHINGLE_COVERAGE_PER_BUNDLE = 33.33;

export default function RoofShingleCalc() {
  const [roofShape, setRoofShape] = useState<"gable" | "hip">("gable");
  const [length, setLength] = useState<string>("40");
  const [width, setWidth] = useState<string>("30");
  const [pitch, setPitch] = useState<string>("4");
  const [wasteFactor, setWasteFactor] = useState<string>("12");
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("roofing-shingles", "Roof Shingle Calculator");

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

  const pitchFactor = Math.sqrt(1 + (pitchNum / 12) ** 2);

  let roofArea = 0;
  if (roofShape === "gable") {
    const halfWidth = widNum / 2;
    const oneSide = calculateRectArea(lenNum, halfWidth) * pitchFactor;
    roofArea = oneSide * 2;
  } else {
    roofArea = calculateRectArea(lenNum, widNum) * pitchFactor * 1.06;
  }

  const areaWithWaste = applyWasteFactor(roofArea, waste);
  const squares = areaWithWaste / 100;
  const bundles = calculatePackaging(areaWithWaste, SHINGLE_COVERAGE_PER_BUNDLE);
  const nails = Math.ceil(squares * 4);
  const underlayment = Math.ceil(areaWithWaste / 400);

  const projectInputs: Record<string, number> = {
    length: lenNum,
    width: widNum,
    pitch: pitchNum,
    wasteFactor: parseNumber(wasteFactor),
  };
  const projectResults: Record<string, number> = {
    roofArea,
    areaWithWaste,
    squares,
    bundles,
    nails,
    underlayment,
  };
  const projectMaterials: MaterialItem[] = [
    { name: "Shingle Bundles", quantity: bundles, unit: "bundles", category: "roofing" },
    { name: "Underlayment", quantity: underlayment, unit: "rolls", category: "roofing" },
    { name: "Nails", quantity: nails, unit: "lb boxes", category: "hardware" },
  ];

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
            <h3 className="text-sm font-semibold tracking-tight">Roof Parameters</h3>
          </div>

          <Select label="Roof Shape" value={roofShape} onChange={(v) => setRoofShape(v as "gable" | "hip")} options={[{ value: "gable", label: "Gable Roof" }, { value: "hip", label: "Hip Roof" }]} />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Building Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 40" />
            <Input label="Building Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label="Roof Pitch (rise per 12 in)" type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="e.g. 4" helperText="Common: 4, 6, 8, 12" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 12" helperText="12-15% recommended for shingles" />
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SaveMeasurementCard
          roomName={roomName}
          onRoomNameChange={setRoomName}
          onSave={handleSave}
          successMessage={successMessage}
          savedRooms={savedRooms}
          onApplyRoom={applySavedRoom}
          heading="Save Roof Project"
          placeholder="e.g. House Roof"
          projectsLabel="Saved Projects:"
        />
        <div id="add-to-project-section" className="flex-1">
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
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <RoofShinglesDiagram shape={roofShape} length={lenNum} width={widNum} pitch={pitchNum} />
        </div>
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

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Additional Materials</h3>
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
