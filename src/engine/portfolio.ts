import { blockerPatterns, deriveGaps, isBlocked } from "./blockers";
import { controlDebt, isLive, isProductionReady } from "./gates";
import { DEFAULT_POLICY } from "./policy";
import { scoreInitiative } from "./readiness";
import type {
  Initiative,
  Portfolio,
  RiskTier,
  ScoringPolicy,
  Stage,
} from "./types";
import { RISK_TIERS, STAGES } from "./types";

/** Portfolio-level aggregates, all derived from the same evidence. */

export interface PortfolioMetrics {
  totalInitiatives: number;
  totalValueUsd: number;
  productionReadyCount: number;
  liveCount: number;
  blockedCount: number;
  blockedValueUsd: number;
  averageReadiness: number;
  /**
   * Readiness weighted by value at stake. Diverging sharply from the plain
   * average means the big bets are the unready ones.
   */
  valueWeightedReadiness: number;
  averageStageAgeDays: number;
  /** Initiatives sitting in a stage whose own gate they never cleared. */
  controlDebtCount: number;
  systemicBlockerCount: number;
  /**
   * Total control-team effort still standing between the portfolio and having
   * everything production ready. Unlike the blocked count this falls
   * monotonically as remediations land, which makes it the honest measure of
   * whether a decision moved the portfolio forward: clearing one gate reveals
   * the next, so "blocked now" can legitimately rise after good work.
   */
  outstandingEffortDays: number;
  /** Annual value not yet at production readiness. */
  valueNotReadyUsd: number;
}

const mean = (values: number[]): number =>
  values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;

export const portfolioMetrics = (
  initiatives: Portfolio,
  policy: ScoringPolicy = DEFAULT_POLICY,
): PortfolioMetrics => {
  const scores = initiatives.map(
    (initiative) => scoreInitiative(initiative, policy).score,
  );
  const blocked = initiatives.filter((initiative) =>
    isBlocked(initiative, policy),
  );
  const totalValueUsd = initiatives.reduce(
    (total, initiative) => total + initiative.annualValueUsd,
    0,
  );

  const weighted = initiatives.reduce(
    (total, initiative, index) =>
      total + scores[index] * initiative.annualValueUsd,
    0,
  );

  return {
    totalInitiatives: initiatives.length,
    totalValueUsd,
    productionReadyCount: initiatives.filter(isProductionReady).length,
    liveCount: initiatives.filter(isLive).length,
    blockedCount: blocked.length,
    blockedValueUsd: blocked.reduce(
      (total, initiative) => total + initiative.annualValueUsd,
      0,
    ),
    averageReadiness: mean(scores),
    valueWeightedReadiness: totalValueUsd === 0 ? 0 : weighted / totalValueUsd,
    averageStageAgeDays: mean(
      initiatives.map((initiative) => initiative.stageAgeDays),
    ),
    controlDebtCount: initiatives.filter(
      (initiative) => controlDebt(initiative, policy).length > 0,
    ).length,
    systemicBlockerCount: blockerPatterns(initiatives, policy).filter(
      (pattern) => pattern.isSystemic,
    ).length,
    outstandingEffortDays: initiatives.reduce(
      (total, initiative) =>
        total +
        deriveGaps(initiative, policy).reduce(
          (sum, gap) => sum + gap.effortDays,
          0,
        ),
      0,
    ),
    valueNotReadyUsd: initiatives
      .filter((initiative) => !isProductionReady(initiative))
      .reduce((total, initiative) => total + initiative.annualValueUsd, 0),
  };
};

export interface Distribution<T extends string> {
  name: T;
  count: number;
  valueUsd: number;
}

export const stageDistribution = (
  initiatives: Portfolio,
): Array<Distribution<Stage>> =>
  STAGES.map((stage) => {
    const matching = initiatives.filter(
      (initiative) => initiative.stage === stage,
    );
    return {
      name: stage,
      count: matching.length,
      valueUsd: matching.reduce(
        (total, initiative) => total + initiative.annualValueUsd,
        0,
      ),
    };
  });

export const riskDistribution = (
  initiatives: Portfolio,
): Array<Distribution<RiskTier>> =>
  RISK_TIERS.map((tier) => {
    const matching = initiatives.filter(
      (initiative) => initiative.riskTier === tier,
    );
    return {
      name: tier,
      count: matching.length,
      valueUsd: matching.reduce(
        (total, initiative) => total + initiative.annualValueUsd,
        0,
      ),
    };
  }).filter((entry) => entry.count > 0);

export const AGING_BUCKETS = ["0-14", "15-30", "31-60", "60+"] as const;
export type AgingBucket = (typeof AGING_BUCKETS)[number];

export const agingBucket = (days: number): AgingBucket => {
  if (days <= 14) return "0-14";
  if (days <= 30) return "15-30";
  if (days <= 60) return "31-60";
  return "60+";
};

export interface HeatmapRow {
  stage: Stage;
  cells: Array<{ bucket: AgingBucket; count: number; initiativeIds: string[] }>;
}

export const stageAgingHeatmap = (initiatives: Portfolio): HeatmapRow[] =>
  STAGES.map((stage) => ({
    stage,
    cells: AGING_BUCKETS.map((bucket) => {
      const matching = initiatives.filter(
        (initiative) =>
          initiative.stage === stage &&
          agingBucket(initiative.stageAgeDays) === bucket,
      );
      return {
        bucket,
        count: matching.length,
        initiativeIds: matching.map((initiative) => initiative.id),
      };
    }),
  }));

export interface ControlQueueEntry {
  owningFunction: string;
  /** Distinct blocking controls assigned to this function. */
  openItems: number;
  totalEffortDays: number;
  averageAgeDays: number;
  valueTrappedUsd: number;
}

/**
 * Open control work grouped by the team that owns it.
 *
 * This is the capacity view: the constraint on conversion is usually one or
 * two review functions, and naming them is more actionable than another chart
 * of how many initiatives are "in review".
 */
export const controlQueueLoad = (
  initiatives: Portfolio,
  policy: ScoringPolicy = DEFAULT_POLICY,
): ControlQueueEntry[] => {
  const byFunction = new Map<
    string,
    {
      openItems: number;
      totalEffortDays: number;
      ages: number[];
      valueTrappedUsd: number;
    }
  >();

  for (const initiative of initiatives) {
    for (const blocker of deriveGaps(initiative, policy)) {
      const key = blocker.control.remediation.owningFunction;
      const entry = byFunction.get(key) ?? {
        openItems: 0,
        totalEffortDays: 0,
        ages: [],
        valueTrappedUsd: 0,
      };
      entry.openItems += 1;
      entry.totalEffortDays += blocker.effortDays;
      entry.ages.push(blocker.ageDays);
      entry.valueTrappedUsd += initiative.annualValueUsd;
      byFunction.set(key, entry);
    }
  }

  return [...byFunction.entries()]
    .map(([owningFunction, entry]) => ({
      owningFunction,
      openItems: entry.openItems,
      totalEffortDays: entry.totalEffortDays,
      averageAgeDays: mean(entry.ages),
      valueTrappedUsd: entry.valueTrappedUsd,
    }))
    .sort(
      (a, b) =>
        b.totalEffortDays - a.totalEffortDays ||
        a.owningFunction.localeCompare(b.owningFunction),
    );
};

export const findInitiative = (
  initiatives: Portfolio,
  id: string,
): Initiative | undefined =>
  initiatives.find((initiative) => initiative.id === id);
