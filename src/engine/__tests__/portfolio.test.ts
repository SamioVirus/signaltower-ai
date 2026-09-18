import { describe, expect, it } from "vitest";

import {
  agingBucket,
  controlQueueLoad,
  findInitiative,
  portfolioMetrics,
  riskDistribution,
  stageAgingHeatmap,
  stageDistribution,
} from "@/engine/portfolio";
import { STAGES } from "@/engine/types";

import { fullyApproved, nothingDone, withEvidence } from "./factory";

describe("portfolioMetrics", () => {
  it("handles an empty portfolio without dividing by zero", () => {
    const metrics = portfolioMetrics([]);

    expect(metrics.totalInitiatives).toBe(0);
    expect(metrics.averageReadiness).toBe(0);
    expect(metrics.valueWeightedReadiness).toBe(0);
    expect(Number.isNaN(metrics.valueWeightedReadiness)).toBe(false);
  });

  it("sums value at stake", () => {
    const metrics = portfolioMetrics([
      fullyApproved({ id: "A", annualValueUsd: 1_000_000 }),
      fullyApproved({ id: "B", annualValueUsd: 500_000 }),
    ]);

    expect(metrics.totalValueUsd).toBe(1_500_000);
  });

  it("counts only what is actually blocked at the next gate", () => {
    const metrics = portfolioMetrics([
      fullyApproved({ id: "CLEAN" }),
      withEvidence(fullyApproved({ id: "STUCK", stage: "Pilot" }), {
        lineage: "missing",
      }),
    ]);

    expect(metrics.blockedCount).toBe(1);
  });

  it("weights readiness by value", () => {
    // The big bet is the unready one, so the weighted figure must fall below
    // the plain average. This is the divergence the metric exists to show.
    const metrics = portfolioMetrics([
      fullyApproved({ id: "SMALL", annualValueUsd: 100_000 }),
      nothingDone({ id: "BIG", annualValueUsd: 9_000_000 }),
    ]);

    expect(metrics.valueWeightedReadiness).toBeLessThan(
      metrics.averageReadiness,
    );
  });

  describe("outstanding effort", () => {
    it("is zero for a portfolio with nothing left to do", () => {
      expect(
        portfolioMetrics([fullyApproved({ id: "A" })]).outstandingEffortDays,
      ).toBe(0);
    });

    it("sums the remediation cost of every outstanding control", () => {
      // lineage 10d + monitoring 10d, straight from the policy.
      const metrics = portfolioMetrics([
        withEvidence(fullyApproved({ id: "A", stage: "Pilot" }), {
          lineage: "missing",
          monitoring: "missing",
        }),
      ]);

      expect(metrics.outstandingEffortDays).toBe(20);
    });

    it("falls when a remediation lands, unlike the blocked count", () => {
      // Clearing a gate exposes the next one, so blockedCount can legitimately
      // rise after good work. Outstanding effort is the metric that does not
      // mislead, which is why the simulator reports it.
      const before = withEvidence(fullyApproved({ id: "A", stage: "Intake" }), {
        sponsor: "missing",
        "kpi-baseline": "missing",
      });
      const after = withEvidence(before, { sponsor: "approved" });

      expect(portfolioMetrics([after]).outstandingEffortDays).toBeLessThan(
        portfolioMetrics([before]).outstandingEffortDays,
      );
    });
  });

  it("reports the value not yet at production readiness", () => {
    const metrics = portfolioMetrics([
      fullyApproved({
        id: "READY",
        stage: "Production Ready",
        annualValueUsd: 1_000_000,
      }),
      nothingDone({ id: "NOT", annualValueUsd: 400_000 }),
    ]);

    expect(metrics.valueNotReadyUsd).toBe(400_000);
  });

  it("counts initiatives carrying control debt", () => {
    const metrics = portfolioMetrics([
      withEvidence(fullyApproved({ id: "DEBT", stage: "Control Review" }), {
        lineage: "missing",
      }),
      fullyApproved({ id: "CLEAN", stage: "Control Review" }),
    ]);

    expect(metrics.controlDebtCount).toBe(1);
  });
});

describe("stageDistribution", () => {
  it("returns every stage, including empty ones", () => {
    const distribution = stageDistribution([fullyApproved({ stage: "Pilot" })]);

    expect(distribution).toHaveLength(STAGES.length);
    expect(distribution.find((entry) => entry.name === "Pilot")?.count).toBe(1);
    expect(distribution.find((entry) => entry.name === "Intake")?.count).toBe(
      0,
    );
  });

  it("counts every initiative exactly once", () => {
    const portfolio = [
      fullyApproved({ id: "A", stage: "Pilot" }),
      fullyApproved({ id: "B", stage: "Pilot" }),
      fullyApproved({ id: "C", stage: "Monitoring" }),
    ];
    const total = stageDistribution(portfolio).reduce(
      (sum, entry) => sum + entry.count,
      0,
    );

    expect(total).toBe(portfolio.length);
  });
});

describe("riskDistribution", () => {
  it("omits tiers with no initiatives", () => {
    const names = riskDistribution([fullyApproved({ riskTier: "High" })]).map(
      (entry) => entry.name,
    );

    expect(names).toEqual(["High"]);
  });
});

describe("agingBucket", () => {
  it.each([
    [0, "0-14"],
    [14, "0-14"],
    [15, "15-30"],
    [30, "15-30"],
    [31, "31-60"],
    [60, "31-60"],
    [61, "60+"],
    [400, "60+"],
  ])("puts %i days in %s", (days, bucket) => {
    expect(agingBucket(days)).toBe(bucket);
  });
});

describe("stageAgingHeatmap", () => {
  it("places each initiative in exactly one cell", () => {
    const portfolio = [
      fullyApproved({ id: "A", stage: "Pilot", stageAgeDays: 5 }),
      fullyApproved({ id: "B", stage: "Pilot", stageAgeDays: 95 }),
    ];
    const total = stageAgingHeatmap(portfolio)
      .flatMap((row) => row.cells)
      .reduce((sum, cell) => sum + cell.count, 0);

    expect(total).toBe(portfolio.length);
  });

  it("names the initiatives in each cell so a cell can be drilled into", () => {
    const heatmap = stageAgingHeatmap([
      fullyApproved({ id: "A", stage: "Pilot", stageAgeDays: 5 }),
    ]);
    const cell = heatmap
      .find((row) => row.stage === "Pilot")
      ?.cells.find((candidate) => candidate.bucket === "0-14");

    expect(cell?.initiativeIds).toEqual(["A"]);
  });
});

describe("controlQueueLoad", () => {
  it("is empty for a clean portfolio", () => {
    expect(controlQueueLoad([fullyApproved({ id: "A" })])).toHaveLength(0);
  });

  it("groups outstanding work by the team that owns it", () => {
    const load = controlQueueLoad([
      withEvidence(fullyApproved({ id: "A", stage: "Pilot" }), {
        lineage: "missing",
      }),
      withEvidence(fullyApproved({ id: "B", stage: "Pilot" }), {
        "data-quality": "missing",
      }),
    ]);

    // Both controls belong to the Data Governance Office.
    const dgo = load.find(
      (entry) => entry.owningFunction === "Data Governance Office",
    );
    expect(dgo?.openItems).toBe(2);
    expect(dgo?.totalEffortDays).toBe(25);
  });

  it("sorts by the effort each team is carrying", () => {
    const effort = controlQueueLoad([
      nothingDone({ id: "A", stage: "Intake" }),
    ]).map((entry) => entry.totalEffortDays);

    expect([...effort].sort((a, b) => b - a)).toEqual(effort);
  });
});

describe("findInitiative", () => {
  it("finds by id and returns undefined otherwise", () => {
    const portfolio = [fullyApproved({ id: "A" })];

    expect(findInitiative(portfolio, "A")?.id).toBe("A");
    expect(findInitiative(portfolio, "NOPE")).toBeUndefined();
  });
});
