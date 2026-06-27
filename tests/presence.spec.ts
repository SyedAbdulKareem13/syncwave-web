import { test, expect } from "@playwright/test";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { roomUrl, tapToListen } from "./helpers";

const ROOM = "PRESNC";
const PRESENCE_TIMEOUT = 15000;

let context: BrowserContext;
let pageA: Page;
let pageB: Page;

test.beforeEach(async ({ browser }: { browser: Browser }) => {
  // BroadcastChannel only bridges pages within the SAME browser context.
  context = await browser.newContext();

  // Ava joins first -> becomes host.
  pageA = await context.newPage();
  await pageA.goto(roomUrl(ROOM, "user-a", "Ava"));
  await tapToListen(pageA);

  // Bo joins second.
  pageB = await context.newPage();
  await pageB.goto(roomUrl(ROOM, "user-b", "Bo"));
  await tapToListen(pageB);
});

test.afterEach(async () => {
  await context.close();
});

test("two listeners in the same room see each other", async () => {
  // Members may appear gradually; web-first assertions retry until both are present.
  await expect(pageA.getByTestId("member")).toHaveCount(2, {
    timeout: PRESENCE_TIMEOUT,
  });
  await expect(pageB.getByTestId("member")).toHaveCount(2, {
    timeout: PRESENCE_TIMEOUT,
  });
});

test("the first to join is shown as host on both clients", async () => {
  await expect(
    pageA.getByTestId("member").filter({ hasText: "HOST" })
  ).toHaveCount(1, { timeout: PRESENCE_TIMEOUT });
  await expect(
    pageB.getByTestId("member").filter({ hasText: "HOST" })
  ).toHaveCount(1, { timeout: PRESENCE_TIMEOUT });
});

test("the sync-health chip is present for everyone", async () => {
  await expect(pageA.getByTestId("sync-chip")).toBeVisible({
    timeout: PRESENCE_TIMEOUT,
  });
  await expect(pageB.getByTestId("sync-chip")).toBeVisible({
    timeout: PRESENCE_TIMEOUT,
  });
});
