import type { Track } from "../types";

// Local files live only on the device that picked them. We keep a per-device
// registry of fileName → object URL. A listener who hasn't picked the matching
// file simply can't resolve the track (Section 8: "Can't play this track on
// your account"), but stays in the room with full presence + chat.
const registry = new Map<string, string>();

export function registerLocalFile(file: File): Track {
  const url = URL.createObjectURL(file);
  registry.set(file.name, url);
  return {
    uri: `local:${file.name}`,
    source: "local",
    title: file.name.replace(/\.[^.]+$/, ""),
    artist: "Local file",
    fileName: file.name,
  };
}

/**
 * Map a picked file to a SPECIFIC expected fileName (the host's track name), so
 * a listener can resolve the current local track by selecting their own copy —
 * even if their filename differs.
 */
export function registerLocalFileAs(fileName: string, file: File): void {
  registry.set(fileName, URL.createObjectURL(file));
}

export function getLocalUrl(fileName: string): string | undefined {
  return registry.get(fileName);
}

export function hasLocalFile(fileName: string): boolean {
  return registry.has(fileName);
}
