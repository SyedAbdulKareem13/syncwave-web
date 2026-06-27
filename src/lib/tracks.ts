import type { Track } from "./types";

// Built-in, royalty-free demo catalog. These are SoundHelix's algorithmically
// generated tracks — free to use for testing — served directly to each client
// (never proxied through SyncWave servers). Because every client loads the
// *identical* URL, they make a flawless cross-device sync demo, and because
// they play through an <audio> element we get fine-grained playbackRate, which
// showcases the inaudible rate-nudge drift correction (Section 4.3).

export const DEMO_TRACKS: Track[] = [
  {
    uri: "demo:1",
    source: "demo",
    title: "Resonance",
    artist: "SoundHelix · Demo",
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    durationMs: 372000,
    accent: [124, 92, 255],
    accent2: [40, 200, 220],
  },
  {
    uri: "demo:2",
    source: "demo",
    title: "Afterglow",
    artist: "SoundHelix · Demo",
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    durationMs: 426000,
    accent: [255, 110, 160],
    accent2: [255, 196, 92],
  },
  {
    uri: "demo:3",
    source: "demo",
    title: "Undertow",
    artist: "SoundHelix · Demo",
    streamUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    durationMs: 348000,
    accent: [88, 220, 160],
    accent2: [80, 140, 255],
  },
];

export function trackByUri(uri: string): Track | undefined {
  return DEMO_TRACKS.find((t) => t.uri === uri);
}
