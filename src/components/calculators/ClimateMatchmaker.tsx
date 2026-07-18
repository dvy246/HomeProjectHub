import React, { useState } from "react";
import { Card } from "../ui/Card";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import MaterialWise from "./MaterialWise";
import {
  CLIMATE_PROFILES,
  getClimateWeights,
  getCompatibleCategories,
  type ClimateCondition,
} from "../../lib/climateEngine";
import type { ComparisonCategory } from "../../lib/compareEngine";

type MatchmakerProps = {
  initialClimate?: ClimateCondition;
  initialCategory?: ComparisonCategory;
};

const CLIMATE_OPTIONS = Object.values(CLIMATE_PROFILES);

const CATEGORY_LABELS: Record<ComparisonCategory, string> = {
  flooring: "Flooring",
  countertops: "Countertops",
  roofing: "Roofing",
  siding: "Siding",
  decking: "Decking",
};

function ClimateMatchmaker({
  initialClimate,
  initialCategory,
}: MatchmakerProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(initialClimate && initialCategory ? 5 : 1);
  const [climate, setClimate] = useState<ClimateCondition | undefined>(initialClimate);
  const [category, setCategory] = useState<ComparisonCategory | undefined>(initialCategory);
  const [priority, setPriority] = useState<string>("");
  const [sqft, setSqft] = useState<string>("500");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNext = () => setStep((s) => s + 1);

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6 text-[var(--fg)]">Step 1: Select Your Climate Region</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CLIMATE_OPTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setClimate(c.id);
                handleNext();
              }}
              className="p-4 border rounded-lg text-left hover:border-[var(--accent)] transition-colors flex flex-col items-center text-center bg-[var(--bg-card)]"
            >
              <div
                className="w-12 h-12 text-[var(--accent)] mb-4"
                dangerouslySetInnerHTML={{ __html: c.icon }}
              />
              <h3 className="font-semibold text-lg text-[var(--fg)] mb-2">{c.label}</h3>
              <p className="text-sm text-gray-500">{c.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2 && climate) {
    const validCategories = getCompatibleCategories(climate);
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6 text-[var(--fg)]">Step 2: Select Project Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {validCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                handleNext();
              }}
              className="p-4 border rounded-lg text-left hover:border-[var(--accent)] transition-colors bg-[var(--bg-card)]"
            >
              <h3 className="font-semibold text-lg text-[var(--fg)]">{CATEGORY_LABELS[cat]}</h3>
            </button>
          ))}
        </div>
        <button onClick={() => setStep(1)} className="mt-6 text-sm text-gray-500 hover:text-[var(--accent)]">
          ← Back to Climate
        </button>
      </div>
    );
  }

  if (step === 3 && climate && category) {
    const priorities = [
      { id: "budget", label: "Budget-first" },
      { id: "durability", label: "Durability-first" },
      { id: "maintenance", label: "Low-maintenance" },
      { id: "eco", label: "Eco-friendly" },
    ];
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6 text-[var(--fg)]">Step 3: What's your secondary priority?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {priorities.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPriority(p.id);
                handleNext();
              }}
              className="p-4 border rounded-lg text-left hover:border-[var(--accent)] transition-colors bg-[var(--bg-card)]"
            >
              <h3 className="font-semibold text-lg text-[var(--fg)]">{p.label}</h3>
            </button>
          ))}
        </div>
        <button onClick={() => setStep(2)} className="mt-6 text-sm text-gray-500 hover:text-[var(--accent)]">
          ← Back to Category
        </button>
      </div>
    );
  }

  if (step === 4 && climate && category) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6 text-[var(--fg)]">Step 4: Approximate Project Size</h2>
        <div className="max-w-sm">
          <label className="block text-sm font-medium mb-2 text-[var(--fg)]">Square Footage (sq ft)</label>
          <input
            type="number"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
            className="w-full p-2 border rounded-md mb-4 bg-[var(--bg)] text-[var(--fg)]"
          />
          <button
            onClick={handleNext}
            className="w-full bg-[var(--accent)] text-white font-bold py-2 px-4 rounded hover:bg-[var(--accent)] hover:opacity-90 transition-colors"
          >
            See Recommendations
          </button>
        </div>
        <button onClick={() => setStep(3)} className="mt-6 text-sm text-gray-500 hover:text-[var(--accent)]">
          ← Back to Priorities
        </button>
      </div>
    );
  }

  if (step === 5 && climate && category) {
    const profile = CLIMATE_PROFILES[climate];
    let baseWeights = getClimateWeights(climate);
    
    if (priority === "budget") baseWeights.cost = 100;
    if (priority === "durability") baseWeights.durability = 100;
    if (priority === "maintenance") baseWeights.maintenance = 100;
    if (priority === "eco") baseWeights.ecoFriendly = 100;

    return (
      <div className="w-full">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between bg-[var(--bg-card)] p-6 rounded-lg border border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 text-[var(--accent)]"
                dangerouslySetInnerHTML={{ __html: profile.icon }}
              />
              <h2 className="text-xl font-bold text-[var(--fg)]">
                Your Climate: {profile.label}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {profile.description}
            </p>
            <p className="text-sm font-medium text-[var(--fg)]">
              Key factors weighted heavily: {profile.keyScores.join(", ")}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
             <button
                onClick={() => setStep(1)}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Retake Quiz
              </button>
             <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md transition-colors"
              >
                {copied ? "Copied!" : "Share This Recommendation"}
              </button>
          </div>
        </div>
        
        <MaterialWise
          initialCategory={category}
          initialWeights={baseWeights}
          initialSqft={parseInt(sqft) || 500}
        />
      </div>
    );
  }

  return null;
}

export default withI18n(ClimateMatchmaker);
