/**
 * Developer utility: print what the engine derives from the fixture.
 * Run with `npm run inspect`. Not part of the app bundle.
 */
import { portfolio } from "../src/data/portfolio";
import {
  blockerPatterns,
  compareStrategies,
  controlDebt,
  deriveBlockers,
  nextGate,
  portfolioMetrics,
  rankDecisions,
  scoreInitiative,
} from "../src/engine";

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

console.log("=== READINESS (derived) ===");
for (const initiative of portfolio) {
  const result = scoreInitiative(initiative);
  const blockers = deriveBlockers(initiative);
  const gate = nextGate(initiative);
  const debt = controlDebt(initiative);
  console.log(
    `${initiative.id} ${String(result.score).padStart(3)}%  ${result.band.padEnd(20)} stage=${initiative.stage.padEnd(16)} ` +
      `next=${(gate?.targetStage ?? "-").padEnd(16)} blockers=${blockers.length} debt=${debt.length} ` +
      `top=${blockers[0]?.control.shortLabel ?? "-"}`,
  );
}

console.log("\n=== PORTFOLIO METRICS ===");
const metrics = portfolioMetrics(portfolio);
console.log(metrics);

console.log("\n=== SYSTEMIC BLOCKER PATTERNS ===");
for (const pattern of blockerPatterns(portfolio)) {
  console.log(
    `${pattern.control.shortLabel.padEnd(18)} count=${pattern.count} systemic=${String(pattern.isSystemic).padEnd(5)} value=${usd(pattern.valueTrappedUsd)}`,
  );
}

console.log("\n=== TOP DECISIONS ===");
for (const decision of rankDecisions(portfolio).slice(0, 8)) {
  console.log(
    `${decision.score.toFixed(2).padStart(6)}  ${decision.kind.padEnd(10)} ${usd(decision.valueUnlockedUsd).padStart(7)} ${String(decision.effortDays).padStart(3)}d  ${decision.title}`,
  );
}

console.log("\n=== FORECAST ===");
const comparison = compareStrategies(portfolio);
console.log(
  `value-ranked final: ${usd(comparison.valueRanked[comparison.valueRanked.length - 1].valueUnlockedUsd)}`,
);
console.log(
  `fifo final:         ${usd(comparison.fifo[comparison.fifo.length - 1].valueUnlockedUsd)}`,
);
console.log(`weeks sooner:       ${comparison.weeksSooner.toFixed(1)}`);
console.log(`earlier realisation: ${usd(comparison.earlierRealisationUsd)}`);
