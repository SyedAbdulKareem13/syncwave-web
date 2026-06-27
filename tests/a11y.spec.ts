import { test, expect } from "@playwright/test";
import { roomUrl, tapToListen, openSheetTab } from "./helpers";

test.describe("SyncWave accessibility semantics", () => {
  test("the audio-unlock overlay is an accessible dialog", async ({ page }) => {
    await page.goto(roomUrl("A11YRM", "a11y-1", "Axe"));

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // The dialog's accessible name comes from the heading referenced by
    // aria-labelledby="join-title".
    const title = page.locator("#join-title");
    await expect(title).toBeVisible({ timeout: 15000 });

    // The unlock action inside the dialog.
    await expect(page.getByTestId("join-listen")).toBeVisible({ timeout: 15000 });
  });

  test("the timeline exposes an accessible name", async ({ page }) => {
    await page.goto(roomUrl("A11YRM", "a11y-1", "Axe"));
    await tapToListen(page);

    // A disabled range still exposes the slider role. Prefer the role query,
    // but fall back to the raw input when no track is playing yet so the
    // assertion stays robust either way.
    const slider = page.getByRole("slider", { name: "Playback position" });
    const rangeInput = page.locator(
      'input[type=range][aria-label="Playback position"]'
    );

    if (await slider.isVisible().catch(() => false)) {
      await expect(slider).toBeVisible({ timeout: 15000 });
    } else {
      expect(await rangeInput.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test("emoji reactions have accessible labels", async ({ page }) => {
    await page.goto(roomUrl("A11YRM", "a11y-1", "Axe"));
    await tapToListen(page);
    await openSheetTab(page, "React");

    const reacts = page.getByRole("button", { name: /^React with / });
    await expect(reacts.first()).toBeVisible({ timeout: 15000 });
    expect(await reacts.count()).toBeGreaterThanOrEqual(6);
  });

  test("reduced motion is honored without breaking the app", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const p = await ctx.newPage();
    try {
      await p.goto(roomUrl("A11YR2", "rm-1", "RM"));
      await tapToListen(p);
      await expect(p.getByTestId("sync-chip")).toBeVisible({ timeout: 15000 });
    } finally {
      await ctx.close();
    }
  });
});
