// Maps broad skill categories to diyVsProEngine ProjectTypes
export type SkillCategory = 'structural' | 'finishing' | 'plumbing' | 'electrical' | 'landscaping';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface DIYSkillProfile {
  structural: SkillLevel;    // framing, deck, shed, concrete
  finishing: SkillLevel;     // painting, flooring, tile, drywall
  plumbing: SkillLevel;      // bathroom, kitchen
  electrical: SkillLevel;    // kitchen, basement
  landscaping: SkillLevel;   // patio, fence, landscaping
}

export const DEFAULT_SKILL_PROFILE: DIYSkillProfile = {
  structural: 'beginner',
  finishing: 'beginner',
  plumbing: 'beginner',
  electrical: 'beginner',
  landscaping: 'beginner',
};

// Map each ProjectType to its dominant SkillCategory
export const PROJECT_SKILL_MAP: Record<string, SkillCategory> = {
  deck: 'structural',
  shed: 'structural',
  wall: 'structural',
  roofing: 'structural',
  flooring: 'finishing',
  painting: 'finishing',
  tile: 'finishing',
  bathroom: 'plumbing',
  kitchen: 'plumbing',
  fence: 'landscaping',
  patio: 'landscaping',
};

// Given a full profile, get the skill level for a specific project type
export function getSkillForProject(profile: DIYSkillProfile, projectType: string): SkillLevel {
  const category = PROJECT_SKILL_MAP[projectType];
  if (!category) return 'beginner';
  return profile[category];
}

// Describe skill levels for UI display
export const SKILL_DESCRIPTIONS: Record<SkillLevel, { label: string; description: string; wasteNote: string }> = {
  beginner: {
    label: 'Beginner',
    description: 'Little or no hands-on experience. Expect learning curves.',
    wasteNote: '+20% material waste, +15% rework contingency',
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Have completed 1-3 similar projects before.',
    wasteNote: '+10% material waste, +8% rework contingency',
  },
  advanced: {
    label: 'Advanced',
    description: 'Experienced with this type of work. Minimal rework expected.',
    wasteNote: '+5% material waste, +3% rework contingency',
  },
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, { label: string; icon: string; projects: string[] }> = {
  structural: { label: 'Structural & Framing', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', projects: ['Deck', 'Shed', 'Wall Framing', 'Roofing'] },
  finishing: { label: 'Interior Finishing', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', projects: ['Flooring', 'Painting', 'Tile', 'Drywall'] },
  plumbing: { label: 'Plumbing & Fixtures', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z M11 7h2v6h-2zm0 8h2v2h-2z', projects: ['Bathroom', 'Kitchen'] },
  electrical: { label: 'Electrical Work', icon: 'M13 10V3L4 14h7v7l9-11h-7z', projects: ['Kitchen', 'Basement'] },
  landscaping: { label: 'Landscaping & Hardscape', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', projects: ['Patio', 'Fence', 'Walkways'] },
};
