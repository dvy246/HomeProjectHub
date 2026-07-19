import React, { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { Card } from "../ui/Card";

interface PermitData {
  stateName: string;
  source: string;
  sourceUrl: string;
  projects: Record<
    "deck" | "concrete" | "roof",
    {
      title: string;
      rules: string[];
      exemptions: string[];
      disclaimer: string;
      calcLink: string;
      calcLabel: string;
    }
  >;
}

const PERMIT_DATA: Record<string, PermitData> = {
  CA: {
    stateName: "California",
    source: "California Building Code (Title 24, Part 2, Section 105.2)",
    sourceUrl: "https://www.dgs.ca.gov/BSC/Codes",
    projects: {
      deck: {
        title: "Deck Addition Permit Rules",
        rules: [
          "Permit required if the deck is attached to a dwelling or primary structure.",
          "Permit required if the deck surface is more than 30 inches above the ground at any point.",
          "Permit required if the total deck area exceeds 200 square feet."
        ],
        exemptions: [
          "Detached decks less than 200 square feet in area.",
          "Deck surface height is less than 30 inches off grade.",
          "Not attached to a building and does not serve the main exit door."
        ],
        disclaimer: "Wildfire zone requirements (WUI) apply in California, which dictate fire-resistant timber or composite boards for deck surfaces.",
        calcLink: "/calculators/deck-designer/",
        calcLabel: "Open Deck Designer"
      },
      concrete: {
        title: "Concrete Slab & Patio Rules",
        rules: [
          "Permit required if the concrete slab supports structural loads (such as posts for patio covers).",
          "Zoning approval required if the slab violates property line setbacks or impervious coverage limits."
        ],
        exemptions: [
          "Standard on-grade concrete slabs and walkways less than 30 inches above the ground.",
          "Slabs that do not support any overhead roof or load-bearing structures."
        ],
        disclaimer: "Check local storm-water drainage and property setback lines before pouring close to fence boundaries.",
        calcLink: "/calculators/concrete-slab-designer/",
        calcLabel: "Open Concrete Slab Designer"
      },
      roof: {
        title: "Roof Replacement Rules",
        rules: [
          "A building permit is strictly required for all reroofing projects in California.",
          "A permit ensures inspections for structural rafter condition, sheathing fasteners, and ventilation codes.",
          "Cool roof materials (with high solar reflectance) may be required depending on your climate zone."
        ],
        exemptions: [
          "Minor roof leak repairs and replacement of a small patch of shingles (typically under 100 square feet)."
        ],
        disclaimer: "California Title 24 Energy Codes require Cool Roof certified shingles or metal in many climate zones.",
        calcLink: "/calculators/roofing/shingles/",
        calcLabel: "Open Roof Shingle Calculator"
      }
    }
  },
  TX: {
    stateName: "Texas",
    source: "Texas Local Government Code Section 214.901",
    sourceUrl: "https://statutes.capitol.texas.gov/",
    projects: {
      deck: {
        title: "Deck Addition Permit Rules",
        rules: [
          "Texas municipalities follow the International Residential Code (IRC).",
          "Permit required if the deck is attached to a home.",
          "Permit required if the deck floor is more than 30 inches above the ground.",
          "Permit required if the deck area is larger than 200 square feet."
        ],
        exemptions: [
          "Detached wood decks under 200 square feet that are under 30 inches above the ground."
        ],
        disclaimer: "Zoning setbacks apply. Verify if your HOA has stricter rules regarding deck size or visibility.",
        calcLink: "/calculators/deck-designer/",
        calcLabel: "Open Deck Designer"
      },
      concrete: {
        title: "Concrete Slab & Patio Rules",
        rules: [
          "Permit required if the slab is part of a structural foundation (e.g., for a detached garage or home addition).",
          "Impervious coverage limits in cities like Austin or Dallas restrict the total percentage of paved area on your lot."
        ],
        exemptions: [
          "Standard detached concrete patios, driveways, or sidewalks directly on grade with no structural walls."
        ],
        disclaimer: "Ensure your concrete pour does not block utility easements or direct stormwater runoff onto neighbor lots.",
        calcLink: "/calculators/concrete-slab-designer/",
        calcLabel: "Open Concrete Slab Designer"
      },
      roof: {
        title: "Roof Replacement Rules",
        rules: [
          "Building permits are required for reroofing in major cities (Dallas, Houston, Austin).",
          "An inspection is typically required to verify ice/water shield, sheathing nail spacing, and valley flashing."
        ],
        exemptions: [
          "Patching minor leaks or replacing a small number of damaged shingles."
        ],
        disclaimer: "Coastal areas of Texas (within the windstorm zone) require a WPI-8 Certificate of Compliance from the TDI (Texas Department of Insurance) for windstorm coverage.",
        calcLink: "/calculators/roofing/shingles/",
        calcLabel: "Open Roof Shingle Calculator"
      }
    }
  },
  FL: {
    stateName: "Florida",
    source: "Florida Building Code (FBC, Section 105.2)",
    sourceUrl: "http://www.floridabuilding.org",
    projects: {
      deck: {
        title: "Deck Addition Permit Rules",
        rules: [
          "Building permits are strictly required for all decks attached to structures.",
          "Due to hurricane wind codes, detached decks also require engineering plans showing anchor bolts and wind ties in most regions."
        ],
        exemptions: [
          "Very low-profile, detached wood decks (under 30 inches off grade) in non-coastal, inland counties may occasionally be exempt; check local building departments."
        ],
        disclaimer: "Florida requires structural decks to be engineered to withstand wind speeds of 115-180 mph depending on the county.",
        calcLink: "/calculators/deck-designer/",
        calcLabel: "Open Deck Designer"
      },
      concrete: {
        title: "Concrete Slab & Patio Rules",
        rules: [
          "Permit and zoning review are required to poured concrete patios to verify setback compliance.",
          "Must conform to local drainage requirements and storm water storage plans."
        ],
        exemptions: [
          "None in some coastal zones; small, detached sidewalks on private lots are exempt in most inland counties."
        ],
        disclaimer: "Strict setbacks apply. Concrete patios poured within easement lines are subject to forced removal at owner expense.",
        calcLink: "/calculators/concrete-slab-designer/",
        calcLabel: "Open Concrete Slab Designer"
      },
      roof: {
        title: "Roof Replacement Rules",
        rules: [
          "A roofing permit is mandatory for all reroofs in Florida.",
          "Roof sheathing fastening, underlayment material, and shingle ratings must be inspected to meet Florida's High-Velocity Hurricane Zone (HVHZ) requirements."
        ],
        exemptions: [
          "Minor patching of shingles representing less than 100 square feet (1 square) of total roof surface."
        ],
        disclaimer: "Under FBC rules, replacing more than 25% of any roof structure requires the entire roof to be brought up to the latest wind codes.",
        calcLink: "/calculators/roofing/shingles/",
        calcLabel: "Open Roof Shingle Calculator"
      }
    }
  },
  NY: {
    stateName: "New York",
    source: "NYS Uniform Fire Prevention and Building Code (19 NYCRR Part 1203)",
    sourceUrl: "https://dos.ny.gov/building-standards-and-codes",
    projects: {
      deck: {
        title: "Deck Addition Permit Rules",
        rules: [
          "Permit required if attached to the primary structure.",
          "Permit required if the deck floor is more than 30 inches above grade.",
          "Permit required if the deck is larger than 200 square feet."
        ],
        exemptions: [
          "Detached decks under 200 square feet that are under 30 inches above the ground."
        ],
        disclaimer: "Freeze-thaw cycles in NY dictate that deck footings must be set below the local frost line (typically 36 to 42 inches deep).",
        calcLink: "/calculators/deck-designer/",
        calcLabel: "Open Deck Designer"
      },
      concrete: {
        title: "Concrete Slab & Patio Rules",
        rules: [
          "Permit required if concrete supports an structural load (such as a garage wall or porch pillar).",
          "Setback lines must be verified to prevent building code violations."
        ],
        exemptions: [
          "On-grade flatwork and walkways that do not connect to foundations and are less than 30 inches off grade."
        ],
        disclaimer: "Heaving from frost can damage slabs poured without a solid gravel base. Always use compact sub-base gravel.",
        calcLink: "/calculators/concrete-slab-designer/",
        calcLabel: "Open Concrete Slab Designer"
      },
      roof: {
        title: "Roof Replacement Rules",
        rules: [
          "Building permits are required if you are replacing structural roof rafters.",
          "NYS codes forbid laying new shingles over an existing roof if it already has two layers of roofing material."
        ],
        exemptions: [
          "Simple single-layer reroofs (replacing shingles only on rafters with good sheathing) are exempt in some rural towns, but always require permits in cities like NYC, Albany, and Buffalo."
        ],
        disclaimer: "NYS Building Code requires an ice and water barrier membrane extending from the eave's edge to a point at least 24 inches inside the warm wall line to prevent ice damming.",
        calcLink: "/calculators/roofing/shingles/",
        calcLabel: "Open Roof Shingle Calculator"
      }
    }
  },
  MT: {
    stateName: "Montana",
    source: "Montana Administrative Rules (ARM 24.301.154)",
    sourceUrl: "https://rules.mt.gov/",
    projects: {
      deck: {
        title: "Deck Addition Permit Rules",
        rules: [
          "Montana adopts the International Residential Code (IRC).",
          "Permit required for any deck attached to the building.",
          "Permit required if the deck floor is more than 30 inches above the ground.",
          "Permit required if the deck area exceeds 200 square feet."
        ],
        exemptions: [
          "Detached wood decks less than 200 square feet in area and less than 30 inches off grade."
        ],
        disclaimer: "Decks must be engineered for local snow loads, which can exceed 30-100 lbs per square foot in mountain regions.",
        calcLink: "/calculators/deck-designer/",
        calcLabel: "Open Deck Designer"
      },
      concrete: {
        title: "Concrete Slab & Patio Rules",
        rules: [
          "Permit required for structural slab foundations.",
          "Zoning regulations restrict paving over setbacks or easements."
        ],
        exemptions: [
          "Standard on-grade concrete patios, sidewalks, or flatwork under 30 inches above grade."
        ],
        disclaimer: "Ensure proper pitch away from dwelling foundations to prevent water ingress during spring snowmelt.",
        calcLink: "/calculators/concrete-slab-designer/",
        calcLabel: "Open Concrete Slab Designer"
      },
      roof: {
        title: "Roof Replacement Rules",
        rules: [
          "Permits are required for major roof structural alterations.",
          "Municipalities (like Missoula, Billings, Bozeman) require roof permits to verify sheathing and ventilation."
        ],
        exemptions: [
          "Minor leak repairs and shingle replacements under 100 square feet in rural counties."
        ],
        disclaimer: "Due to heavy winter snow loads, rafters must be inspected for cracking or sag before placing new heavy roofing panels.",
        calcLink: "/calculators/roofing/shingles/",
        calcLabel: "Open Roof Shingle Calculator"
      }
    }
  }
};

function PermitStateGuides() {
  const { locale } = useI18n();
  const [activeState, setActiveState] = useState<"CA" | "TX" | "FL" | "NY" | "MT">("CA");
  const [activeProject, setActiveProject] = useState<"deck" | "concrete" | "roof">("deck");

  if (locale !== "en") {
    return (
      <div className="p-6 text-center border border-[var(--border)] rounded-xl bg-[var(--bg-subtle)] text-[var(--fg-secondary)]">
        <p>This guide is currently available in English only. Local building regulations vary depending on your country and municipality.</p>
      </div>
    );
  }

  const selectedData = PERMIT_DATA[activeState];
  const projectStats = selectedData.projects[activeProject];

  return (
    <div className="flex flex-col gap-6">
      {/* Selector Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State Selector */}
        <Card className="p-4 border border-[var(--border)]">
          <label className="block text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">
            1. Select Your State
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.keys(PERMIT_DATA) as Array<"CA" | "TX" | "FL" | "NY" | "MT">).map((stateCode) => (
              <button
                key={stateCode}
                type="button"
                onClick={() => setActiveState(stateCode)}
                className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  activeState === stateCode
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--bg-muted)] border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-inset)]"
                }`}
              >
                {stateCode}
              </button>
            ))}
          </div>
          <span className="block text-[10px] text-[var(--fg-muted)] mt-2 italic truncate">
            Active Jurisdiction: {selectedData.stateName}
          </span>
        </Card>

        {/* Project Selector */}
        <Card className="p-4 border border-[var(--border)]">
          <label className="block text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">
            2. Select Project Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["deck", "concrete", "roof"] as const).map((projKey) => (
              <button
                key={projKey}
                type="button"
                onClick={() => setActiveProject(projKey)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  activeProject === projKey
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--bg-muted)] border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-inset)]"
                }`}
              >
                {projKey === "deck" ? "Deck Build" : projKey === "concrete" ? "Concrete Slab" : "Roof Replacement"}
              </button>
            ))}
          </div>
          <span className="block text-[10px] text-[var(--fg-muted)] mt-2 italic">
            Trigger Categories: {activeProject.toUpperCase()}
          </span>
        </Card>
      </div>

      {/* Main Results Panel */}
      <Card className="border border-[var(--border)] bg-[var(--card-bg)] p-6 flex flex-col gap-6 card-elevated">
        <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
          <h2 className="text-xl font-bold text-[var(--fg)] flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-[var(--accent)] text-white">
              {activeState}
            </span>
            {projectStats.title}
          </h2>
          <span className="text-[10px] text-[var(--fg-muted)]">
            Primary Code Authority:{" "}
            <a
              href={selectedData.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline font-semibold"
            >
              {selectedData.source}
            </a>
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rules List */}
          <div>
            <h3 className="text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-3">
              Permit Trigger Thresholds
            </h3>
            <ul className="flex flex-col gap-2.5">
              {projectStats.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
                  <svg className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exemptions List */}
          <div>
            <h3 className="text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-3">
              Common Exemptions (No Permit Needed)
            </h3>
            <ul className="flex flex-col gap-2.5">
              {projectStats.exemptions.map((ex, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* State Disclaimer Box */}
        <div className="bg-[var(--bg-subtle)] border-l-4 border-l-[var(--accent)] p-4 rounded-r-lg text-xs leading-relaxed text-[var(--fg-muted)]">
          <strong>State Code Insight:</strong> {projectStats.disclaimer}
        </div>

        {/* Legal Safeguard Warning */}
        <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 text-xs text-[var(--fg-secondary)] leading-relaxed">
          <span className="font-bold flex items-center gap-1.5 mb-1.5 text-[var(--fg)]">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Critical Liability Warning & Safeguard
          </span>
          This permit guide summarizes baseline state building regulations. However, municipal codes (city and county ordinances) represent the final authority and frequently carry stricter rules, zoning setbacks, HOA restrictions, or permit processing fees. Building without a permit is a legal violation and can lead to stop-work orders, steep fines, and forced demolition. Always consult your municipal building inspector or code enforcement officer before purchasing materials or starting layout construction.
        </div>

        {/* Footer Actions */}
        <footer className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-4 items-center justify-between">
          <a
            href={projectStats.calcLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] font-bold text-xs shadow-sm transition-colors text-center"
          >
            {projectStats.calcLabel} &rarr;
          </a>
          <a
            href="/planning/permit-cost-calculator/"
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Estimate Permit Fees & Plan Reviews &rarr;
          </a>
        </footer>
      </Card>
    </div>
  );
}

export default withI18n(PermitStateGuides);
