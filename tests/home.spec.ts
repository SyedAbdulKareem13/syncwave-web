import { test, expect } from "@playwright/test";

test.describe("SyncWave home page", () => {
  test("home renders the hero and primary actions", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("PRESS PLAY ONCE.")).toBeVisible();
    await expect(page.getByTestId("start-room")).toBeVisible();
    await expect(page.getByTestId("join-by-code")).toBeVisible();
    await expect(page.getByRole("heading", { name: "LIVE ROOMS" })).toBeVisible();
  });

  test("starting a room navigates into a room and shows the unlock overlay", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("room-name-input").fill("Test Room");
    await page.getByTestId("start-room").click();

    await expect
      .poll(() => page.url())
      .toMatch(/\/room\/[A-Z0-9]{6}$/);

    const joinOverlay = page.getByTestId("join-listen");
    const roomCode = page.getByTestId("room-code");

    await expect(joinOverlay.or(roomCode)).toBeVisible();
  });

  test("join by code navigates to that room", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("join-code-input").fill("ABCDEF");
    await page.getByTestId("join-by-code").click();

    await expect.poll(() => page.url()).toContain("/room/ABCDEF");
  });
});
