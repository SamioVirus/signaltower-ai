import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, LayoutList, Rows3, Minus } from "lucide-react";

import { RiskBadge, StageBadge } from "@/components/Badges";
import { PageShell } from "@/components/PageShell";
import { ReadinessScore } from "@/components/ReadinessScore";
import { SectionHeader } from "@/components/SectionHeader";
import { useCases } from "@/data/useCases";
import type { BlockerCategory, BusinessFunction, RiskTier, Stage } from "@/data/useCases";

type ScoreRange = "All" | "0-39" | "40-59" | "60-79" | "80-89" | "90-100";

const unique = <T extends string>(items: T[]) => [...new Set(items)].sort();
const all = "All";

const scoreInRange = (score: number, range: ScoreRange) => {
  if (range === "All") return true;
  if (range === "0-39") return score <= 39;
  if (range === "40-59") return score >= 40 && score <= 59;
  if (range === "60-79") return score >= 60 && score <= 79;
  if (range === "80-89") return score >= 80 && score <= 89;
  return score >= 90;
};

export const ReadinessPage = () => {
  const [businessFunction, setBusinessFunction] = useState<BusinessFunction | typeof all>(all);
  const [stage, setStage] = useState<Stage | typeof all>(all);
  const [riskTier, setRiskTier] = useState<RiskTier | typeof all>(all);
  const [blocker, setBlocker] = useState<BlockerCategory | typeof all>(all);
  const [owner, setOwner] = useState<string>(all);
  const [scoreRange, setScoreRange] = useState<ScoreRange>("All");

  const [isCompact, setIsCompact] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      useCases.filter((useCase) => {
        const matchesFunction = businessFunction === all || useCase.businessFunction === businessFunction;
        const matchesStage = stage === all || useCase.stage === stage;
        const matchesRisk = riskTier === all || useCase.riskTier === riskTier;
        const matchesBlocker = blocker === all || useCase.blockerCategory === blocker;
        const matchesOwner = owner === all || useCase.owner === owner;
        return matchesFunction && matchesStage && matchesRisk && matchesBlocker && matchesOwner && scoreInRange(useCase.readinessScore, scoreRange);
      }),
    [businessFunction, blocker, owner, riskTier, scoreRange, stage],
  );

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderSelect = <T extends string>(
    label: string,
    value: T,
    options: T[],
    onChange: (value: T) => void,
  ) => (
    <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-800 outline-none transition focus:border-indigoTailored-500 focus:ring-2 focus:ring-indigoTailored-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );

  const renderDimensionStatus = (label: string, score: number) => {
    let Icon;
    let colorClass;
    let bgClass;

    if (score >= 80) {
      Icon = CheckCircle2;
      colorClass = "text-slate-400";
      bgClass = "bg-slate-50 border-slate-200";
    } else if (score >= 40) {
      Icon = Minus;
      colorClass = "text-slate-400";
      bgClass = "bg-slate-50 border-slate-200";
    } else {
      Icon = AlertCircle;
      colorClass = "text-rose-500";
      bgClass = "bg-rose-50 border-rose-200";
    }

    return (
      <div key={label} className={`flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors ${bgClass}`}>
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </div>
    );
  };

  return (
    <PageShell
      eyebrow="Production Readiness Board"
      title="Which use cases can move, and which are stuck?"
      description="A lightweight commercialization board showing readiness, blocker patterns, and the control evidence still needed before production."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader title="Filters" description="Simple local filters keep the board focused without adding workflow complexity." />
          
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setIsCompact(false)}
              className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition ${!isCompact ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutList className="h-4 w-4" />
              Detailed
            </button>
            <button
              onClick={() => setIsCompact(true)}
              className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition ${isCompact ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Rows3 className="h-4 w-4" />
              Compact
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {renderSelect("Business function", businessFunction, [all, ...unique(useCases.map((item) => item.businessFunction))], setBusinessFunction)}
          {renderSelect("Stage", stage, [all, ...unique(useCases.map((item) => item.stage))], setStage)}
          {renderSelect("Risk tier", riskTier, [all, ...unique(useCases.map((item) => item.riskTier))], setRiskTier)}
          {renderSelect("Blocker type", blocker, [all, ...unique(useCases.map((item) => item.blockerCategory))], setBlocker)}
          {renderSelect("Owner", owner, [all, ...unique(useCases.map((item) => item.owner))], setOwner)}
          {renderSelect("Score range", scoreRange, ["All", "0-39", "40-59", "60-79", "80-89", "90-100"], setScoreRange)}
        </div>
      </section>

      <section className="grid gap-4">
        {filtered.map((useCase) => {
          const isBlocked = useCase.mainBlocker !== "None";
          const expanded = !isCompact || expandedItems.has(useCase.id);

          return (
            <article key={useCase.id} className="rounded-lg border border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-executive">
              {/* Header / Compact View */}
              <div 
                className={`flex cursor-pointer flex-wrap items-center justify-between gap-4 p-4 md:p-5 ${expanded ? "border-b border-slate-100 bg-slate-50/50" : ""}`}
                onClick={() => isCompact && toggleExpand(useCase.id)}
              >
                <div className="flex items-center gap-4">
                  {isCompact && (
                    <button className="text-slate-400 hover:text-slate-600">
                      {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                  )}
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                      <StageBadge stage={useCase.stage} />
                      <RiskBadge risk={useCase.riskTier} />
                      <span className="text-xs font-semibold text-slate-400">{useCase.id}</span>
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 md:ml-2">{useCase.name}</h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {isCompact && (
                    <div className="hidden max-w-[200px] items-center gap-2 lg:flex">
                      {isBlocked ? (
                        <>
                          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                          <span className="truncate text-sm font-medium text-rose-600">{useCase.mainBlocker}</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">Ready</span>
                      )}
                    </div>
                  )}
                  <div className="w-[180px]">
                    <ReadinessScore score={useCase.readinessScore} compact={isCompact} />
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expanded && (
                <div className="p-5">
                  <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                    <div>
                      <p className="max-w-4xl text-sm leading-6 text-slate-600">{useCase.description}</p>
                      
                      <div className="mt-6">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Readiness Dimensions</h3>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                          {Object.entries(useCase.readinessDimensions).map(([label, score]) => 
                            renderDimensionStatus(label, score)
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Main blocker</dt>
                        <dd className="mt-1 text-sm font-medium text-slate-800">
                          {isBlocked ? (
                            <span className="text-rose-600">{useCase.mainBlocker}</span>
                          ) : (
                            <span className="text-slate-500">None. Ready for review.</span>
                          )}
                        </dd>
                      </div>

                      <div className={`mt-auto rounded-md border p-3 ${isBlocked ? "border-amber-200 bg-amber-50" : "border-indigoTailored-200 bg-indigoTailored-50"}`}>
                        <dt className={`text-xs font-bold uppercase tracking-wide ${isBlocked ? "text-amber-800" : "text-indigoTailored-800"}`}>
                          Next Action ({useCase.owner})
                        </dt>
                        <dd className={`mt-1 text-sm font-medium ${isBlocked ? "text-amber-900" : "text-indigoTailored-900"}`}>
                          {useCase.nextAction}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </PageShell>
  );
};
