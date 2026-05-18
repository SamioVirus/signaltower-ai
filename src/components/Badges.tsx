import type { RiskTier, Stage } from "@/data/useCases";
import { cn } from "@/lib/cn";

const stageStyles: Record<Stage, string> = {
  Intake: "bg-slate-100 text-slate-700 ring-slate-200",
  Prioritized: "bg-indigoTailored-50 text-indigoTailored-700 ring-indigoTailored-100",
  Pilot: "bg-amber-50 text-amber-800 ring-amber-100",
  "Control Review": "bg-violet-50 text-violet-800 ring-violet-100",
  "Production Ready": "bg-emerald-50 text-emerald-800 ring-emerald-100",
  Production: "bg-green-50 text-green-800 ring-green-100",
  Monitoring: "bg-blue-50 text-blue-800 ring-blue-100",
};

const riskStyles: Record<RiskTier, string> = {
  Low: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  Moderate: "bg-indigoTailored-50 text-indigoTailored-800 ring-indigoTailored-100",
  High: "bg-rose-50 text-rose-800 ring-rose-100",
  Restricted: "bg-slate-900 text-white ring-slate-900",
};

export const StageBadge = ({ stage }: { stage: Stage }) => (
  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", stageStyles[stage])}>
    {stage}
  </span>
);

export const RiskBadge = ({ risk }: { risk: RiskTier }) => (
  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1", riskStyles[risk])}>{risk}</span>
);

export const StatusPill = ({ label }: { label: string }) => (
  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
    {label}
  </span>
);
