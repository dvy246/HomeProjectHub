import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

const REBAR_WEIGHTS: Record<string, number> = { "#3": 0.376, "#4": 0.668, "#5": 1.043, "#6": 1.502, "#7": 2.044, "#8": 2.67 };
const REBAR_SIZES = Object.keys(REBAR_WEIGHTS);

export default function RebarCalc() {
  const [length, setLength] = useState<string>("20");
  const [width, setWidth] = useState<string>("12");
  const [spacing, setSpacing] = useState<string>("18");
  const [rebarSize, setRebarSize] = useState<string>("#4");
  const [layers, setLayers] = useState<string>("1");
  const [wasteFactor, setWasteFactor] = useState<string>("5");

  const len = parseNumber(length);
  const wid = parseNumber(width);
  const sp = Math.max(1, parseNumber(spacing));
  const layersNum = Math.max(1, parseNumber(layers));
  const waste = parseNumber(wasteFactor) / 100;

  const weightPerFt = REBAR_WEIGHTS[rebarSize] || 0.668;

  const canCompute = len > 0 && wid > 0;
  const longBars = canCompute ? Math.ceil(wid * 12 / sp) + 1 : 0;
  const shortBars = canCompute ? Math.ceil(len * 12 / sp) + 1 : 0;

  const longBarLength = len * longBars;
  const shortBarLength = wid * shortBars;

  const totalLength = (longBarLength + shortBarLength) * layersNum;
  const lengthWithWaste = totalLength * (1 + waste);
  const totalWeight = lengthWithWaste * weightPerFt / 2000;
  const ties = Math.ceil(longBars * shortBars * layersNum * 1.1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Slab Dimensions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Slab Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 20" />
            <Input label="Slab Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 12" />
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Rebar Configuration</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Rebar Spacing (inches)" type="number" inputMode="decimal" value={spacing} onChange={(e) => setSpacing(e.target.value)} placeholder="e.g. 18" helperText="Center-to-center spacing" />
            <Input label="Layers" type="number" inputMode="numeric" value={layers} onChange={(e) => setLayers(e.target.value)} placeholder="e.g. 1" helperText="1 for slab, 2 for double mat" />
          </div>
          <div className="mb-4">
            <p className="text-xs font-medium text-[var(--fg-secondary)] mb-2">Rebar Size</p>
            <div className="grid grid-cols-6 gap-1.5">
              {REBAR_SIZES.map((s) => (
                <button key={s} type="button" onClick={() => setRebarSize(s)} className={`border rounded-lg py-2 text-xs font-semibold font-mono transition-all active:scale-[0.97] ${rebarSize === s ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>{s}</button>
              ))}
            </div>
          </div>
          <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 5" helperText="5-10% for lap splices and cuts" />
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Rebar Output</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Total Rebar Length</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{lengthWithWaste.toFixed(0)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">linear ft</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">{rebarSize} rebar, {spacing}" o.c., {layersNum} layer(s)</span>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Total Weight</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{totalWeight.toFixed(2)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">tons</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Long Bars ({len} ft)</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-xl font-bold">{longBars}</span>
                  <span className="text-xs text-[var(--fg-muted)]">bars</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Short Bars ({wid} ft)</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-xl font-bold">{shortBars}</span>
                  <span className="text-xs text-[var(--fg-muted)]">bars</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Rebar Ties Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold">{ties.toLocaleString()}</span>
                <span className="text-xs text-[var(--fg-muted)]">ties</span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Rebar Size Reference</h3>
          <div className="flex flex-col gap-1">
            {REBAR_SIZES.map((s) => {
              const diam = { "#3": "⅜", "#4": "½", "#5": "⅝", "#6": "¾", "#7": "⅞", "#8": "1" }[s];
              return (
                <div key={s} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm"><span className="font-mono font-semibold">{s}</span> ({diam} in)</span>
                  <span className="text-xs text-[var(--fg-muted)]">{REBAR_WEIGHTS[s]} lb/ft</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
