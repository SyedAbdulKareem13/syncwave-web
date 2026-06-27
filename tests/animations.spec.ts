import { test, expect, type Page } from "@playwright/test";

const LINKEDIN = "https://www.linkedin.com/in/syed-abdul-kareem-b33519200/";

function toMs(d: string): number {
  d = d.trim();
  if (d.endsWith("ms")) return parseFloat(d);
  if (d.endsWith("s")) return parseFloat(d) * 1000;
  return parseFloat(d) * 1000;
}

async function durationByTestId(page: Page, id: string): Promise<number> {
  const d = await page.getByTestId(id).evaluate((el) => getComputedStyle(el).animationDuration);
  return toMs(d);
}
async function durationBySelector(page: Page, sel: string): Promise<number> {
  const d = await page.locator(sel).first().evaluate((el) => getComputedStyle(el).animationDuration);
  return toMs(d);
}

// A frozen animation (the old reduced-motion nuke) has duration ~0.001ms; a real
// one is >= ~1s. We assert the ambient comic animations actually run.
async function assertAnimated(page: Page) {
  expect(await durationBySelector(page, ".fx-halftone")).toBeGreaterThan(500); // dynamic halftone background
  expect(await durationByTestId(page, "web-logo")).toBeGreaterThan(500); // web sway
  expect(await durationByTestId(page, "glitch-beat")).toBeGreaterThan(500); // glitch text
  expect(await durationByTestId(page, "credits-card")).toBeGreaterThan(500); // 3D credits orbit
}

test.describe("Spider-Verse animations", () => {
  test("ambient comic animations run on the landing page", async ({ page }) => {
    await page.goto("/");
    await assertAnimated(page);
  });

  test("animations still run under prefers-reduced-motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    try {
      await page.goto("/");
      await assertAnimated(page);
    } finally {
      await ctx.close();
    }
  });

  test("the 3D developer credits link out to LinkedIn", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /CONNECT ON LINKEDIN/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", LINKEDIN);
    await expect(link).toHaveAttribute("target", "_blank");
  });
});
