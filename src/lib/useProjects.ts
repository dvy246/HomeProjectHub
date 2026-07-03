import { useState, useEffect } from "react";
import { getSavedProjects, getProject, addCalculationToProject, type SavedProject, type ProjectCalculation, type MaterialItem } from "./projectEngine";

interface UseProjectsReturn {
  projects: SavedProject[];
  addToProject: (projectId: string, inputs: Record<string, number>, results: Record<string, number>, materials: MaterialItem[]) => SavedProject | null;
  successMessage: string;
  clearSuccess: () => void;
}

export function useProjects(calculatorSlug: string, calculatorName: string): UseProjectsReturn {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setProjects(getSavedProjects());
    const handler = () => setProjects(getSavedProjects());
    window.addEventListener("saved-projects-changed", handler);
    return () => window.removeEventListener("saved-projects-changed", handler);
  }, []);

  const addToProject = (
    projectId: string,
    inputs: Record<string, number>,
    results: Record<string, number>,
    materials: MaterialItem[]
  ): SavedProject | null => {
    const existingProject = getProject(projectId);
    const isDuplicate = existingProject?.calculations?.some(
      (c) => c.calculatorSlug === calculatorSlug && JSON.stringify(c.inputs) === JSON.stringify(inputs)
    );
    if (isDuplicate) {
      setSuccessMessage(`Already in "${existingProject!.name}"`);
      setTimeout(clearSuccess, 3000);
      return null;
    }
    const calculation: ProjectCalculation = {
      calculatorSlug,
      calculatorName,
      inputs,
      results,
      materials,
      completedAt: Date.now(),
    };
    const updated = addCalculationToProject(projectId, calculation);
    if (updated) {
      setSuccessMessage(`Added to "${updated.name}"`);
      setTimeout(clearSuccess, 3000);
    }
    return updated;
  };

  const clearSuccess = () => setSuccessMessage("");

  return { projects, addToProject, successMessage, clearSuccess };
}
