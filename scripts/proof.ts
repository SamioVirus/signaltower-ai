/**
 * Visual proof: capture all specimen screens in both themes.
 *
 * Runs against the production preview server.
 */
import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const PORT = 4188;
const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const OUT = path.resolve("docs/proof");

const SCREENS = [
  { name: "landing", path: "/" },
  { name: "portfolio", path: "/portfolio" },
  { name: "readiness", path: "/readiness" },
  { name: "initiative", path: "/initiatives/AI-001" },
  { name: "bottlenecks", path: "/bottlenecks" },
  { name: "decisions", path: "/decisions" },
  { name: "simulator", path: "/simulator" },
  { name: "operating-model", path: "/operating-model" },
  { name: "methodology", path: "/methodology" },
];

const startPreview = () => {
  const child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "preview", "--", "--port", String(PORT), "--strictPort"],
    { stdio: "ignore", shell: process.platform === "win32" },
  );
  return child;
};

const waitForServer = async (
  url: string,
  timeoutMs = 60_000,
): Promise<void> => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Preview server did not start at ${url}`);
};

const main = async () => {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const server = !process.env.BASE_URL ? startPreview() : null;

  try {
    if (server) await waitForServer(BASE);
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
  } finally {
    server?.kill();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
