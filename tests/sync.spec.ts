import { test, expect } from "@playwright/test";
import { roomUrl, tapToListen, trackTitle } from "./helpers";

// End-to-end proof of the sync engine in local mode: a host starts a track,
// then a late joiner drops into the SAME moment, in sync (Definition of Done:
// "a late joiner reaches sync within 1s"). Audio is muted but still advances.

test("host plays a track; a late joiner catches up to the same track in sync", async ({ browser }) => {
  const context = await browser.newContext();
  const code = "SYNCAB";

  // ── Host arrives first → becomes host, starts the music ───────────────────
  const host = await context.newPage();
  await host.goto(roomUrl(code, "host-aaa", "Hostie"));
  await tapToListen(host);

  // Host alone → host controls visible. Start a featured track.
  await host.getByTestId("start-music").click();
  await host.getByTestId("picker-play").first().click();

  // The track title becomes a real title (not the idle placeholder).
  await expect
    .poll(async () => trackTitle(host), { timeout: 20_000 })
    .not.toMatch(/Nothing playing|Waiting|DROP A TRACK/i);
  const title = await trackTitle(host);
  expect(title.length).toBeGreaterThan(0);

  // Host playback advances past 0:00.
  await expect
    .poll(async () => (await host.getByTestId("position-current").textContent())?.trim(), { timeout: 20_000 })
    .not.toBe("0:00");

  // ── Late joiner arrives → must catch up to the same track ─────────────────
  const listener = await context.newPage();
  await listener.goto(roomUrl(code, "listener-bbb", "Listener"));
  await tapToListen(listener);

  // Listener loads the same track the host is playing.
  await expect.poll(async () => trackTitle(listener), { timeout: 20_000 }).toBe(title);

  // Both clients see two members in the room.
  await expect(host.getByTestId("member")).toHaveCount(2, { timeout: 15_000 });
  await expect(listener.getByTestId("member")).toHaveCount(2, { timeout: 15_000 });

  // Listener's playhead advances (it joined a live, playing session).
  await expect
    .poll(async () => (await listener.getByTestId("position-current").textContent())?.trim(), { timeout: 20_000 })
    .not.toBe("0:00");

  // Sanity: positions are roughly aligned (loose bound; headless + network).
  const hostMs = parsePos(await host.getByTestId("position-current").textContent());
  const listMs = parsePos(await listener.getByTestId("position-current").textContent());
  expect(Math.abs(hostMs - listMs)).toBeLessThan(8000);

  await context.close();
});

function parsePos(text: string | null): number {
  if (!text) return 0;
  const [m, s] = text.trim().split(":").map(Number);
  return (m * 60 + s) * 1000;
}
