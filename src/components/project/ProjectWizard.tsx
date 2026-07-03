import { useState } from "react";
import { PROJECT_TEMPLATES, saveProject, type SavedProject } from "../../lib/projectEngine";

type Step = "select-type" | "enter-dimensions" | "review";

export default function ProjectWizard() {
  const [step, setStep] = useState<Step>("select-type");
  const [selectedType, setSelectedType] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [savedProject, setSavedProject] = useState<SavedProject | null>(null);

  const template = PROJECT_TEMPLATES.find((t) => t.type === selectedType);

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    const t = PROJECT_TEMPLATES.find((p) => p.type === type);
    if (t) setProjectName(`My ${t.label}`);
  };

  const handleCreate = () => {
    if (!selectedType || !projectName.trim()) return;
    const project = saveProject({
      name: projectName.trim(),
      projectType: selectedType as SavedProject["projectType"],
      status: "planning",
      sharedDimensions: {
        length: parseFloat(length) || undefined,
        width: parseFloat(width) || undefined,
        depth: parseFloat(depth) || undefined,
        unitSystem: "imperial",
      },
      calculations: [],
    });
    setSavedProject(project);
  };

  if (savedProject) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2">Project Created</h2>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">{savedProject.name} has been saved to your browser.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`/projects/#detail-${savedProject.id}`}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all"
            >
              View Project Plan
            </a>
          <a
            href={`/projects/`}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:border-[var(--border-hover)] transition-all"
          >
            Back to Projects
          </a>
        </div>
        {template && (
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">Recommended Calculators</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {template.recommendedCalculators.map((calc) => (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
                  {calc.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
      {step === "select-type" && (
        <>
          <h2 className="text-lg font-bold mb-4">What are you building?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {PROJECT_TEMPLATES.map((t) => (
              <button
                type="button"
                onClick={() => handleSelectType(t.type)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedType === t.type
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-subtle)]"
                }`}
              >
                <div className="text-lg mb-2">
                  {t.type === "shed" ? "🏠" : t.type === "deck" ? "🪵" : t.type === "patio" ? "🏗️" : t.type === "driveway" ? "🛣️" : t.type === "fence" ? "🚧" : t.type === "room" ? "🛏️" : t.type === "roof" ? "🏠" : "🧱"}
                </div>
                <h3 className="text-sm font-semibold">{t.label}</h3>
                <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium block mb-1.5" htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5"
              placeholder="e.g. Backyard Shed"
            />
          </div>
          <button
            type="button"
            onClick={() => setStep("enter-dimensions")}
            disabled={!selectedType || !projectName.trim()}
            className="w-full inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </>
      )}

      {step === "enter-dimensions" && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button type="button" onClick={() => setStep("select-type")} className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
              <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" /></svg>
              Back
            </button>
            <span className="text-xs text-[var(--fg-muted)]">|</span>
            <span className="text-xs font-medium">{projectName}</span>
          </div>
          <h2 className="text-lg font-bold mb-4">Enter Your Dimensions</h2>
          <p className="text-xs text-[var(--fg-secondary)] mb-5">These dimensions will be shared across all calculators for this project. You can adjust individual values later.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-medium block mb-1.5" htmlFor="wiz-length">Length (ft)</label>
              <input id="wiz-length" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 12" className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" htmlFor="wiz-width">Width (ft)</label>
              <input id="wiz-width" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 10" className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5" />
            </div>
          </div>
          <div className="mb-6">
            <label className="text-xs font-medium block mb-1.5" htmlFor="wiz-depth">Depth (inches) — optional</label>
            <input id="wiz-depth" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 4" className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5" />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="w-full inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all"
          >
            Create Project Plan
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </button>
        </>
      )}
    </div>
  );
}
