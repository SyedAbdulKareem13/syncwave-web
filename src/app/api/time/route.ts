// Shared clock authority for NTP-style sync (Section 4.1). Returns server
// receive (t1) and send (t2) timestamps; the client already knows t0/t3. Edge
// runtime keeps this tiny and geographically close, minimizing jitter. Vercel's
// hosts are NTP-disciplined, so this is a stable shared reference frame.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export function GET(): Response {
  const t1 = Date.now();
  return new Response(JSON.stringify({ t1, t2: Date.now() }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store, no-cache, must-revalidate",
    },
  });
}
