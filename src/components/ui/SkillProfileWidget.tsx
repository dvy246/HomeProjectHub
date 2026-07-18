import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { getSkillProfile, saveSkillProfile, resetSkillProfile } from "../../lib/storage";
import { type DIYSkillProfile, type SkillCategory, type SkillLevel, SKILL_CATEGORY_LABELS, SKILL_DESCRIPTIONS, DEFAULT_SKILL_PROFILE } from "../../lib/skillProfileEngine";

function SkillProfileWidget() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<DIYSkillProfile>(DEFAULT_SKILL_PROFILE);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setProfile(getSkillProfile());
    const handler = () => setProfile(getSkillProfile());
    window.addEventListener('skill-profile-changed', handler);
    return () => window.removeEventListener('skill-profile-changed', handler);
  }, []);

  const handleUpdate = (category: SkillCategory, level: SkillLevel) => {
    const newProfile = { ...profile, [category]: level };
    setProfile(newProfile);
    saveSkillProfile(newProfile);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReset = () => {
    resetSkillProfile();
    setProfile(DEFAULT_SKILL_PROFILE);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const categories = Object.keys(SKILL_CATEGORY_LABELS) as SkillCategory[];

  return (
    <div className="flex flex-col gap-4 relative w-full">
      {showToast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--fg)] text-[var(--bg)] px-4 py-2 rounded-full text-xs font-bold shadow-lg z-10 transition-opacity">
          Profile Saved
        </div>
      )}
      
      <div className="flex justify-end mb-2">
        <button
          onClick={handleReset}
          className="text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] underline transition-colors cursor-pointer"
        >
          Reset All to Beginner
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((category) => {
          const info = SKILL_CATEGORY_LABELS[category];
          const currentLevel = profile[category];
          
          return (
            <div key={category} className="bg-[var(--bg)] md:bg-transparent border border-[var(--border)] md:border-none rounded-xl p-4 md:p-0 flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-inset)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={info.icon} />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-[var(--fg)]">{info.label}</h4>
                  <p className="text-[10px] text-[var(--fg-secondary)]">{info.projects.join(', ')}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-0 md:min-w-[320px]">
                <div className="flex bg-[var(--bg-inset)] rounded-lg p-1 border border-[var(--border)]">
                  {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((level) => {
                    const isActive = currentLevel === level;
                    return (
                      <button
                        key={level}
                        onClick={() => handleUpdate(category, level)}
                        className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
                          isActive 
                            ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm border border-[var(--border)]' 
                            : 'text-[var(--fg-muted)] hover:text-[var(--fg)] border border-transparent'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] text-[var(--fg-muted)] flex flex-col md:flex-row justify-between px-1 gap-1">
                  <span className="truncate" title={SKILL_DESCRIPTIONS[currentLevel].description}>{SKILL_DESCRIPTIONS[currentLevel].description}</span>
                  <span className="font-medium text-[var(--fg-secondary)] md:text-right shrink-0">{SKILL_DESCRIPTIONS[currentLevel].wasteNote}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default withI18n(SkillProfileWidget);
