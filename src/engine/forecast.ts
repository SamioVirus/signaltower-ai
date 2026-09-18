import { blockerPatterns, deriveGaps } from "./blockers";
import { isProductionReady } from "./gates";
import { DEFAULT_POLICY } from "./policy";
import { advanceInitiative } from "./scenario";
import type { ControlId, Initiative, Portfolio, ScoringPolicy } from "./types";

/**
 * Conversion forecast.
 *
 * Control capacity is finite, so the order work is taken in decides how much
 * value lands and when. This is a deterministic queue simulation: each week a
 * fixed number of control-team days is spent on the front of the queue, and
 * the only thing that differs between the two strategies is how that queue is
 * ordered.
 *
 * It is a model, not a prediction. Its job is to make the cost of poor
 * sequencing visible, using the same policy that produced every other number
 * in the application. The assumptions it makes are listed on the Methodology
 * page rather than buried here.
 */

export type ForecastStrategy =
  /** Oldest thing first: the default behaviour of an unmanaged request queue. */
  | "fifo"
  /** Highest value per remaining day of effort first, finishing one initiative
   *  before starting the next, and reusing a control pattern once built. */
  | "value-ranked";

export interface ForecastOptions {
  horizonWeeks: number;
  /** Control-team days available across the portfolio each week. */
  weeklyCapacityDays: number;
  strategy: ForecastStrategy;
}

export interface ForecastWeek {
  week: number;
  productionReadyCount: number;
  /** Annualised value of everything at Production Ready or beyond. */
  valueUnlockedUsd: number;
  /** Controls finished during this week. */
  completed: Array<{ initiativeId: string; controlId: ControlId }>;
}

export const DEFAULT_FORECAST_OPTIONS: ForecastOptions = {
  horizonWeeks: 26,
  weeklyCapacityDays: 12,
  strategy: "value-ranked",
};

/**
 * What a second and subsequent application of a systemic control costs once a
 * reusable pattern exists, as a fraction of building it from scratch.
 */
export const TEMPLATE_REUSE_FACTOR = 0.4;

interface WorkItem {
  initiativeId: string;
  controlId: ControlId;
  baseEffortDays: number;
}

const valueUnlocked = (initiatives: readonly Initiative[]): number =>
  initiatives
    .filter(isProductionReady)
    .reduce((total, initiative) => total + initiative.annualValueUsd, 0);

const productionReadyCount = (initiatives: readonly Initiative[]): number =>
  initiatives.filter(isProductionReady).length;

/** Total control effort still between an initiative and production readiness. */
const remainingEffortDays = (
  initiative: Initiative,
  policy: ScoringPolicy,
): number =>
  deriveGaps(initiative, policy).reduce(
    (total, gap) => total + gap.effortDays,
    0,
  );

/**
 * Order the outstanding work.
 *
 * Both strategies emit every initiative's work as a contiguous block, so the
 * simulation finishes one initiative before starting the next. That is
 * deliberate: spreading finite capacity across everything in flight is the
 * failure mode this forecast exists to expose, and it would be dishonest to
 * hand one strategy a work-in-progress limit and not the other.
 *
 * The only difference is which initiative goes first.
 *
 * - `fifo` takes the oldest. Value and cost do not enter into it, which is
 *   exactly what an unmanaged request queue does.
 * - `value-ranked` takes the highest ratio of annual value to the effort still
 *   remaining before production readiness. That is weighted shortest
 *   processing time, the rule that minimises value-weighted completion time on
 *   a single constrained resource, which is what a shared control function is.
 *
 * Note what this deliberately does *not* use: the decision score. That score
 * divides by the effort of the next decision, not by the effort still left to
 * reach production, so it happily promotes an initiative with a cheap next
 * step and sixty days of work behind it. Cheap to start is not the same as
 * close to landing.
 */
const buildOrder = (
  initiatives: readonly Initiative[],
  strategy: ForecastStrategy,
  policy: ScoringPolicy,
): WorkItem[] => {
  const ordered =
    strategy === "value-ranked"
      ? [...initiatives].sort((a, b) => {
          const aRatio =
            a.annualValueUsd / Math.max(remainingEffortDays(a, policy), 1);
          const bRatio =
            b.annualValueUsd / Math.max(remainingEffortDays(b, policy), 1);
          return bRatio - aRatio || a.id.localeCompare(b.id);
        })
      : [...initiatives].sort(
          (a, b) => b.stageAgeDays - a.stageAgeDays || a.id.localeCompare(b.id),
        );

  return ordered.flatMap((initiative) =>
    deriveGaps(initiative, policy).map((gap) => ({
      initiativeId: initiative.id,
      controlId: gap.controlId,
      baseEffortDays: gap.effortDays,
    })),
  );
};

export const forecast = (
  portfolio: Portfolio,
  options: ForecastOptions = DEFAULT_FORECAST_OPTIONS,
  policy: ScoringPolicy = DEFAULT_POLICY,
): ForecastWeek[] => {
  let state: Initiative[] = portfolio.map((initiative) => ({
    ...initiative,
    evidence: { ...initiative.evidence },
  }));

  const systemic = new Set(
    blockerPatterns(state, policy)
      .filter((pattern) => pattern.isSystemic)
      .map((pattern) => pattern.controlId),
  );

  const order = buildOrder(state, options.strategy, policy);
  let cursor = 0;
  let active: { item: WorkItem; remainingDays: number } | null = null;

  /**
   * A managed queue notices it is solving the same control repeatedly and
   * builds the pattern once. An unmanaged queue works ticket by ticket and
   * pays full price every time. That difference is the entire argument for
   * running this as a portfolio, so the model states it explicitly rather
   * than smuggling it into a fudge factor.
   */
  const templatesBuilt = new Set<ControlId>();
  const costOf = (item: WorkItem): number => {
    const reusable =
      options.strategy === "value-ranked" &&
      systemic.has(item.controlId) &&
      templatesBuilt.has(item.controlId);
    return reusable
      ? Math.max(1, Math.ceil(item.baseEffortDays * TEMPLATE_REUSE_FACTOR))
      : item.baseEffortDays;
  };

  const isOutstanding = (item: WorkItem): boolean => {
    const initiative = state.find(
      (candidate) => candidate.id === item.initiativeId,
    );
    return initiative?.evidence[item.controlId]?.state !== "approved";
  };

  const weeks: ForecastWeek[] = [
    {
      week: 0,
      productionReadyCount: productionReadyCount(state),
      valueUnlockedUsd: valueUnlocked(state),
      completed: [],
    },
  ];

  for (let week = 1; week <= options.horizonWeeks; week += 1) {
    let capacity = options.weeklyCapacityDays;
    const completed: ForecastWeek["completed"] = [];

    while (capacity > 0) {
      if (!active) {
        while (cursor < order.length && !isOutstanding(order[cursor]))
          cursor += 1;
        if (cursor >= order.length) break;
        const item = order[cursor];
        cursor += 1;
        active = { item, remainingDays: costOf(item) };
      }

      const spend = Math.min(capacity, active.remainingDays);
      active.remainingDays -= spend;
      capacity -= spend;

      if (active.remainingDays > 0) break;

      const { item } = active;
      active = null;
      templatesBuilt.add(item.controlId);
      completed.push({
        initiativeId: item.initiativeId,
        controlId: item.controlId,
      });

      state = state.map((initiative) => {
        if (initiative.id !== item.initiativeId) return initiative;
        const artifact = initiative.evidence[item.controlId];
        if (!artifact) return initiative;
        return {
          ...initiative,
          evidence: {
            ...initiative.evidence,
            [item.controlId]: { ...artifact, state: "approved", ageDays: 0 },
          },
        };
      });
    }

    // Age everything still waiting, then promote whatever now qualifies.
    state = state.map((initiative) =>
      advanceInitiative(
        { ...initiative, stageAgeDays: initiative.stageAgeDays + 7 },
        policy,
      ),
    );

    weeks.push({
      week,
      productionReadyCount: productionReadyCount(state),
      valueUnlockedUsd: valueUnlocked(state),
      completed,
    });
  }

  return weeks;
};

export interface StrategyComparison {
  valueRanked: ForecastWeek[];
  fifo: ForecastWeek[];
  /** Extra annualised value standing at the horizon. */
  valueAdvantageUsd: number;
  /**
   * Value-weighted weeks sooner the ranked queue reaches each value level.
   *
   * Averaging the lead at each value step, weighted by the size of that step,
   * states the difference without overclaiming: when both queues finish the
   * same work inside the horizon the endpoints match, and the real gain is
   * that value arrived earlier.
   */
  weeksSooner: number;
  /**
   * Cash value of arriving earlier: the area between the two curves, divided
   * by 52 to convert annualised-value-weeks into realised value.
   */
  earlierRealisationUsd: number;
}

/** First week a strategy reaches at least `target` value, or null. */
const firstWeekAtLeast = (
  weeks: ForecastWeek[],
  target: number,
): number | null =>
  weeks.find((week) => week.valueUnlockedUsd >= target)?.week ?? null;

export const compareStrategies = (
  portfolio: Portfolio,
  options: Omit<ForecastOptions, "strategy"> = DEFAULT_FORECAST_OPTIONS,
  policy: ScoringPolicy = DEFAULT_POLICY,
): StrategyComparison => {
  const valueRanked = forecast(
    portfolio,
    { ...options, strategy: "value-ranked" },
    policy,
  );
  const fifo = forecast(portfolio, { ...options, strategy: "fifo" }, policy);

  const rankedFinal =
    valueRanked[valueRanked.length - 1]?.valueUnlockedUsd ?? 0;
  const fifoFinal = fifo[fifo.length - 1]?.valueUnlockedUsd ?? 0;

  // Area between the curves, in annualised-value-weeks.
  const valueWeeks = valueRanked.reduce(
    (total, week, index) =>
      total + (week.valueUnlockedUsd - (fifo[index]?.valueUnlockedUsd ?? 0)),
    0,
  );

  // Every distinct value level FIFO reaches, and the ranked queue's lead there.
  const levels = [...new Set(fifo.map((week) => week.valueUnlockedUsd))]
    .filter((level) => level > 0)
    .sort((a, b) => a - b);

  let weightedLead = 0;
  let weightTotal = 0;
  let previousLevel = 0;
  for (const level of levels) {
    const step = level - previousLevel;
    previousLevel = level;
    const rankedWeek = firstWeekAtLeast(valueRanked, level);
    const fifoWeek = firstWeekAtLeast(fifo, level);
    if (rankedWeek === null || fifoWeek === null) continue;
    weightedLead += step * (fifoWeek - rankedWeek);
    weightTotal += step;
  }

  return {
    valueRanked,
    fifo,
    valueAdvantageUsd: rankedFinal - fifoFinal,
    weeksSooner: weightTotal === 0 ? 0 : weightedLead / weightTotal,
    earlierRealisationUsd: valueWeeks / 52,
  };
};
