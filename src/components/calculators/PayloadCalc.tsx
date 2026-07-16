import React, { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { parseNumber } from "../../lib/helpers";

interface VehicleOption {
  id: string;
  name: string;
  payloadLbs: number;
  description: string;
}

const VEHICLES: VehicleOption[] = [
  { id: "sedan", name: "Compact Sedan / Hatchback", payloadLbs: 850, description: "Standard passenger car trunk and cabin limits." },
  { id: "suv", name: "Midsize SUV / Crossover", payloadLbs: 1100, description: "Folded-seats cargo bay capacity." },
  { id: "compact-pickup", name: "Compact Pickup (Tacoma, Ranger, Colorado)", payloadLbs: 1400, description: "Short-bed light-duty cargo limits." },
  { id: "half-ton", name: "Half-Ton Pickup (F-150, Silverado 1500, Ram 1500)", payloadLbs: 1850, description: "Standard consumer utility work truck." },
  { id: "three-quarter-ton", name: "3/4-Ton Pickup (F-250, Silverado 2500, Ram 2500)", payloadLbs: 3300, description: "Heavy-duty truck suspension limits." },
  { id: "trailer", name: "Single-Axle Utility Trailer (4x8 or 5x10)", payloadLbs: 2000, description: "Standard utility towing cargo weight limit." }
];

interface MaterialOption {
  id: string;
  name: string;
  unit: string;
  unitWeightLbs: number;
}

const MATERIALS: MaterialOption[] = [
  { id: "concrete-80", name: "80lb Concrete Mix Bags", unit: "bags", unitWeightLbs: 80 },
  { id: "concrete-60", name: "60lb Concrete Mix Bags", unit: "bags", unitWeightLbs: 60 },
  { id: "gravel-yd", name: "Gravel / Crushed Stone", unit: "cu yd", unitWeightLbs: 2800 },
  { id: "sand-yd", name: "Sand", unit: "cu yd", unitWeightLbs: 2700 },
  { id: "mulch-yd", name: "Mulch", unit: "cu yd", unitWeightLbs: 800 },
  { id: "drywall-sheet", name: "Drywall Sheets (1/2\" 4x8)", unit: "sheets", unitWeightLbs: 50 },
  { id: "stud-lumber", name: "Framing Studs (2x4x8)", unit: "studs", unitWeightLbs: 12 },
  { id: "brick", name: "Standard Clay Bricks", unit: "bricks", unitWeightLbs: 4.5 }
];

function PayloadCalc() {
  const { t } = useI18n();
  const [vehicleId, setVehicleId] = useState<string>("half-ton");
  const [materialId, setMaterialId] = useState<string>("concrete-80");
  const [quantity, setQuantity] = useState<string>("30");
  const [customWeightLbs, setCustomWeightLbs] = useState<string>("");
  const [useCustomWeight, setUseCustomWeight] = useState<boolean>(false);

  // Check URL query parameters on mount to prefill weight (linked from calculators)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const weight = params.get("weight");
      const material = params.get("material");
      if (weight) {
        setCustomWeightLbs(weight);
        setUseCustomWeight(true);
      }
      if (material) {
        const found = MATERIALS.find(m => m.name.toLowerCase().includes(material.toLowerCase()));
        if (found) setMaterialId(found.id);
      }
    }
  }, []);

  const selectedVehicle = VEHICLES.find(v => v.id === vehicleId) || VEHICLES[3];
  const selectedMaterial = MATERIALS.find(m => m.id === materialId) || MATERIALS[0];
  const qty = parseNumber(quantity);

  // Calculate weights
  const calculatedWeightLbs = qty * selectedMaterial.unitWeightLbs;
  const totalWeightLbs = useCustomWeight ? (parseFloat(customWeightLbs) || 0) : calculatedWeightLbs;

  // Math metrics
  const maxPayload = selectedVehicle.payloadLbs;
  const utilizationPercent = (totalWeightLbs / maxPayload) * 100;
  const tripsNeeded = Math.max(1, Math.ceil(totalWeightLbs / maxPayload));

  // Determine safety limits
  let safetyStatus: "safe" | "warning" | "danger" = "safe";
  let statusColor = "var(--success)";
  let statusText = "Safe Load Capacity";
  let statusDesc = "Your vehicle suspension can easily support this cargo weight. Make sure to distribute the load evenly and secure it from shifting.";

  if (utilizationPercent > 100) {
    safetyStatus = "danger";
    statusColor = "var(--error)";
    statusText = "EXCEEDS PAYLOAD CAPACITY!";
    statusDesc = `Danger: Carrying this load in a single trip exceeds your vehicle's payload limits by ${(totalWeightLbs - maxPayload).toLocaleString()} lbs. Overloading risks structural axle cracking, tire failure, or suspension bottoming. Split the cargo into multiple trips.`;
  } else if (utilizationPercent > 75) {
    safetyStatus = "warning";
    statusColor = "var(--warning)";
    statusText = "Heavy Load Warning";
    statusDesc = "Suspension is approaching max payload. Keep speeds low, increase stopping distances, inflate tires to recommended hot/cold limits, and avoid bumpy routes.";
  }

  // Calculate SVG Sag offsets (max 15px suspension compression)
  const sagOffset = Math.min(15, (totalWeightLbs / maxPayload) * 15);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Inputs Column */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-4">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Select Your Cargo Material</h3>
          </div>

          <div className="flex gap-4 items-center mb-4">
            <label className="flex items-center gap-2 text-xs text-[var(--fg-secondary)] cursor-pointer">
              <input
                type="radio"
                checked={!useCustomWeight}
                onChange={() => setUseCustomWeight(false)}
                className="w-3.5 h-3.5 accent-[var(--accent)]"
              />
              Standard Materials List
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--fg-secondary)] cursor-pointer">
              <input
                type="radio"
                checked={useCustomWeight}
                onChange={() => setUseCustomWeight(true)}
                className="w-3.5 h-3.5 accent-[var(--accent)]"
              />
              Custom Weight Input
            </label>
          </div>

          {!useCustomWeight ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Material Type"
                value={materialId}
                onChange={setMaterialId}
                options={MATERIALS.map(m => ({ value: m.id, label: `${m.name} (${m.unitWeightLbs} lbs/${m.unit})` }))}
              />
              <Input
                label={`Quantity Needed (${selectedMaterial.unit})`}
                type="number"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50"
              />
            </div>
          ) : (
            <Input
              label="Total Custom Material Weight (lbs)"
              type="number"
              inputMode="decimal"
              value={customWeightLbs}
              onChange={(e) => setCustomWeightLbs(e.target.value)}
              placeholder="e.g. 2400"
            />
          )}
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-4">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Select Transport Vehicle</h3>
          </div>
          <Select
            label="Hauling Vehicle"
            value={vehicleId}
            onChange={setVehicleId}
            options={VEHICLES.map(v => ({ value: v.id, label: `${v.name} (Max Payload: ${v.payloadLbs} lbs)` }))}
          />
          <p className="text-xs text-[var(--fg-secondary)] mt-2 leading-relaxed italic">
            Note: {selectedVehicle.description} Payload represents cargo weight + passengers. If you have passengers, reduce payload capacity accordingly.
          </p>
        </Card>
      </div>

      {/* Visualizer & Outputs Column */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Dynamic Truck Sag SVG Visualizer */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
          <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider self-start mb-2">Suspension Load Visualizer</span>
          
          <svg viewBox="0 0 200 100" className="w-full max-w-sm h-auto" role="img" aria-label="Hauling Truck Suspension Load State">
            {/* Ground line */}
            <line x1="10" y1="85" x2="190" y2="85" stroke="var(--border-strong)" strokeWidth="2.5" />
            
            {/* Cargo Load stack block in the truck bed (changes size based on weight) */}
            {totalWeightLbs > 0 && (
              <g transform={`translate(0, ${sagOffset * 0.4})`}>
                <rect
                  x="35"
                  y={Math.max(25, 60 - Math.min(30, (totalWeightLbs / maxPayload) * 20))}
                  width="70"
                  height={Math.min(30, (totalWeightLbs / maxPayload) * 20)}
                  fill={safetyStatus === "danger" ? "var(--error)" : "var(--accent)"}
                  fillOpacity="0.8"
                  rx="1"
                />
                <text x="70" y="45" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" opacity={totalWeightLbs > 500 ? 1 : 0}>
                  {totalWeightLbs.toLocaleString()} lbs
                </text>
              </g>
            )}

            {/* Truck Body & Chassis Group (Sags/Translates vertically based on sagOffset) */}
            <g transform={`translate(0, ${sagOffset * 0.6})`} className="transition-all duration-300">
              {/* Cabin */}
              <path d="M 105,65 L 140,65 L 145,65 L 145,52 L 132,44 L 110,44 Z" fill="var(--fg-secondary)" />
              <rect x="118" y="48" width="12" height="8" fill="var(--bg)" rx="1" />
              
              {/* Truck Cargo Box bed */}
              <rect x="30" y="55" width="76" height="15" fill="var(--fg-muted)" rx="1" />
              <line x1="30" y1="62" x2="105" y2="62" stroke="var(--border)" strokeWidth="1" />
            </g>

            {/* Wheels (Static on the ground, does not sag) */}
            <g>
              {/* Front Wheel */}
              <circle cx="128" cy="77" r="10" fill="var(--fg)" />
              <circle cx="128" cy="77" r="4" fill="var(--bg)" />

              {/* Rear Wheel (Suspension spring compression indicator line connects here) */}
              <circle cx="50" cy="77" r="10" fill="var(--fg)" />
              <circle cx="50" cy="77" r="4" fill="var(--bg)" />
              
              {/* Tension Springs SVG overlay */}
              <line x1="50" y1="64" x2="50" y2={77 - (sagOffset * 0.4)} stroke={safetyStatus === "danger" ? "var(--error)" : "var(--success)"} strokeWidth="2.5" strokeDasharray="2,1.5" />
            </g>
          </svg>
          
          <div className="w-full flex items-center justify-between text-xs font-semibold px-2 py-1 bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg">
            <span>Suspension Compression:</span>
            <span style={{ color: statusColor }}>{(sagOffset * 6.6).toFixed(0)}% Compressed</span>
          </div>
        </div>

        {/* Load Status Summary */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 card-elevated flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: statusColor }} />
            <div>
              <h4 className="text-sm font-bold" style={{ color: statusColor }}>{statusText}</h4>
              <span className="text-[10px] text-[var(--fg-muted)] font-mono">Payload Ratio: {utilizationPercent.toFixed(1)}%</span>
            </div>
          </div>

          <p className="text-xs text-[var(--fg-secondary)] leading-relaxed text-pretty">
            {statusDesc}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)] text-xs">
            <div>
              <span className="text-[var(--fg-muted)] block mb-0.5">Total Load Weight</span>
              <span className="text-lg font-bold text-[var(--fg)] tabular-nums">{Math.round(totalWeightLbs).toLocaleString()} lbs</span>
            </div>
            <div>
              <span className="text-[var(--fg-muted)] block mb-0.5">Recommended Trips</span>
              <span className="text-lg font-bold text-[var(--accent)] tabular-nums">{tripsNeeded} trip{tripsNeeded > 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Tire Pressure & Loading Guidelines */}
          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg p-3 text-[11px] leading-relaxed text-[var(--fg-secondary)] flex flex-col gap-1.5">
            <strong className="text-xs text-[var(--fg)] font-semibold flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Safety Loading Tips
            </strong>
            <p><strong>Tire pressure adjustment:</strong> Increase rear tire pressure by +3 to +5 PSI to support heavy load conditions (never exceed the maximum PSI listed on the tire wall).</p>
            <p><strong>Load distribution:</strong> Center the weight forward of the rear axle. Placing heavy material behind the rear bumper takes weight off the front wheels, ruining steering control.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(PayloadCalc);
