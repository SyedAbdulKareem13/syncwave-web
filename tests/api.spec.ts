import { test, expect } from "@playwright/test";

test.describe("SyncWave API", () => {
  test("/api/time returns server clock fields", async ({ request }) => {
    const res = await request.get("/api/time");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(typeof body.t1).toBe("number");
    expect(typeof body.t2).toBe("number");
    expect(body.t1).toBeGreaterThan(1600000000000);
    expect(body.t2).toBeGreaterThanOrEqual(body.t1);
  });

  test("/api/time advances between calls", async ({ request }) => {
    const first = await (await request.get("/api/time")).json();
    await new Promise((r) => setTimeout(r, 50));
    const second = await (await request.get("/api/time")).json();
    expect(second.t1).toBeGreaterThanOrEqual(first.t1);
  });

  test("/api/search returns a results array and is disabled without an API key", async ({
    request,
  }) => {
    const res = await request.get("/api/search?q=test");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.results)).toBeTruthy();
    expect(body.disabled).toBe(true);
  });

  test("/api/search with empty query returns empty results", async ({
    request,
  }) => {
    const res = await request.get("/api/search");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.results)).toBeTruthy();
    expect(body.results.length).toBe(0);
  });
});
