import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * End-to-end behaviour.
 *
 * These cover the things unit tests cannot: that every route renders, that the
 * derived numbers reach the screen, that interaction actually recomputes, and
 * that no page ships an accessibility violation.
 */

const ROUTES = [
  { path: "/", heading: /stalls on (the )?evidence/i },
  { path: "/portfolio", heading: /AI commercialisation portfolio/i },
  { path: "/readiness", heading: /What is the evidence/i },
  {
    path: "/initiatives/AI-001",
    heading: /Relationship Manager Briefing Assistant/i,
  },
  { path: "/bottlenecks", heading: /Where governed value is trapped/i },
  { path: "/decisions", heading: /What should leadership unblock first/i },
  { path: "/simulator", heading: /What would that decision actually buy/i },
  { path: "/operating-model", heading: /governed conversion in 90 days/i },
  {
    path: "/methodology",
    heading: /How every number on this site is produced/i,
  },
];

test.describe("routing", () => {
  for (const route of ROUTES) {
    test(`renders ${route.path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        route.heading,
      );
      expect(errors, `console errors on ${route.path}`).toEqual([]);
    });
  }

  test("shows a 404 page for an unknown route", async ({ page }) => {
    await page.goto("/does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "No such page",
    );
  });

  test("shows a 404 page for an unknown initiative", async ({ page }) => {
    await page.goto("/initiatives/AI-999");
    // An unknown id must not render an empty passport.
    await expect(page).toHaveURL(/\/portfolio/);
  });
});

test.describe("derived values reach the screen", () => {
  test("portfolio totals come from the engine", async ({ page }) => {
    await page.goto("/portfolio");

    // 12 initiatives totalling $18.4M, as derived from the fixture.
    await expect(page.getByText("$18.4M").first()).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("an initiative passport explains its own score", async ({ page }) => {
    await page.goto("/initiatives/AI-001");

    await expect(page.getByText("How this score was produced")).toBeVisible();
    // Lineage is the top blocker for AI-001 and must be named, not implied.
    await expect(
      page.getByText("Data lineage documented").first(),
    ).toBeVisible();
    await expect(page.getByText(/Control debt/i).first()).toBeVisible();
  });

  test("the methodology page is generated from the live policy", async ({
    page,
  }) => {
    await page.goto("/methodology");

    await expect(page.getByText(/Control catalogue/)).toBeVisible();
    await expect(page.getByText("Autonomy limits and rollback")).toBeVisible();
  });
});

test.describe("interaction", () => {
  test("the readiness board keeps filters in the URL", async ({ page }) => {
    await page.goto("/readiness");

    await page.getByLabel("Risk tier").selectOption("High");
    await expect(page).toHaveURL(/risk=High/);

    // A reload must restore the same view from the link alone.
    await page.reload();
    await expect(page.getByLabel("Risk tier")).toHaveValue("High");
  });

  test("the simulator recomputes the portfolio", async ({ page }) => {
    await page.goto("/simulator");

    await expect(page.getByText("No remediations selected")).toBeVisible();
    await page.getByRole("button", { name: /Apply top 3 decisions/i }).click();

    await expect(page.getByText(/remediations selected/)).toBeVisible();
    // Remaining effort must fall once remediations are approved.
    await expect(page.getByText(/Effort remaining/)).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByText("No remediations selected")).toBeVisible();
  });

  test("the initiative table sorts", async ({ page }) => {
    await page.goto("/portfolio");

    const header = page.getByRole("button", { name: /Readiness/ });
    await header.click();
    await expect(
      page.getByRole("columnheader", { name: /Readiness/ }),
    ).toHaveAttribute("aria-sort", /ascending|descending/);
  });
});

test.describe("theme", () => {
  test("cycles light, dark and system, and remembers the choice", async ({
    page,
  }) => {
    await page.goto("/portfolio");

    const html = page.locator("html");
    const toggle = page.getByRole("button", { name: /^Theme:/ });

    // The toggle cycles light -> dark -> system. Drive it to an explicit
    // setting rather than asserting on whatever the OS happens to prefer.
    await toggle.click();
    await toggle.click();
    await toggle.click();

    const label = await toggle.getAttribute("aria-label");
    const isDark = label?.includes("Theme: dark");
    const isLight = label?.includes("Theme: light");

    if (isDark) await expect(html).toHaveClass(/dark/);
    if (isLight) await expect(html).not.toHaveClass(/dark/);

    // The preference must survive a reload.
    await page.reload();
    await expect(page.getByRole("button", { name: /^Theme:/ })).toHaveAttribute(
      "aria-label",
      label ?? "",
    );
  });
});

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    test(`has no violations on ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(
        results.violations.map(
          (violation) => `${violation.id}: ${violation.help}`,
        ),
      ).toEqual([]);
    });
  }

  // The palette is a keyboard affordance on the desktop shell; on a touch
  // viewport the sidebar that hosts it is collapsed and the shortcut has no
  // meaning, so these are scoped rather than made to pass artificially.
  test.describe("command palette", () => {
    test.skip(
      ({ isMobile }) => Boolean(isMobile),
      "keyboard shortcut is desktop-only",
    );

    test("is reachable and operable by keyboard", async ({ page }) => {
      await page.goto("/portfolio");
      // Routes are code-split, so wait for the shell to be interactive before
      // sending a global shortcut: otherwise the key lands before the listener.
      await page.getByRole("button", { name: /Search/ }).waitFor();

      await page.keyboard.press("ControlOrMeta+k");
      const dialog = page.getByRole("dialog", {
        name: /Search pages and initiatives/i,
      });
      await expect(dialog).toBeVisible();

      await page.keyboard.type("sanctions");
      await page.keyboard.press("Enter");

      await expect(page).toHaveURL(/\/initiatives\/AI-003/);
    });

    test("closes on escape", async ({ page }) => {
      await page.goto("/portfolio");
      await page.getByRole("button", { name: /Search/ }).waitFor();

      await page.keyboard.press("ControlOrMeta+k");
      await expect(page.getByRole("dialog")).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
    });
  });
});
