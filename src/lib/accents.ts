import type { AccentPair } from "./colors";

/** Push an accent pair into the CSS variables that theme the whole app. */
export function applyAccents(pair: AccentPair): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--accent", `${pair.accent[0]} ${pair.accent[1]} ${pair.accent[2]}`);
  root.style.setProperty("--accent-2", `${pair.accent2[0]} ${pair.accent2[1]} ${pair.accent2[2]}`);
}

export function rgb(c: [number, number, number], alpha = 1): string {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}
