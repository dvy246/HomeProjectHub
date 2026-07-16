import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function SealantCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [jointLength, setJointLength] = useState("100");
  const [jointWidth, setJointWidth] = useState("0.5");
  const [jointDepth, setJointDepth] = useState("0.5");
  const [tubeSize, setTubeSize] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("sealant", "Sealant Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [jointLength, jointWidth, jointDepth, tubeSize, onCalculate]);

  const jl = parseNumber(jointLength);
  const jw = parseNumber(jointWidth);
  const jd = parseNumber(jointDepth);
  const ts = parseNumber(tubeSize);
  const volPerFtCuIn = jw * jd * 12;
  const tubesPerFt = volPerFtCuIn > 0 && ts > 0 ? volPerFtCuIn / (ts * 29.574) : 0;
  const totalTubes = Math.ceil(jl * tubesPerFt);
  const linearFtPerTube = tubesPerFt > 0 ? 1 / tubesPerFt : 0;

  const projectInputs = { jointLength: jl, jointWidth: jw, jointDepth: jd, tubeSizeOz: ts };
  const projectResults = { totalTubes, linearFtPerTube };
  const projectMaterials: MaterialItem[] = [{ name: "Sealant", quantity: totalTubes, unit: "tubes", category: "sealant" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.specialty.sealant.joint_length') ?? 'Joint Length (ft)'} type="number" inputMode="decimal" value={jointLength} onChange={(e) => setJointLength(e.target.value)} placeholder="100" />
            <Input label={t('calculators.detail.specialty.sealant.joint_width') ?? 'Joint Width (in)'} type="number" inputMode="decimal" value={jointWidth} onChange={(e) => setJointWidth(e.target.value)} placeholder="0.5" />
            <Input label={t('calculators.detail.specialty.sealant.joint_depth') ?? 'Joint Depth (in)'} type="number" inputMode="decimal" value={jointDepth} onChange={(e) => setJointDepth(e.target.value)} placeholder="0.5" />
            <Input label={t('calculators.detail.specialty.sealant.tube_size') ?? 'Tube Size (oz)'} type="number" inputMode="decimal" value={tubeSize} onChange={(e) => setTubeSize(e.target.value)} placeholder="10" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.specialty.sealant.sealant_estimate') ?? 'Sealant Estimate'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.sealant.sealant_needed', { tubeSize: ts }) ?? `Sealant Needed (${ts} oz tubes)`}</span>
              <span className="text-sm font-bold tabular-nums">{totalTubes}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.sealant.coverage_per_tube') ?? 'Coverage per Tube'}</span>
              <span className="text-sm font-semibold tabular-nums">{linearFtPerTube.toFixed(1)} {t('units.ft') ?? 'ft'}</span>
            </div>
          </div>
        </Card>
          <AddToProjectCard
            projects={projects}
            onAdd={(pid) => {
              clearSuccess();
              addToProject(pid, projectInputs, projectResults, projectMaterials);
            }}
            successMessage={projectSuccess}
          />
      </div>
    </div>
  );
}

export default withI18n(SealantCalc);
