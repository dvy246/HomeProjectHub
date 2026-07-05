import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import PlywoodDeckDiagram from "../diagrams/PlywoodDeckDiagram";
import { calculateRectArea } from "../../lib/geometry";
import { applyWasteFactor, calculatePackaging } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { parseNumber } from "../../lib/helpers";
import { useI18n } from "../i18n/I18nProvider";

const _PLYWOOD_SHEET_AREA = 32;

export default function PlywoodDeckCalc() {
  const { t } = useI18n();
  const [length, setLength] = useState<string>("40");
  const [width, setWidth] = useState<string>("30");
  const [pitch, setPitch] = useState<string>("6");
  const [sheetSize, setSheetSize] = useState<"4x8" | "4x10" | "4x12">("4x8");
  const [wasteFactor, setWasteFactor] = useState<string>("10");
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("roofing-plywood", "Roof Plywood Calculator");

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

  const pitchFactor = Math.sqrt(1 + (pitchNum / 12) ** 2);
  const roofArea = calculateRectArea(lenNum, widNum) * pitchFactor;
  const areaWithWaste = applyWasteFactor(roofArea, waste);
  const sheets = calculatePackaging(areaWithWaste, sheetArea);
  const screws = Math.ceil(roofArea / 4);
  const hClips = Math.ceil((lenNum * pitchFactor) / 2);

  const projectInputs: Record<string, number> = {
    length: lenNum,
    width: widNum,
    pitch: pitchNum,
    wasteFactor: parseNumber(wasteFactor),
  };
  const projectResults: Record<string, number> = {
    roofArea,
    areaWithWaste,
    sheets,
    screws,
    hClips,
  };
  const projectMaterials: MaterialItem[] = [
    { name: "Plywood/OSB Sheets", quantity: sheets, unit: `sheets (${sheetSize})`, category: "lumber" },
    { name: "Fasteners", quantity: screws, unit: "screws", category: "hardware" },
    { name: "H-Clips", quantity: hClips, unit: "clips", category: "hardware" },
    { name: "Underlayment", quantity: Math.ceil(roofArea / 100), unit: "squares", category: "roofing" },
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
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.roofing.plywood_deck.parameters') ?? 'Deck / Sheathing Parameters'}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.roofing.plywood_deck.building_length_ft') ?? 'Building Length (ft)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 40'} />
            <Input label={t('calculators.detail.roofing.plywood_deck.building_width_ft') ?? 'Building Width (ft)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 30'} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label={t('calculators.detail.roofing.plywood_deck.roof_pitch') ?? 'Roof Pitch (rise per 12 in)'} type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 6'} />
            <Input label={t('calculators.detail.roofing.plywood_deck.waste_factor_pct') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 10'} />
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <Select label={t('calculators.detail.roofing.plywood_deck.sheet_size') ?? 'Sheet Size'} value={sheetSize} onChange={(v) => setSheetSize(v as "4x8" | "4x10" | "4x12")} options={[{ value: "4x8", label: t('calculators.detail.roofing.plywood_deck.sheet_4x8') ?? '4x8 (32 sq ft)' }, { value: "4x10", label: t('calculators.detail.roofing.plywood_deck.sheet_4x10') ?? '4x10 (40 sq ft)' }, { value: "4x12", label: t('calculators.detail.roofing.plywood_deck.sheet_4x12') ?? '4x12 (48 sq ft)' }]} />
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
          heading={t('calculators.detail.roofing.plywood_deck.save_deck_project') ?? 'Save Deck Project'}
          placeholder={t('calculators.detail.roofing.plywood_deck.save_placeholder') ?? 'e.g. Roof Sheathing'}
          projectsLabel={t('calculators.detail.roofing.plywood_deck.saved_projects') ?? 'Saved Projects:'}
        />
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

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <PlywoodDeckDiagram length={lenNum} width={widNum} pitch={pitchNum} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.roofing.plywood_deck.output') ?? 'Plywood / OSB Output'}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.plywood_deck.total_roof_area') ?? 'Total Roof Area'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{roofArea.toFixed(0)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('units.sq_ft') ?? 'sq ft'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                {t('calculators.detail.roofing.plywood_deck.with_waste') ?? 'With waste'}: {areaWithWaste.toFixed(0)} {t('units.sq_ft') ?? 'sq ft'}
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.plywood_deck.sheets_needed') ?? 'Sheets Needed'} ({sheetSize})</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{sheets}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('calculators.detail.roofing.plywood_deck.sheets_unit') ?? 'sheets'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">{sheetArea} {t('units.sq_ft') ?? 'sq ft'} {t('calculators.detail.roofing.plywood_deck.per_sheet') ?? 'per sheet'}</span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.plywood_deck.screws_nails') ?? 'Screws / Nails'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{screws.toLocaleString()}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('calculators.detail.roofing.plywood_deck.fasteners_unit') ?? 'fasteners'}</span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">{t('calculators.detail.roofing.plywood_deck.additional_materials') ?? 'Additional Materials'}</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">{t('calculators.detail.roofing.plywood_deck.h_clips') ?? 'H-Clips'}</span>
              <span className="text-sm font-bold tabular-nums">{hClips}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">{t('calculators.detail.roofing.plywood_deck.underlayment_squares') ?? 'Underlayment (squares)'}</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(roofArea / 100)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-medium">{t('calculators.detail.roofing.plywood_deck.drip_edge') ?? 'Drip Edge (linear ft)'}</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil((lenNum + widNum) * 2 * 1.1)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
