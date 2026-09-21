/**
 * Visual proof: capture the three specimen screens in both themes.
 *
 * Narrower than the full screenshot pass — this is the review artifact for the
 * identity, not the README set. Assumes a preview server on 4188.
 */
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:4188";
const OUT = path.resolve("docs/proof");

const SCREENS = [
  { name: "landing", path: "/" },
  { name: "portfolio", path: "/portfolio" },
  { name: "initiative", path: "/initiatives/AI-001" },
];

const main = async () => {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();

  for (const theme of ["light", "dark"] as const) {
    for (const screen of SCREENS) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        deviceScaleFactor: 2,
        colorScheme: theme,
        reducedMotion: "reduce",
      });
      await context.addInitScript((value) => {
        window.localStorage.setItem("signaltower.theme", value);
      }, theme);

      const page = await context.newPage();
      await page.goto(`${BASE}${screen.path}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);

      const file = path.join(OUT, `${screen.name}-${theme}.png`);
      await page.screenshot({ path: file });
      console.log(`  ${path.relative(process.cwd(), file)}`);
      await context.close();
    }
  }

  // One narrow specimen, because the identity has to survive a phone.
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 900 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await mobile.addInitScript(() =>
    window.localStorage.setItem("signaltower.theme", "light"),
  );
  const page = await mobile.newPage();
  await page.goto(`${BASE}/initiatives/AI-001`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const file = path.join(OUT, "initiative-mobile-light.png");
  await page.screenshot({ path: file });
  console.log(`  ${path.relative(process.cwd(), file)}`);
  await mobile.close();

  await browser.close();
  console.log("\nDone.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
