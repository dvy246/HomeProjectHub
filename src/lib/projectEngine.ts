export interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  category?: string;
}

export interface ProjectCalculation {
  calculatorSlug: string;
  calculatorName: string;
  inputs: Record<string, number | string>;
  results: Record<string, number | string>;
  materials: MaterialItem[];
  completedAt: number;
}

export interface SavedProject {
  id: string;
  name: string;
  projectType: "shed" | "deck" | "patio" | "driveway" | "fence" | "room" | "roof" | "wall" | "custom";
  createdAt: number;
  updatedAt: number;
  status: "planning" | "calculating" | "complete";
  sharedDimensions: {
    length?: number;
    width?: number;
    height?: number;
    depth?: number;
    area?: number;
    unitSystem: "imperial" | "metric";
  };
  calculations: ProjectCalculation[];
  notes?: string;
}

export interface ProjectTemplate {
  type: SavedProject["projectType"];
  label: string;
  description: string;
  icon: string;
  recommendedCalculators: string[];
  estimatedTime: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    type: "shed",
    label: "Backyard Shed",
    description: "A storage shed or workshop with slab foundation, framed walls, and a roof",
    icon: "shed",
    recommendedCalculators: ["concrete-slab", "framing", "roofing-shingles", "vinyl-siding", "paint"],
    estimatedTime: "2-3 weekends",
  },
  {
    type: "deck",
    label: "Deck & Patio",
    description: "An elevated deck or ground-level patio with railings and stairs",
    icon: "deck",
    recommendedCalculators: ["decking", "baluster", "concrete-footing", "stair", "paint"],
    estimatedTime: "1-2 weekends",
  },
  {
    type: "patio",
    label: "Patio / Walkway",
    description: "A concrete slab, paver patio, or gravel walkway",
    icon: "patio",
    recommendedCalculators: ["concrete-slab", "gravel", "square-footage"],
    estimatedTime: "1 weekend",
  },
  {
    type: "driveway",
    label: "Driveway",
    description: "A concrete, asphalt, or gravel driveway with base materials",
    icon: "driveway",
    recommendedCalculators: ["concrete-slab", "gravel", "square-footage", "tonnage"],
    estimatedTime: "2-3 days",
  },
  {
    type: "fence",
    label: "Fence",
    description: "A wood or vinyl fence with posts, rails, and pickets",
    icon: "fence",
    recommendedCalculators: ["vinyl-fence", "baluster", "concrete-footing"],
    estimatedTime: "1-2 weekends",
  },
  {
    type: "room",
    label: "Room Addition",
    description: "A new room with foundation, framing, drywall, paint, and flooring",
    icon: "room",
    recommendedCalculators: ["concrete-slab", "framing", "drywall", "paint", "tile", "square-footage"],
    estimatedTime: "1-3 months",
  },
  {
    type: "roof",
    label: "Roof Replacement",
    description: "A complete roof replacement with shingles, underlayment, and ventilation",
    icon: "roof",
    recommendedCalculators: ["roofing-shingles", "roof-pitch", "plywood", "ice-water-shield"],
    estimatedTime: "2-4 days",
  },
  {
    type: "wall",
    label: "Wall & Siding",
    description: "A retaining wall, brick wall, or siding replacement",
    icon: "wall",
    recommendedCalculators: ["concrete-wall", "brick", "vinyl-siding", "board-and-batten", "retaining-wall"],
    estimatedTime: "1-2 weekends",
  },
];

const STORAGE_KEY = "home_project_hub_projects_v2";

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
}

export function getSavedProjects(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Omit<SavedProject, "id" | "createdAt" | "updatedAt">): SavedProject {
  const projects = getSavedProjects();
  const now = Date.now();
  const newProject: SavedProject = {
    ...project,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  projects.push(newProject);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event("saved-projects-changed"));
  } catch (e) {
    console.warn("Failed to save project:", e);
  }
  return newProject;
}

export function updateProject(id: string, updates: Partial<SavedProject>): SavedProject | null {
  const projects = getSavedProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...updates, updatedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event("saved-projects-changed"));
  } catch (e) {
    console.warn("Failed to update project:", e);
  }
  return projects[idx];
}

export function deleteProject(id: string): void {
  const projects = getSavedProjects().filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event("saved-projects-changed"));
  } catch (e) {
    console.warn("Failed to delete project:", e);
  }
}

export function getProject(id: string): SavedProject | null {
  return getSavedProjects().find((p) => p.id === id) || null;
}

export function addCalculationToProject(
  projectId: string,
  calculation: ProjectCalculation
): SavedProject | null {
  return updateProject(projectId, {
    calculations: [
      ...(getProject(projectId)?.calculations || []),
      calculation,
    ],
  });
}

export function aggregateMaterials(project: SavedProject): MaterialItem[] {
  const materialMap = new Map<string, MaterialItem>();
  for (const calc of project.calculations ?? []) {
    for (const mat of calc.materials ?? []) {
      const key = `${mat.name}||${mat.unit}`;
      const existing = materialMap.get(key);
      if (existing) {
        existing.quantity = (existing.quantity ?? 0) + (mat.quantity ?? 0);
      } else {
        materialMap.set(key, { ...mat });
      }
    }
  }
  return Array.from(materialMap.values());
}

export function getProjectProgress(project: SavedProject): { completed: number; total: number; percent: number } {
  const template = PROJECT_TEMPLATES.find((t) => t.type === project.projectType);
  const total = template?.recommendedCalculators.length || 1;
  const completed = project.calculations.length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

export { STORAGE_KEY };
