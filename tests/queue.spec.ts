import { test, expect } from "@playwright/test";
import { roomUrl, tapToListen, openSheetTab } from "./helpers";

test("adding a track to the queue syncs to the other listener", async ({ browser }) => {
  const context = await browser.newContext();

  // Host joins first and becomes the host.
  const host = await context.newPage();
  await host.goto(roomUrl("QUEUE1", "host-q", "Hostie"));
  await tapToListen(host);

  // Listener joins the same room (same browser context -> BroadcastChannel realtime).
  const listener = await context.newPage();
  await listener.goto(roomUrl("QUEUE1", "list-q", "Listy"));
  await tapToListen(listener);

  // Both pages should see two members.
  await expect(host.getByTestId("member")).toHaveCount(2, { timeout: 15000 });
  await expect(listener.getByTestId("member")).toHaveCount(2, { timeout: 15000 });

  // Host opens the Queue tab and adds the first featured demo track.
  await openSheetTab(host, "Queue");
  await host.getByRole("button", { name: "+ Add music" }).click();
  await host.getByTestId("picker-queue").first().click();

  // The picker modal should close and the host's queue should show one item.
  await expect(host.getByTestId("picker-queue")).toHaveCount(0, { timeout: 15000 });
  await expect(host.getByText("1 up next")).toBeVisible({ timeout: 15000 });

  // The listener should receive the queued item via realtime sync.
  await openSheetTab(listener, "Queue");
  await expect(listener.getByText("1 up next")).toBeVisible({ timeout: 15000 });

  await context.close();
});
