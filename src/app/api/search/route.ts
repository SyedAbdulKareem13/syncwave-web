// Music search proxy — METADATA ONLY (Section 7/8). Never returns or relays
// audio. Requires YOUTUBE_API_KEY; without it the client falls back to pasting
// a YouTube URL/ID directly.
export const runtime = "edge";

interface YtItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails?: Record<string, { url: string } | undefined>;
  };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return json({ results: [] });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return json({ results: [], disabled: true });

  const api =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
    `&videoCategoryId=10&maxResults=12&q=${encodeURIComponent(q)}&key=${key}`;

  try {
    const res = await fetch(api);
    if (!res.ok) return json({ results: [], error: `search failed (${res.status})` });
    const data = (await res.json()) as { items?: YtItem[] };
    const results = (data.items ?? [])
      .filter((it) => it.id?.videoId)
      .map((it) => ({
        youtubeId: it.id.videoId,
        title: decodeEntities(it.snippet.title),
        artist: it.snippet.channelTitle,
        artworkUrl:
          it.snippet.thumbnails?.medium?.url ?? it.snippet.thumbnails?.default?.url ?? null,
      }));
    return json({ results });
  } catch {
    return json({ results: [], error: "search unavailable" });
  }
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
