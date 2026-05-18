import type { AIUseCase } from "@/data/useCases";
import { isBlocked } from "@/lib/metrics";
import { formatCompactCurrency, formatDays } from "@/lib/format";
import { RiskBadge, StageBadge } from "@/components/Badges";
import { ReadinessScore } from "@/components/ReadinessScore";

export const UseCaseTable = ({ useCases }: { useCases: AIUseCase[] }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table className="min-w-[1180px] divide-y divide-slate-200 text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="px-4 py-3 font-semibold">Use case</th>
          <th className="px-4 py-3 font-semibold">Function</th>
          <th className="px-4 py-3 font-semibold">Stage</th>
          <th className="px-4 py-3 font-semibold">Value</th>
          <th className="px-4 py-3 font-semibold">Risk</th>
          <th className="px-4 py-3 font-semibold">Readiness</th>
          <th className="px-4 py-3 font-semibold">Blocker</th>
          <th className="px-4 py-3 font-semibold">Owner</th>
          <th className="px-4 py-3 font-semibold">Aging</th>
          <th className="px-4 py-3 font-semibold">Next action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {useCases.map((useCase) => (
          <tr key={useCase.id} className="align-top transition hover:bg-indigoTailored-50/35">
            <td className="px-4 py-4">
              <div className="font-semibold text-slate-950">{useCase.name}</div>
              <div className="mt-1 text-xs text-slate-500">{useCase.id}</div>
            </td>
            <td className="px-4 py-4 text-slate-600">{useCase.businessFunction}</td>
            <td className="px-4 py-4"><StageBadge stage={useCase.stage} /></td>
            <td className="px-4 py-4 font-semibold text-slate-900">{formatCompactCurrency(useCase.valueAtStake)}</td>
            <td className="px-4 py-4"><RiskBadge risk={useCase.riskTier} /></td>
            <td className="px-4 py-4"><ReadinessScore score={useCase.readinessScore} compact /></td>
            <td className="px-4 py-4">
              <span className={isBlocked(useCase) ? "font-semibold text-rose-700" : "text-slate-500"}>{useCase.mainBlocker}</span>
            </td>
            <td className="px-4 py-4 text-slate-600">{useCase.owner}</td>
            <td className="px-4 py-4 text-slate-600">{formatDays(useCase.stageAgingDays)}</td>
            <td className="px-4 py-4 text-slate-600">{useCase.nextAction}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
