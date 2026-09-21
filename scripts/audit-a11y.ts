/**
 * Developer utility: print every accessibility violation with the offending
 * element and the measured contrast, so failures are actionable rather than
 * just red. Assumes a preview server is already running on 4188.
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:4188";
const ROUTES = [
  "/",
  "/portfolio",
  "/readiness",
  "/initiatives/AI-001",
  "/bottlenecks",
  "/decisions",
  "/simulator",
  "/operating-model",
  "/methodology",
];

const main = async () => {
  const browser = await chromium.launch();

  for (const theme of ["light", "dark"] as const) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: theme,
    });
    await context.addInitScript((value) => {
      window.localStorage.setItem("signaltower.theme", value);
    }, theme);

    const page = await context.newPage();

    for (const route of ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      if (results.violations.length === 0) continue;

      console.log(`\n=== ${theme} ${route} ===`);
      for (const violation of results.violations) {
        console.log(`${violation.id} (${violation.nodes.length})`);
        for (const node of violation.nodes.slice(0, 6)) {
          console.log(`  ${node.target.join(" ")}`);
          console.log(
            `    ${node.failureSummary?.split("\n").slice(1).join(" | ")}`,
          );
          console.log(`    html: ${node.html.slice(0, 140)}`);
        }
      }
    }

    await context.close();
  }

  await browser.close();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
