/**
 * Screenshot pipeline.
 *
 * Regenerates every image used in the README and docs, in both themes, from
 * the running production build. Run with `npm run screenshots`.
 *
 * Automating this matters more than it looks: hand-captured screenshots go
 * stale the moment the interface moves, and a portfolio piece whose images
 * disagree with the deployed app is worse than one with no images at all.
 */
import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";
import type { Browser, Page } from "playwright";

const PORT = 4188;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = path.resolve("docs/screenshots");

interface Shot {
  name: string;
  path: string;
  /** Capture the whole scrollable page rather than just the viewport. */
  fullPage?: boolean;
  /** Both themes, or just one. */
  themes?: Array<"light" | "dark">;
  /** Extra interaction before the shot. */
  prepare?: (page: Page) => Promise<void>;
}

const SHOTS: Shot[] = [
  { name: "01-landing", path: "/" },
  { name: "02-portfolio", path: "/portfolio" },
  {
    name: "03-control-matrix",
    path: "/readiness",
  },
  { name: "04-evidence-passport", path: "/initiatives/AI-001" },
  {
    name: "05-score-explainer",
    path: "/initiatives/AI-001",
    prepare: async (page) => {
      await page.getByText("How this score was produced").scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
    },
  },
  { name: "06-bottlenecks", path: "/bottlenecks" },
  { name: "07-decisions", path: "/decisions" },
  {
    name: "08-simulator",
    path: "/simulator",
    prepare: async (page) => {
      await page.getByRole("button", { name: /Apply top 3 decisions/i }).click();
      await page.waitForTimeout(400);
    },
  },
  { name: "09-methodology", path: "/methodology" },
  {
    name: "10-command-palette",
    path: "/portfolio",
    themes: ["dark"],
    prepare: async (page) => {
      await page.keyboard.press("ControlOrMeta+k");
      await page.getByRole("dialog").waitFor();
      await page.keyboard.type("credit");
      await page.waitForTimeout(200);
    },
  },
];

const startPreview = () => {
  const child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "preview", "--", "--port", String(PORT), "--strictPort"],
    { stdio: "ignore", shell: process.platform === "win32" },
  );
  return child;
};

const waitForServer = async (url: string, timeoutMs = 60_000): Promise<void> => {
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

const setTheme = async (page: Page, theme: "light" | "dark"): Promise<void> => {
  await page.addInitScript((value) => {
    window.localStorage.setItem("signaltower.theme", value);
  }, theme);
};

const capture = async (browser: Browser, shot: Shot, theme: "light" | "dark"): Promise<void> => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: theme,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await setTheme(page, theme);

  await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: "networkidle" });
  // Let fonts settle so text does not shift between runs.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  if (shot.prepare) await shot.prepare(page);

  const file = path.join(OUT_DIR, `${shot.name}-${theme}.png`);
  await page.screenshot({ path: file, fullPage: shot.fullPage ?? false });
  console.log(`  ${path.relative(process.cwd(), file)}`);

  await context.close();
};

const captureMobile = async (browser: Browser): Promise<void> => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await setTheme(page, "dark");

  await page.goto(`${BASE_URL}/portfolio`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  const file = path.join(OUT_DIR, "11-mobile-dark.png");
  await page.screenshot({ path: file });
  console.log(`  ${path.relative(process.cwd(), file)}`);

  await context.close();
};

const main = async (): Promise<void> => {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  console.log("Starting preview server…");
  const server = startPreview();

  try {
    await waitForServer(BASE_URL);
    console.log("Capturing screenshots:");

    const browser = await chromium.launch();
    try {
      for (const shot of SHOTS) {
        for (const theme of shot.themes ?? ["light", "dark"]) {
          await capture(browser, shot, theme);
        }
      }
      await captureMobile(browser);
    } finally {
      await browser.close();
    }

    console.log("\nDone.");
  } finally {
    server.kill();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
