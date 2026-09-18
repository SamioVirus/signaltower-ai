import { describe, expect, it } from "vitest";

import { compareStrategies, forecast } from "@/engine/forecast";
import { isProductionReady } from "@/engine/gates";

import { fullyApproved, nothingDone, withEvidence } from "./factory";

const options = { horizonWeeks: 12, weeklyCapacityDays: 10 } as const;

const nearlyReady = (id: string, annualValueUsd = 1_000_000) =>
  withEvidence(fullyApproved({ id, annualValueUsd, stage: "Pilot" }), {
    lineage: "missing",
  });

describe("forecast", () => {
  it("starts from the current state at week 0", () => {
    const portfolio = [fullyApproved({ id: "A", stage: "Production Ready" })];
    const weeks = forecast(portfolio, { ...options, strategy: "value-ranked" });

    expect(weeks[0].week).toBe(0);
    expect(weeks[0].productionReadyCount).toBe(1);
    expect(weeks[0].completed).toHaveLength(0);
  });

  it("returns one entry per week plus the starting point", () => {
    const weeks = forecast([nearlyReady("A")], {
      ...options,
      strategy: "fifo",
    });
    expect(weeks).toHaveLength(options.horizonWeeks + 1);
  });

  it("never goes backwards on value", () => {
    const portfolio = [
      nearlyReady("A"),
      nearlyReady("B", 2_000_000),
      nothingDone({ id: "C" }),
    ];
    const weeks = forecast(portfolio, {
      horizonWeeks: 26,
      weeklyCapacityDays: 12,
      strategy: "value-ranked",
    });

    for (let i = 1; i < weeks.length; i += 1) {
      expect(weeks[i].valueUnlockedUsd).toBeGreaterThanOrEqual(
        weeks[i - 1].valueUnlockedUsd,
      );
      expect(weeks[i].productionReadyCount).toBeGreaterThanOrEqual(
        weeks[i - 1].productionReadyCount,
      );
    }
  });

  it("makes no progress without capacity", () => {
    const weeks = forecast([nearlyReady("A")], {
      horizonWeeks: 8,
      weeklyCapacityDays: 0,
      strategy: "value-ranked",
    });

    expect(weeks[weeks.length - 1].valueUnlockedUsd).toBe(
      weeks[0].valueUnlockedUsd,
    );
    expect(weeks.every((week) => week.completed.length === 0)).toBe(true);
  });

  it("converts an initiative once enough capacity has been spent", () => {
    // lineage costs 10 days; 10 days a week clears it in the first week.
    const weeks = forecast([nearlyReady("A")], {
      horizonWeeks: 4,
      weeklyCapacityDays: 10,
      strategy: "value-ranked",
    });

    expect(weeks[0].productionReadyCount).toBe(0);
    expect(weeks[weeks.length - 1].productionReadyCount).toBe(1);
  });

  it("splits work that costs more than one week of capacity across weeks", () => {
    // 10 days of work against 4 days a week: nothing lands before week 3.
    const weeks = forecast([nearlyReady("A")], {
      horizonWeeks: 6,
      weeklyCapacityDays: 4,
      strategy: "value-ranked",
    });

    expect(weeks[1].completed).toHaveLength(0);
    expect(weeks[2].completed).toHaveLength(0);
    expect(weeks[3].completed).toHaveLength(1);
  });

  it("is deterministic", () => {
    const portfolio = [nearlyReady("A"), nearlyReady("B", 3_000_000)];
    const run = () =>
      forecast(portfolio, { ...options, strategy: "value-ranked" });

    expect(run()).toEqual(run());
  });

  it("does not mutate the portfolio", () => {
    const portfolio = [nearlyReady("A"), nothingDone({ id: "B" })];
    const snapshot = JSON.stringify(portfolio);

    forecast(portfolio, { ...options, strategy: "value-ranked" });

    expect(JSON.stringify(portfolio)).toBe(snapshot);
  });

  it("leaves an already converted portfolio flat", () => {
    const portfolio = [fullyApproved({ id: "A", stage: "Production Ready" })];
    const weeks = forecast(portfolio, { ...options, strategy: "value-ranked" });

    expect(weeks.every((week) => week.productionReadyCount === 1)).toBe(true);
    expect(portfolio.every(isProductionReady)).toBe(true);
  });
});

describe("compareStrategies", () => {
  /**
   * Two cheap, high-value initiatives and one very old, very expensive one.
   * FIFO starts on the old expensive item and lands nothing for weeks; the
   * ranked queue takes the cheap conversions first.
   */
  const portfolio = [
    withEvidence(
      fullyApproved({
        id: "OLD",
        stage: "Intake",
        stageAgeDays: 300,
        annualValueUsd: 100_000,
      }),
      {
        sponsor: "missing",
        "kpi-baseline": "missing",
        "data-quality": "missing",
        lineage: "missing",
        "security-review": "missing",
        "privacy-review": "missing",
        "model-risk": "missing",
        "human-oversight": "missing",
        monitoring: "missing",
      },
    ),
    nearlyReady("QUICK-A", 4_000_000),
    nearlyReady("QUICK-B", 3_000_000),
  ];

  it("lands value sooner under the ranked queue", () => {
    const comparison = compareStrategies(portfolio, {
      horizonWeeks: 26,
      weeklyCapacityDays: 8,
    });

    expect(comparison.weeksSooner).toBeGreaterThan(0);
    expect(comparison.earlierRealisationUsd).toBeGreaterThan(0);
  });

  it("prefers value per remaining day over raw value", () => {
    // CHEAP is worth less in total but lands far sooner per day spent, so a
    // weighted-shortest-processing-time queue takes it first. A queue that
    // simply chased the biggest number would not.
    const cheapAndValuable = withEvidence(
      fullyApproved({
        id: "CHEAP",
        stage: "Pilot",
        annualValueUsd: 2_000_000,
        stageAgeDays: 1,
      }),
      { lineage: "missing" },
    );
    const expensiveAndBigger = withEvidence(
      fullyApproved({
        id: "BIG",
        stage: "Pilot",
        annualValueUsd: 3_000_000,
        stageAgeDays: 1,
      }),
      {
        lineage: "missing",
        "model-risk": "missing",
        monitoring: "missing",
        "human-oversight": "missing",
      },
    );

    const weeks = forecast([expensiveAndBigger, cheapAndValuable], {
      horizonWeeks: 3,
      weeklyCapacityDays: 10,
      strategy: "value-ranked",
    });

    // Only the cheap one can finish inside three weeks of this capacity.
    expect(weeks[weeks.length - 1].valueUnlockedUsd).toBe(2_000_000);
  });

  it("returns both curves over the same horizon", () => {
    const comparison = compareStrategies(portfolio, {
      horizonWeeks: 10,
      weeklyCapacityDays: 8,
    });

    expect(comparison.valueRanked).toHaveLength(11);
    expect(comparison.fifo).toHaveLength(11);
  });

  it("reports no advantage when there is nothing to sequence", () => {
    const comparison = compareStrategies(
      [fullyApproved({ id: "A", stage: "Production Ready" })],
      {
        horizonWeeks: 8,
        weeklyCapacityDays: 8,
      },
    );

    expect(comparison.weeksSooner).toBe(0);
    expect(comparison.earlierRealisationUsd).toBe(0);
    expect(comparison.valueAdvantageUsd).toBe(0);
  });
});
