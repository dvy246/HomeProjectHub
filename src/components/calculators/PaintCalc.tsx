
import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { PRESETS } from "../../lib/presets";
import { calculateRectArea, subtractOpenings } from "../../lib/geometry";
import { applyWasteFactor } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { parseNumber } from "../../lib/helpers";
import PaintDiagram from "../diagrams/PaintDiagram";
import ProjectPlaybook from "./ProjectPlaybook";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const COVERAGE_PER_GALLON = 350;
const _STANDARD_COATS = 2;

function PaintCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("14");
  const [height, setHeight] = useState("8");
  const [doors, setDoors] = useState("2");
  const [windows, setWindows] = useState("2");
  const [coats, setCoats] = useState("2");
  const [includeCeiling, setIncludeCeiling] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPlaybook, setShowPlaybook] = useState<boolean>(false);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("paint", "Paint Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [unitSystem, length, width, height, doors, windows, coats, includeCeiling, onCalculate]);

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handler = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);

    // Read URL search params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const l = params.get("length");
      const w = params.get("width");
      if (l) setLength(l);
      if (w) setWidth(w);
    }

    return () => window.removeEventListener("saved-rooms-changed", handler);
  }, []);

  const lenNum = parseNumber(length);
  const widNum = parseNumber(width);
  const htNum = parseNumber(height);
  const doorCount = Math.max(0, Math.round(parseNumber(doors)));
  const windowCount = Math.max(0, Math.round(parseNumber(windows)));
  const coatCount = Math.max(1, Math.round(parseNumber(coats)));

  const roomPerimeter = 2 * (lenNum + widNum);
  let wallArea = roomPerimeter * htNum;

  wallArea = subtractOpenings(wallArea, [
    { type: "door", count: doorCount },
    { type: "window", count: windowCount },
  ]);

  const ceilingArea = includeCeiling ? calculateRectArea(lenNum, widNum) : 0;
  const totalArea = applyWasteFactor(wallArea + ceilingArea, 0.05);
  const totalWithCoats = totalArea * coatCount;
  const gallonsNeeded = Math.ceil(totalWithCoats / COVERAGE_PER_GALLON);

  const doorsSubtotal = doorCount * 21;
  const windowsSubtotal = windowCount * 12;

  const projectInputs: Record<string, number> = {
    length: lenNum,
    width: widNum,
    height: htNum,
    doors: doorCount,
    windows: windowCount,
    coats: coatCount,
    includeCeiling: includeCeiling ? 1 : 0,
  };
  const projectResults: Record<string, number> = {
    wallArea,
    ceilingArea,
    totalArea,
    totalWithCoats,
    gallonsNeeded,
  };
  const projectMaterials: MaterialItem[] = [
    { name: "Paint", quantity: gallonsNeeded, unit: "gallons", category: "paint" },
    { name: "Primer", quantity: Math.ceil(gallonsNeeded * 0.5), unit: "gallons", category: "paint" },
    { name: "Painter's Tape", quantity: Math.ceil(roomPerimeter / 60), unit: "rolls", category: "supplies" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    saveRoom({ name: roomName.trim(), length: lenNum, width: widNum, height: htNum, geometryType: "area" });
    setRoomName("");
    setSuccessMessage(`Saved "${roomName.trim()}"`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const applySavedRoom = (room: SavedRoom) => {
    setLength(room.length.toString());
    setWidth(room.width.toString());
    if (room.height) setHeight(room.height.toString());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
            <h2 className="text-sm font-semibold tracking-tight">{t('calculators.detail.finishing.paint.room_dimensions') ?? 'Room Dimensions'}</h2>
            <button
              type="button"
              onClick={() => setUnitSystem(unitSystem === "imperial" ? "metric" : "imperial")}
              className="text-xs px-2.5 py-1.5 rounded-md bg-[var(--bg-muted)] font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors"
            >
              {unitSystem === "imperial" ? t('calculators.detail.finishing.paint.switch_to_metric') ?? 'Switch to Metric' : t('calculators.detail.finishing.paint.switch_to_imperial') ?? 'Switch to Imperial'}
            </button>
          </div>

          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]">{t('calculators.common.size_presets') ?? 'Standard Room Presets'}</label>
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                if (idx > 0) {
                  const p = PRESETS.rooms[idx];
                  if (unitSystem === "imperial") {
                    setLength(p.length);
                    setWidth(p.width);
                    setHeight(p.height || "8");
                  } else {
                    setLength((parseFloat(p.length) * 0.3048).toFixed(2));
                    setWidth((parseFloat(p.width) * 0.3048).toFixed(2));
                    setHeight((parseFloat(p.height || "8") * 0.3048).toFixed(2));
                  }
                }
              }}
              className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-2.5 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
            >
              {PRESETS.rooms.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input label={unitSystem === "imperial" ? (t('fields.length_ft') ?? 'Length (ft)') : (t('fields.length_m') ?? 'Length (m)')} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 12'} />
            <Input label={unitSystem === "imperial" ? (t('fields.width_ft') ?? 'Width (ft)') : (t('fields.width_m') ?? 'Width (m)')} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 14'} />
            <Input label={unitSystem === "imperial" ? (t('fields.height_ft') ?? 'Height (ft)') : (t('fields.height_m') ?? 'Height (m)')} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 8'} />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input label={t('calculators.detail.finishing.paint.doors') ?? 'Doors'} type="number" inputMode="numeric" value={doors} onChange={(e) => setDoors(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 2'} min="0" />
            <Input label={t('calculators.detail.finishing.paint.windows') ?? 'Windows'} type="number" inputMode="numeric" value={windows} onChange={(e) => setWindows(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 2'} min="0" />
            <Input label={t('calculators.detail.finishing.paint.coats') ?? 'Coats'} type="number" inputMode="numeric" value={coats} onChange={(e) => setCoats(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 2'} min="1" />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={includeCeiling}
              onChange={(e) => setIncludeCeiling(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            {t('calculators.detail.finishing.paint.include_ceiling') ?? 'Include ceiling'}
          </label>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SaveMeasurementCard
          roomName={roomName}
          onRoomNameChange={setRoomName}
          onSave={handleSave}
          successMessage={successMessage}
          savedRooms={savedRooms}
          onApplyRoom={applySavedRoom}
          heading={t('calculators.detail.finishing.paint.save_room') ?? 'Save Room'}
          placeholder={t('calculators.common.placeholder') ?? 'e.g. Living Room'}
          projectsLabel={t('calculators.detail.finishing.paint.load_saved_room') ?? 'Load Saved Room:'}
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
          <PaintDiagram width={Math.max(lenNum, widNum)} height={htNum} numDoors={doorCount} numWindows={windowCount} unitSystem={unitSystem} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h2 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.finishing.paint.paint_estimate') ?? 'Paint Estimate'}</h2>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.finishing.paint.paintable_wall_area') ?? 'Paintable Wall Area'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{Math.round(totalArea).toLocaleString()}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('units.sq_ft') ?? 'sq ft'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.finishing.paint.gallons_needed', { coatCount }) ?? `Gallons Needed (${coatCount} coats)`}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{gallonsNeeded}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('calculators.detail.finishing.paint.gallons') ?? 'gallons'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg-muted)]">{t('calculators.detail.finishing.paint.gross_wall_area') ?? 'Gross wall area'}</span>
                <span className="font-medium tabular-nums">{(roomPerimeter * htNum).toLocaleString()} {t('units.sq_ft') ?? 'sq ft'}</span>
              </div>
              {doorsSubtotal > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fg-muted)]">{t('calculators.detail.finishing.paint.less_doors', { doorCount }) ?? `Less doors (${doorCount})`}</span>
                  <span className="font-medium tabular-nums text-[var(--error)]">-{doorsSubtotal} {t('units.sq_ft') ?? 'sq ft'}</span>
                </div>
              )}
              {windowsSubtotal > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fg-muted)]">{t('calculators.detail.finishing.paint.less_windows', { windowCount }) ?? `Less windows (${windowCount})`}</span>
                  <span className="font-medium tabular-nums text-[var(--error)]">-{windowsSubtotal} {t('units.sq_ft') ?? 'sq ft'}</span>
                </div>
              )}
              {includeCeiling && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fg-muted)]">{t('calculators.detail.finishing.paint.ceiling_area') ?? 'Ceiling area'}</span>
                  <span className="font-medium tabular-nums">+{ceilingArea.toLocaleString()} {t('units.sq_ft') ?? 'sq ft'}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--fg-muted)]">{t('calculators.detail.finishing.paint.total_with_waste') ?? 'Total with waste'}</span>
                <span className="font-medium tabular-nums">{Math.round(totalArea).toLocaleString()} {t('units.sq_ft') ?? 'sq ft'}</span>
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
                {t('calculators.common.save_to_planner') ?? 'Save to Project Planner'}
              </a>
            </div>
          </div>
        </div>

        <Card>
          <h2 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">{t('calculators.detail.finishing.paint.shopping_list') ?? 'Shopping List'}</h2>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">{t('calculators.detail.finishing.paint.paint_coats', { coatCount }) ?? `Paint (${coatCount} coats)`}</span>
              <span className="text-sm font-bold tabular-nums">{gallonsNeeded} {t('calculators.detail.finishing.paint.gallon', { count: gallonsNeeded }) ?? `gallon${gallonsNeeded !== 1 ? 's' : ''}`}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">{t('calculators.detail.finishing.paint.primer_recommended') ?? 'Primer (recommended)'}</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(gallonsNeeded * 0.5)} {t('calculators.detail.finishing.paint.gallon', { count: Math.ceil(gallonsNeeded * 0.5) }) ?? `gallon${Math.ceil(gallonsNeeded * 0.5) !== 1 ? 's' : ''}`}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">{t('calculators.detail.finishing.paint.painters_tape') ?? "Painter's tape (rolls)"}</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(roomPerimeter / 60)} {t('calculators.detail.finishing.paint.roll', { count: Math.ceil(roomPerimeter / 60) }) ?? `roll${Math.ceil(roomPerimeter / 60) !== 1 ? 's' : ''}`}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-12">
        <button
          type="button"
          onClick={() => setShowPlaybook(!showPlaybook)}
          className="w-full flex items-center justify-between px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border-hover)] transition-all text-left cursor-pointer"
          aria-expanded={showPlaybook}
        >
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 text-[var(--accent)] transition-transform ${showPlaybook ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            <div>
              <span className="text-sm font-semibold text-[var(--fg)]">View Project Playbook</span>
              <p className="text-xs text-[var(--fg-muted)]">Complete execution plan with checkpoints, tools, and timeline</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-[var(--fg-muted)] transition-transform ${showPlaybook ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {showPlaybook && (
          <ProjectPlaybook
            workflowId="room"
            calculatorInputs={{ length: parseFloat(length), width: parseFloat(width), height: parseFloat(height) }}
            results={{ wallArea, totalArea, gallonsNeeded }}
            materials={projectMaterials}
          />
        )}
      </div>
    </div>
  );
}

export default withI18n(PaintCalc);
