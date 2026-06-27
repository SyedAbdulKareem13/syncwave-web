import { test, expect } from "@playwright/test";
import { roomUrl, tapToListen } from "./helpers";

test("adding a track to the queue syncs to the other listener", async ({ browser }) => {
  const context = await browser.newContext();

  const host = await context.newPage();
  await host.goto(roomUrl("QUEUE1", "host-q", "Hostie"));
  await tapToListen(host);

  const listener = await context.newPage();
  await listener.goto(roomUrl("QUEUE1", "list-q", "Listy"));
  await tapToListen(listener);

  await expect(host.getByTestId("member")).toHaveCount(2, { timeout: 15000 });
  await expect(listener.getByTestId("member")).toHaveCount(2, { timeout: 15000 });

  // Host opens the picker and queues the first featured track ("Resonance").
  await host.getByRole("button", { name: "ADD MUSIC" }).first().click();
  await host.getByTestId("picker-queue").first().click();

  // Picker closes after selecting.
  await expect(host.getByTestId("picker-queue")).toHaveCount(0, { timeout: 15000 });

  // The queued track appears in BOTH clients' queue panels (realtime sync).
  await expect(host.getByText("Resonance")).toBeVisible({ timeout: 15000 });
  await expect(listener.getByText("Resonance")).toBeVisible({ timeout: 15000 });

  await context.close();
});
