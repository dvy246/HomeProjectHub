import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import MetalRoofDiagram from "../diagrams/MetalRoofDiagram";
import { calculateRectArea } from "../../lib/geometry";
import { applyWasteFactor, calculatePackaging } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { parseNumber } from "../../lib/helpers";
import { useI18n } from "../i18n/I18nProvider";

const METAL_PANEL_WIDTH = 36;
const METAL_PANEL_LENGTH = 144;

export default function MetalRoofCalc() {
  const { t } = useI18n();
  const [length, setLength] = useState<string>("40");
  const [width, setWidth] = useState<string>("30");
  const [pitch, setPitch] = useState<string>("6");
  const [panelWidth, setPanelWidth] = useState<string>("36");
  const [panelLength, setPanelLength] = useState<string>("144");
  const [wasteFactor, setWasteFactor] = useState<string>("7");
  const [roomName, setRoomName] = useState<string>("");
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("metal-roof", "Metal Roof Calculator");

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handler = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);
    return () => window.removeEventListener("saved-rooms-changed", handler);
  }, []);

  const lenNum = parseNumber(length);
  const widNum = parseNumber(width);
  const pitchNum = parseNumber(pitch);
  const pWidth = parseNumber(panelWidth) || METAL_PANEL_WIDTH;
  const pLength = parseNumber(panelLength) || METAL_PANEL_LENGTH;
  const waste = parseNumber(wasteFactor) / 100;

  const pitchFactor = Math.sqrt(1 + (pitchNum / 12) ** 2);
  const roofArea = calculateRectArea(lenNum, widNum) * pitchFactor;
  const areaWithWaste = applyWasteFactor(roofArea, waste);

  const panelCoverageSqFt = (pWidth / 12) * (pLength / 12);
  const panels = calculatePackaging(areaWithWaste, panelCoverageSqFt);
  const screws = Math.ceil(roofArea * 1.5);
  const closureStrips = Math.ceil((lenNum * pitchFactor) / (pWidth / 12)) * 2;

  const projectInputs: Record<string, number> = {
    length: lenNum,
    width: widNum,
    pitch: pitchNum,
    panelWidth: pWidth,
    panelLength: pLength,
    wasteFactor: parseNumber(wasteFactor),
  };
  const projectResults: Record<string, number> = {
    roofArea,
    areaWithWaste,
    panels,
    screws,
    closureStrips,
  };
  const projectMaterials: MaterialItem[] = [
    { name: "Metal Panels", quantity: panels, unit: "panels", category: "roofing" },
    { name: "Screws", quantity: screws, unit: "screws", category: "hardware" },
    { name: "Closure Strips", quantity: closureStrips, unit: "pairs", category: "roofing" },
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
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.roofing.metal.parameters') ?? 'Metal Roof Parameters'}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.roofing.metal.building_length_ft') ?? 'Building Length (ft)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 40'} />
            <Input label={t('calculators.detail.roofing.metal.building_width_ft') ?? 'Building Width (ft)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 30'} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Input label={t('calculators.detail.roofing.metal.roof_pitch') ?? 'Roof Pitch (rise per 12 in)'} type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 6'} />
            <Input label={t('calculators.detail.roofing.metal.waste_factor_pct') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 7'} helperText={t('calculators.detail.roofing.metal.waste_helper') ?? '5-10% for metal roofing'} />
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-xs font-medium text-[var(--fg-secondary)] mb-2">{t('calculators.detail.roofing.metal.panel_dimensions') ?? 'Panel Dimensions'}</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('calculators.detail.roofing.metal.panel_width_in') ?? 'Panel Coverage Width (inches)'} type="number" inputMode="decimal" value={panelWidth} onChange={(e) => setPanelWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 36'} />
              <Input label={t('calculators.detail.roofing.metal.panel_length_in') ?? 'Panel Length (inches)'} type="number" inputMode="decimal" value={panelLength} onChange={(e) => setPanelLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 144'} />
            </div>
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
          heading={t('calculators.detail.roofing.metal.save_roof_project') ?? 'Save Roof Project'}
          placeholder={t('calculators.detail.roofing.metal.save_placeholder') ?? 'e.g. Garage Metal Roof'}
          projectsLabel={t('calculators.detail.roofing.metal.saved_projects') ?? 'Saved Projects:'}
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
          <MetalRoofDiagram length={lenNum} width={widNum} pitch={pitchNum} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.roofing.metal.panel_output') ?? 'Metal Panel Output'}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.metal.total_roof_area') ?? 'Total Roof Area'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{roofArea.toFixed(0)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('units.sq_ft') ?? 'sq ft'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                {t('calculators.detail.roofing.metal.with_waste') ?? 'With waste'}: {areaWithWaste.toFixed(0)} {t('units.sq_ft') ?? 'sq ft'}
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.metal.panels_needed') ?? 'Metal Panels Needed'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{panels}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('calculators.detail.roofing.metal.panels_unit') ?? 'panels'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1 tabular-nums">
                {pWidth}{t('units.in') ?? 'in'} &times; {pLength}{t('units.in') ?? 'in'} {t('calculators.detail.roofing.metal.panels_unit') ?? 'panels'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.metal.screws_needed') ?? 'Screws Needed'}</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{screws.toLocaleString()}</span>
                  <span className="text-xs text-[var(--fg-muted)]">{t('calculators.detail.roofing.metal.screws_unit') ?? 'screws'}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.metal.closure_strips') ?? 'Closure Strips'}</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold tracking-tight">{closureStrips}</span>
                  <span className="text-xs text-[var(--fg-muted)]">{t('calculators.detail.roofing.metal.closure_strips_unit') ?? 'pairs'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">{t('calculators.detail.roofing.metal.additional_materials') ?? 'Additional Materials'}</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">{t('calculators.detail.roofing.metal.butyl_tape') ?? 'Butyl Tape (rolls)'}</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(roofArea / 100)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-medium">{t('calculators.detail.roofing.metal.ridge_cap') ?? 'Ridge Cap (linear ft)'}</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(lenNum * 1.1)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
