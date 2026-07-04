import { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { saveProject, type SavedProject } from "../../lib/projectEngine";

interface Props {
  projects: SavedProject[];
  onAdd: (projectId: string) => void;
  successMessage: string;
}

const SELECT_ID = "add-to-project-select";
const INPUT_ID = "add-to-project-input";

export default function AddToProjectCard({ projects, onAdd, successMessage }: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (adding) return;
    setAdding(true);
    try {
      if (projects.length === 0) {
        if (!newProjectName.trim()) return;
        const project = saveProject({
          name: newProjectName.trim(),
          projectType: "custom",
          status: "calculating",
          sharedDimensions: { unitSystem: "imperial" },
          calculations: [],
        });
        setNewProjectName("");
        onAdd(project.id);
      } else {
        if (!selectedProjectId) return;
        onAdd(selectedProjectId);
        setSelectedProjectId("");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold tracking-tight mb-2">Add to Project</h3>
      <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mb-4 bg-[var(--bg-subtle)] p-2.5 rounded-lg border border-[var(--border)]">
        💡 <strong>Did you know?</strong> Saving this calculation connects it to our <strong>Project Planner</strong>, allowing you to bundle multiple estimates (concrete, paint, tile, etc.) into a unified shopping list with shared measurements.
      </p>
      {projects.length > 0 ? (
        <div className="flex gap-2 items-end">
          <div className="flex-grow">
            <label htmlFor={SELECT_ID} className="text-xs font-medium text-[var(--fg-muted)] block mb-1">Select project</label>
            <select
              id={SELECT_ID}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] appearance-none cursor-pointer"
            >
              <option value="">Choose a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Button type="button" variant="secondary" className="h-10" onClick={handleAdd} disabled={!selectedProjectId || adding}>Add</Button>
        </div>
      ) : (
        <div className="flex gap-2 items-end">
          <div className="flex-grow">
            <label htmlFor={INPUT_ID} className="sr-only">New project name</label>
            <input
              id={INPUT_ID}
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Backyard Patio"
              className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 placeholder:text-[var(--fg-muted)]"
            />
          </div>
          <Button type="button" variant="secondary" className="h-10" onClick={handleAdd} disabled={!newProjectName.trim() || adding}>Create & Add</Button>
        </div>
      )}
      {successMessage && (
        <p className="text-xs text-[var(--success)] font-medium mt-3 animate-fade-in-up" role="status" aria-live="polite">{successMessage}</p>
      )}
    </Card>
  );
}
