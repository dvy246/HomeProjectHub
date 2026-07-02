import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import SaveMeasurementCard from "../ui/SaveMeasurementCard";
import { calculateRectArea, subtractOpenings } from "../../lib/geometry";
import { applyWasteFactor } from "../../lib/materialEngine";
import { saveRoom, getSavedRooms, type SavedRoom } from "../../lib/storage";
import { parseNumber } from "../../lib/helpers";

const COVERAGE_PER_GALLON = 350;
const _STANDARD_COATS = 2;

export default function PaintCalc() {
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

  useEffect(() => {
    setSavedRooms(getSavedRooms());
    const handler = () => setSavedRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);
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
            <h3 className="text-sm font-semibold tracking-tight">Room Dimensions</h3>
            <button
              type="button"
              onClick={() => setUnitSystem(unitSystem === "imperial" ? "metric" : "imperial")}
              className="text-xs px-2.5 py-1.5 rounded-md bg-[var(--bg-muted)] font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors"
            >
              {unitSystem === "imperial" ? "Switch to Metric" : "Switch to Imperial"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input label={unitSystem === "imperial" ? "Length (ft)" : "Length (m)"} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 12" />
            <Input label={unitSystem === "imperial" ? "Width (ft)" : "Width (m)"} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 14" />
            <Input label={unitSystem === "imperial" ? "Height (ft)" : "Height (m)"} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 8" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input label="Doors" type="number" inputMode="numeric" value={doors} onChange={(e) => setDoors(e.target.value)} placeholder="e.g. 2" min="0" />
            <Input label="Windows" type="number" inputMode="numeric" value={windows} onChange={(e) => setWindows(e.target.value)} placeholder="e.g. 2" min="0" />
            <Input label="Coats" type="number" inputMode="numeric" value={coats} onChange={(e) => setCoats(e.target.value)} placeholder="e.g. 2" min="1" />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={includeCeiling}
              onChange={(e) => setIncludeCeiling(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            Include ceiling
          </label>
        </Card>

        <SaveMeasurementCard
          roomName={roomName}
          onRoomNameChange={setRoomName}
          onSave={handleSave}
          successMessage={successMessage}
          savedRooms={savedRooms}
          onApplyRoom={applySavedRoom}
          heading="Save Room"
          placeholder="e.g. Living Room"
          projectsLabel="Load Saved Room:"
        />
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Paint Estimate</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Paintable Wall Area</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{Math.round(totalArea).toLocaleString()}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">sq ft</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Gallons Needed ({coatCount} coats)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{gallonsNeeded}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">gallons</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg-muted)]">Gross wall area</span>
                <span className="font-medium tabular-nums">{(roomPerimeter * htNum).toLocaleString()} sq ft</span>
              </div>
              {doorsSubtotal > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fg-muted)]">Less doors ({doorCount})</span>
                  <span className="font-medium tabular-nums text-[var(--error)]">-{doorsSubtotal} sq ft</span>
                </div>
              )}
              {windowsSubtotal > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fg-muted)]">Less windows ({windowCount})</span>
                  <span className="font-medium tabular-nums text-[var(--error)]">-{windowsSubtotal} sq ft</span>
                </div>
              )}
              {includeCeiling && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fg-muted)]">Ceiling area</span>
                  <span className="font-medium tabular-nums">+{ceilingArea.toLocaleString()} sq ft</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--fg-muted)]">Total with waste</span>
                <span className="font-medium tabular-nums">{Math.round(totalArea).toLocaleString()} sq ft</span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Shopping List</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Paint ({coatCount} coats)</span>
              <span className="text-sm font-bold tabular-nums">{gallonsNeeded} gallon{gallonsNeeded !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Primer (recommended)</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(gallonsNeeded * 0.5)} gallon{Math.ceil(gallonsNeeded * 0.5) !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Painter's tape (rolls)</span>
              <span className="text-sm font-bold tabular-nums">{Math.ceil(roomPerimeter / 60)} roll{Math.ceil(roomPerimeter / 60) !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
