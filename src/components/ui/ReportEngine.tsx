import React from "react";
import { useI18n } from "../i18n/I18nProvider";
import {
  type ReportInputItem,
  type ReportMaterialItem,
  type ReportMetrics,
  getWasteExplanationKey,
  getDeliveryKey,
  getMixingKey,
} from "../../lib/reportEngine";

export interface ReportEngineProps {
  calculatorId: string;
  inputs: Record<string, ReportInputItem>;
  results: Record<string, ReportInputItem>;
  materials: ReportMaterialItem[];
  metrics: ReportMetrics;
}

export const ReportEngine: React.FC<ReportEngineProps> = ({
  calculatorId,
  inputs,
  results,
  materials,
  metrics,
}) => {
  const { t } = useI18n();

  const getTranslation = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
    const val = t(key, params);
    return val !== undefined ? val : (fallback || key);
  };

  // 1. Project Summary Section
  const renderSummary = () => {
    if (calculatorId === "concrete-slab") {
      const length = inputs.length?.value || 0;
      const width = inputs.width?.value || 0;
      const thickness = inputs.thickness?.value || 0;
      const area = results.area?.value || 0;
      const areaUnit = results.area?.unit || "sq ft";
      const unit = inputs.length?.unit || "ft";

      return (
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
          {getTranslation(
            "report.summary.concrete_slab",
            { length, width, thickness, area: area.toFixed(1), areaUnit, unit },
            `You are planning a concrete slab project measuring ${length} ${unit} in length by ${width} ${unit} in width, with a thickness of ${thickness} inches. This covers a total surface area of ${area.toFixed(1)} ${areaUnit}.`
          )}
        </p>
      );
    }

    if (calculatorId === "drywall") {
      const wallLengths = inputs.wallLengths?.value || 0;
      const wallHeight = inputs.wallHeight?.value || 0;
      const wallArea = results.wallArea?.value || 0;

      return (
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
          {getTranslation(
            "report.summary.drywall",
            { wallLengths, wallHeight, wallArea: wallArea.toFixed(0) },
            `You are planning a drywall installation with a total wall length of ${wallLengths} ft and wall height of ${wallHeight} ft, covering a total surface wall area of ${wallArea.toFixed(0)} sq ft.`
          )}
        </p>
      );
    }

    return (
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
        {getTranslation(
          "report.summary.fallback",
          { calculatorId },
          `Calculating project dimensions for ${calculatorId.replace(/-/g, " ")}. The inputs entered have been processed using standard volumetric, structural, or coverage algorithms to estimate target values.`
        )}
      </p>
    );
  };

  // 2. Material Breakdown Section
  const renderMaterialBreakdown = () => {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
          {getTranslation("report.breakdown.intro", undefined, "Based on your input parameters, the following exact quantities are required for the installation:")}
        </p>
        <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--bg-inset)] border-b border-[var(--border)] text-[var(--fg-secondary)]">
                <th className="p-3 font-semibold">{getTranslation("report.breakdown.col_item", undefined, "Material / Tool Item")}</th>
                <th className="p-3 font-semibold text-right">{getTranslation("report.breakdown.col_qty", undefined, "Required Quantity")}</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-inset)]/40 transition-colors">
                  <td className="p-3 text-[var(--fg)] font-medium">{mat.name}</td>
                  <td className="p-3 text-right font-semibold tabular-nums text-[var(--fg)]">
                    {mat.quantity.toFixed(1)} {mat.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 3. Waste Explanation Section
  const renderWasteExplanation = () => {
    const wastePercent = (metrics.wasteFactorPercent || 0) * 100;
    const wasteKeySuffix = getWasteExplanationKey(metrics.wasteFactorPercent || 0);

    const fallbacks = {
      high: `A high waste allowance of ${wastePercent.toFixed(0)}% was included. This is highly recommended for projects with complex geometries, circular cutouts, irregular corners, or uneven subgrade levels to ensure you do not run short.`,
      low: `A very tight waste margin of ${wastePercent.toFixed(0)}% has been specified. Ensure that your formwork is highly accurate and there is minimal spillage during placement, as this leaves very little margin for error.`,
      normal: `A standard waste allowance of ${wastePercent.toFixed(0)}% has been factored in to compensate for cutting losses, spillage, and variations in subgrade levels or framing irregularities.`,
    };

    return (
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
        {getTranslation(
          `report.waste.${wasteKeySuffix}`,
          { waste: wastePercent.toFixed(0) },
          fallbacks[wasteKeySuffix]
        )}
      </p>
    );
  };

  // 4. Delivery Recommendation Section
  const renderDelivery = () => {
    const weightLbs = metrics.weightLbs || 0;
    const bagsCount = metrics.bagsCount || 0;
    const volumeCuYd = metrics.volumeCuYd || 0;
    const deliveryKeySuffix = getDeliveryKey(calculatorId, weightLbs, volumeCuYd);

    const renderDeliveryContent = () => {
      if (deliveryKeySuffix === "truck") {
        return (
          <span>
            Your project requires {volumeCuYd.toFixed(2)} cubic yards of concrete ({bagsCount} bags of {metrics.bagSize || "80lb"}). Because this volume is substantial, we strongly recommend purchasing ready-mix delivery instead of bags, which will save significant manual labor and ensure a uniform pour.
          </span>
        );
      }
      if (deliveryKeySuffix === "heavy") {
        return (
          <span>
            The total material load is {weightLbs.toLocaleString()} lbs. Standard consumer pickup trucks can typically carry between 1,500 and 2,500 lbs in the bed. To prevent vehicle damage or unsafe transport, we recommend arranging professional home delivery. Want to verify if it fits in your specific vehicle? Check our interactive <a href={`/calculators/payload/?weight=${weightLbs}&material=${calculatorId}`} className="text-[var(--accent)] hover:underline font-semibold">Payload Safety & Trip Calculator</a>.
          </span>
        );
      }
      return (
        <span>
          The total material load is approximately {weightLbs.toLocaleString()} lbs, which can be safely transported in a standard light-duty pickup truck or cargo van in a single trip. View suspension sag and trip configurations on our <a href={`/calculators/payload/?weight=${weightLbs}&material=${calculatorId}`} className="text-[var(--accent)] hover:underline font-semibold">Payload Safety & Trip Calculator</a>.
        </span>
      );
    };

    return (
      <div className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
        {renderDeliveryContent()}
      </div>
    );
  };

  // 5. Estimated Weight Section
  const renderWeight = () => {
    const weightLbs = metrics.weightLbs || 0;
    const tons = (weightLbs / 2000).toFixed(2);
    return (
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
        {getTranslation(
          "report.weight.desc",
          { lbs: weightLbs.toLocaleString(), tons },
          `The total estimated weight of the required physical materials is ${weightLbs.toLocaleString()} lbs (approx. ${tons} tons). Make sure your workspace floor or subgrade can support this load and that you have helper labor available to lift and stack materials safely.`
        )}
      </p>
    );
  };

  // 6. Comparison Section
  const renderComparison = () => {
    // Concrete & Masonry
    if (["concrete-slab", "concrete-footing", "rebar", "gravel", "aggregate"].includes(calculatorId)) {
      return (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
            Compare alternative base and topping options for patios, walkways, and driveways:
          </p>
          <div className="overflow-x-auto border border-[var(--border)] rounded-lg text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-inset)] border-b border-[var(--border)]">
                  <th className="p-2.5 font-semibold">Material Option</th>
                  <th className="p-2.5 font-semibold text-center">DIY Difficulty</th>
                  <th className="p-2.5 font-semibold text-center">Durability</th>
                  <th className="p-2.5 font-semibold text-center">Lifespan</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-2.5 font-medium">Poured Concrete Slab</td>
                  <td className="p-2.5 text-center text-[var(--error)] font-semibold">Hard (Pro recommended)</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">Excellent</td>
                  <td className="p-2.5 text-center">30–50 years</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-2.5 font-medium">Interlocking Pavers</td>
                  <td className="p-2.5 text-center text-[var(--warning)] font-semibold">Medium (DIY-friendly)</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">Excellent</td>
                  <td className="p-2.5 text-center">25–50 years</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Loose Pea Gravel</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">Easy (Beginner)</td>
                  <td className="p-2.5 text-center text-[var(--fg-muted)]">Medium</td>
                  <td className="p-2.5 text-center">Indefinite (needs top-off)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Drywall & Framing
    if (["drywall", "framing"].includes(calculatorId)) {
      return (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
            Compare framing wall boards and finish methods:
          </p>
          <div className="overflow-x-auto border border-[var(--border)] rounded-lg text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-inset)] border-b border-[var(--border)]">
                  <th className="p-2.5 font-semibold">Finish Method</th>
                  <th className="p-2.5 font-semibold text-center">Cost Estimate</th>
                  <th className="p-2.5 font-semibold text-center">Soundproofing</th>
                  <th className="p-2.5 font-semibold text-center">Installation Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-2.5 font-medium">Drywall Gypsum Sheets</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">Low ($1-$3/sqft)</td>
                  <td className="p-2.5 text-center">Medium</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">Fast (2-3 days)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Traditional Lath & Plaster</td>
                  <td className="p-2.5 text-center text-[var(--error)] font-semibold">High ($5-$10/sqft)</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">Excellent</td>
                  <td className="p-2.5 text-center text-[var(--error)] font-semibold">Slow (1-2 weeks)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Roofing
    if (["roofing-shingles", "roof-pitch", "plywood"].includes(calculatorId)) {
      return (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
            Compare roofing finish materials:
          </p>
          <div className="overflow-x-auto border border-[var(--border)] rounded-lg text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-inset)] border-b border-[var(--border)]">
                  <th className="p-2.5 font-semibold">Roof Material</th>
                  <th className="p-2.5 font-semibold text-center">Cost Index</th>
                  <th className="p-2.5 font-semibold text-center">Wind Resistance</th>
                  <th className="p-2.5 font-semibold text-center">Lifespan</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-2.5 font-medium">Asphalt Shingles</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">Low ($3-$6/sqft)</td>
                  <td className="p-2.5 text-center">Good (110-130 mph)</td>
                  <td className="p-2.5 text-center">15–30 years</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Corrugated Metal Roofing</td>
                  <td className="p-2.5 text-center text-[var(--warning)] font-semibold">Medium ($6-$12/sqft)</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">Excellent (140+ mph)</td>
                  <td className="p-2.5 text-center text-[var(--success)] font-semibold">40–70 years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Fallback general comparison
    return (
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
        Material options vary based on location, budget, and local building codes. We recommend researching regional options or consulting a structural professional to verify feasibility.
      </p>
    );
  };

  // 7. Shopping Checklist Section
  const renderChecklist = () => {
    const list: string[] = [];
    materials.forEach((m) => {
      list.push(`${m.quantity.toFixed(1)} ${m.unit} of ${m.name}`);
    });

    if (["concrete-slab", "concrete-footing"].includes(calculatorId)) {
      list.push(
        "Screed board (straight 2x4 or 2x6 timber)",
        "Hand float or bull trowel",
        "Wooden stakes and forming screws",
        "Safety goggles, dust mask, and heavy gloves"
      );
    } else if (calculatorId === "drywall") {
      list.push(
        "Utility knife and replacement blades",
        "Drywall panel screw gun or cordless drill",
        "Mudding knives (6-inch and 10-inch)",
        "Respirator sanding mask and safety glasses"
      );
    } else if (calculatorId === "framing") {
      list.push(
        "Framing hammer or pneumatic nail gun",
        "Speed square and chalk line",
        "Galvanized construction framing nails",
        "Heavy gloves and ear protection"
      );
    }

    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--fg-secondary)] print:block">
        {list.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 print:my-1">
            <input
              type="checkbox"
              className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]/20 no-print mt-0.5"
              id={`chk-${calculatorId}-${idx}`}
            />
            <label htmlFor={`chk-${calculatorId}-${idx}`} className="cursor-pointer select-none print:before:content-['☐_'] print:before:font-mono">
              {item}
            </label>
          </li>
        ))}
      </ul>
    );
  };

  // 8. Common Mistakes Section
  const renderMistakes = () => {
    let mistakes: string[] = [];
    if (["concrete-slab", "concrete-footing"].includes(calculatorId)) {
      mistakes = [
        "Adding excessive water: Water makes concrete easier to pour but drastically reduces its ultimate compressive load rating.",
        "Skipping soil compaction: Pouring concrete over soft, uncompacted subgrade soil causes structural settling and cracking.",
        "Omitting rebar chairs: Laying reinforcement mesh on the dirt provides zero strength; rebar must sit elevated inside the slab center.",
      ];
    } else if (calculatorId === "drywall") {
      mistakes = [
        "Over-sanding dry compound: aggressive sanding tears the surface paper backing, exposing fiberglass mesh joint tape.",
        "Aligning joint seams on window corners: placing sheet corners directly at window headers increases joint shear cracks.",
        "Skipping gypsum primer: mud absorbs paint differently than standard panel backing, leading to uneven wall sheen.",
      ];
    } else if (calculatorId === "framing") {
      mistakes = [
        "Using regular nails in treated plates: Pressure-treated lumber corrodes standard fasteners. Always use hot-dipped galvanized or stainless steel nails.",
        "Skipping block bracing: Tall walls over 8 feet require mid-span blocking to prevent stud twisting under vertical roof loads.",
      ];
    } else {
      mistakes = [
        "Neglecting the recommended safety waste factor buffer percentage.",
        "Using incorrect tools or skipping protective masks when cutting dust-producing materials.",
      ];
    }

    return (
      <ul className="list-decimal pl-5 flex flex-col gap-2.5 text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty">
        {mistakes.map((mistake, i) => {
          const parts = mistake.split(":");
          const title = parts[0];
          const desc = parts.slice(1).join(":");
          return (
            <li key={i}>
              <strong className="text-[var(--fg)] font-semibold">{title}:</strong>{desc}
            </li>
          );
        })}
      </ul>
    );
  };

  // 9. Next Recommended Calculators Section
  const renderRecommendations = () => {
    let links: Array<{ name: string; path: string }> = [];
    if (["concrete-slab", "concrete-footing"].includes(calculatorId)) {
      links = [
        { name: "Concrete Footing Calculator", path: "/calculators/concrete/footing/" },
        { name: "Rebar Spacing Calculator", path: "/calculators/concrete/rebar/" },
        { name: "Gravel Base Calculator", path: "/calculators/gravel/" },
      ];
    } else if (calculatorId === "drywall") {
      links = [
        { name: "Interior Paint Coverage Calculator", path: "/calculators/paint/" },
        { name: "Lumber Stud Framing Calculator", path: "/calculators/framing/" },
      ];
    } else if (["roofing-shingles", "roof-pitch", "plywood"].includes(calculatorId)) {
      links = [
        { name: "Metal Roofing Calculator", path: "/calculators/roofing/metal/" },
        { name: "Roof Pitch Angle Calculator", path: "/calculators/roofing/pitch/" },
      ];
    } else {
      links = [
        { name: "Compare Materials Matrix", path: "/compare/" },
        { name: "Renovation Budget Planner", path: "/renovate/" },
      ];
    }

    return (
      <div className="flex flex-wrap gap-2.5 no-print mt-1">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.path}
            className="text-xs bg-[var(--bg-inset)] hover:bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--fg)] hover:text-[var(--primary)] px-3 py-1.5 rounded-lg transition-all font-medium"
          >
            {link.name} &rarr;
          </a>
        ))}
      </div>
    );
  };

  // 10. Learning Section
  const renderLearningSection = () => {
    let formula = "Volume = Length × Width × Thickness";
    let explanation = "Calculations are conducted using mathematical formulas derived from physical geometry and packaging densities.";

    if (calculatorId === "concrete-slab") {
      formula = "Volume (cu yd) = [Length (ft) × Width (ft) × Thickness (in / 12)] / 27";
      explanation = "This formula calculates physical surface area, converts thickness from inches to decimal feet, and divides by 27 to yield standard cubic yards. Bags counts are computed using nominal yields: 80lb bag = 0.6 cu ft, 60lb bag = 0.45 cu ft.";
    } else if (calculatorId === "drywall") {
      formula = "Drywall Sheets = Wall Surface Area / Individual Sheet Area (32, 40, or 48 sq ft)";
      explanation = "Calculates wall length times wall height, deducts door (21 sq ft) and window (12 sq ft) openings, and applies the designated waste buffer percentage before dividing by sheet sizing.";
    } else if (calculatorId === "framing") {
      formula = "Studs = Math.ceil(Wall Length / Stud Spacing) + 1 + Corner Braces";
      explanation = "Estimates stud counts based on standard 16\" or 24\" on-center spacing, adding top/bottom structural sill plates and corner braces.";
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="bg-[var(--bg-inset)] p-3 rounded-lg font-mono text-xs text-[var(--fg)] border border-[var(--border)] w-fit max-w-full overflow-x-auto">
          {formula}
        </div>
        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
          {explanation}
        </p>
        <div className="text-[10px] text-[var(--fg-muted)] border-t border-[var(--border)] pt-2 mt-1">
          Reference: American Concrete Institute (ACI 302.1R Guide for Concrete Slabs), International Building Code (IBC Section 2308).
        </div>
      </div>
    );
  };

  const sections = [
    { title: "Project Summary", content: renderSummary() },
    { title: "Material Breakdown", content: renderMaterialBreakdown() },
    { title: "Waste Explanation", content: renderWasteExplanation() },
    { title: "Delivery Recommendation", content: renderDelivery() },
    { title: "Estimated Weight", content: renderWeight() },
    { title: "Comparison Section", content: renderComparison() },
    { title: "Shopping Checklist", content: renderChecklist() },
    { title: "Common Mistakes", content: renderMistakes() },
    { title: "Next Recommended Calculators", content: renderRecommendations() },
    { title: "Learning Section", content: renderLearningSection() },
  ];

  return (
    <div className="flex flex-col gap-6 w-full print-full mt-8 border-t border-[var(--border)] pt-8">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border)] no-print">
        <div>
          <h2 className="text-base font-bold text-[var(--fg)]">
            {getTranslation("report.title", undefined, "Explain My Calculation")}
          </h2>
          <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
            {getTranslation("report.subtitle", undefined, "Comprehensive, values-based project breakdown.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 cursor-pointer"
        >
          {getTranslation("report.print_btn", undefined, "Print/Export PDF")}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((sec, idx) => (
          <details
            key={idx}
            className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden"
            open={true}
          >
            <summary className="flex items-center justify-between p-4 font-semibold text-sm cursor-pointer select-none text-[var(--fg)] hover:text-[var(--accent)] outline-none focus:bg-[var(--bg-inset)]">
              <span>{sec.title}</span>
              <svg
                className="w-4 h-4 transform group-open:rotate-180 transition-transform text-[var(--fg-muted)] group-hover:text-[var(--accent)] no-print"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
              {sec.content}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};
