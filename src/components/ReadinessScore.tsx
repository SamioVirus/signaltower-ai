import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";

export const getReadinessLabel = (score: number): string => {
  if (score >= 90) return "Production ready";
  if (score >= 80) return "Production candidate";
  if (score >= 60) return "Reviewable";
  if (score >= 40) return "Needs remediation";
  return "Not ready";
};

export const ReadinessScore = ({ score, compact = false }: { score: number; compact?: boolean }) => (
  <div className={cn("min-w-[140px]", compact && "min-w-[110px]")}>
    <div className="mb-1 flex items-center justify-between gap-2">
      <span className="text-sm font-semibold text-slate-950">{formatPercent(score)}</span>
      {!compact ? <span className="text-xs text-slate-500">{getReadinessLabel(score)}</span> : null}
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-indigoTailored-600 transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
      />
    </div>
  </div>
);
