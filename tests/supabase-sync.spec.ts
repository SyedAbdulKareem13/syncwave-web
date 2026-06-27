import { test, expect } from "@playwright/test";
import { roomUrl, tapToListen, trackTitle } from "./helpers";

// CROSS-DEVICE sync over real Supabase Realtime. Two SEPARATE browser contexts
// share no BroadcastChannel, so they can only sync through Supabase — proving
// the production cross-device path. Guarded: runs only when SUPABASE_E2E=1 and
// the app was built with NEXT_PUBLIC_SUPABASE_* configured (so CI stays offline
// in local mode by default).
test.skip(!process.env.SUPABASE_E2E, "set SUPABASE_E2E=1 with Supabase env to run");

test("two separate browser contexts sync via Supabase Realtime", async ({ browser }) => {
  const code = "SBSYNC";
  const ctxHost = await browser.newContext();
  const ctxListener = await browser.newContext();

  const host = await ctxHost.newPage();
  await host.goto(roomUrl(code, "sb-host", "Host"));
  await tapToListen(host);

  // Confirm we're genuinely in cross-device (Supabase) mode, not local mode.
  await expect(host.getByTestId("sync-chip")).toContainText("live", { timeout: 20_000 });

  await host.getByTestId("start-music").click();
  await host.getByTestId("picker-play").first().click();
  await expect.poll(() => trackTitle(host), { timeout: 25_000 }).not.toMatch(/Nothing playing|Waiting/i);
  const title = await trackTitle(host);

  // Listener in a SEPARATE context joins — must catch up purely via Supabase.
  const listener = await ctxListener.newPage();
  await listener.goto(roomUrl(code, "sb-list", "Listener"));
  await tapToListen(listener);

  await expect.poll(() => trackTitle(listener), { timeout: 25_000 }).toBe(title);
  await expect
    .poll(async () => (await listener.getByTestId("position-current").textContent())?.trim(), { timeout: 25_000 })
    .not.toBe("0:00");
  await expect(host.getByTestId("member")).toHaveCount(2, { timeout: 20_000 });

  await ctxHost.close();
  await ctxListener.close();
});
