import { type Page, expect } from "@playwright/test";

/**
 * Two pages in the SAME browser context act like two tabs: they share a
 * BroadcastChannel, so SyncWave's LOCAL MODE transport connects them — letting
 * us drive real two-listener sync end-to-end with no Supabase. The `?uid=&name=`
 * seam gives each tab a distinct ephemeral identity.
 */
export function roomUrl(code: string, uid: string, name: string): string {
  return `/room/${code}?uid=${uid}&name=${encodeURIComponent(name)}`;
}

/** Dismiss the audio-unlock overlay (the "Tap to listen in sync" gate). */
export async function tapToListen(page: Page): Promise<void> {
  const join = page.getByTestId("join-listen");
  try {
    await join.waitFor({ state: "visible", timeout: 8000 });
    await join.click();
  } catch {
    // overlay may not be shown yet (e.g. already unlocked)
  }
}

/** Open a tab of the bottom sheet by its label. */
export async function openSheetTab(page: Page, label: "Queue" | "Chat" | "React"): Promise<void> {
  // Anchored regex: matches the tab ("Queue" or, with a badge, "Queue 1") but
  // NOT a substring collision like the room-code button "CODE QUEUE1 · share".
  await page.getByRole("button", { name: new RegExp(`^${label}( \\d+)?$`) }).first().click();
}

export async function trackTitle(page: Page): Promise<string> {
  return (await page.getByTestId("track-title").textContent())?.trim() ?? "";
}

export { expect };
