// Small dependency-free helpers shared across the app.

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.abs(hashString(String(performance.now()) + Math.floor(Math.random() * 1e9))).toString(36);
}

/** Human-friendly 6-char join code (no ambiguous chars). */
export function joinCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  const buf = new Uint32Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
    for (let i = 0; i < 6; i++) out += alphabet[buf[i] % alphabet.length];
  } else {
    for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** mm:ss from milliseconds. */
export function formatMs(ms: number): string {
  if (!isFinite(ms) || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** clsx-lite */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

const AVATARS = ["🦊", "🐙", "🦉", "🐳", "🦜", "🐝", "🦋", "🐬", "🦚", "🐲", "🦩", "🐸", "🦁", "🐼", "🦄", "🐧"];
export function pickAvatar(seed: string): string {
  return AVATARS[Math.abs(hashString(seed)) % AVATARS.length];
}

const NAME_ADJ = ["Mellow", "Lunar", "Velvet", "Neon", "Amber", "Cosmic", "Drift", "Echo", "Hazy", "Solar"];
const NAME_NOUN = ["Wave", "Pulse", "Tide", "Beat", "Bloom", "Comet", "Loop", "Spark", "Verse", "Glow"];
export function randomName(seed: string): string {
  const h = Math.abs(hashString(seed));
  return `${NAME_ADJ[h % NAME_ADJ.length]} ${NAME_NOUN[(h >> 4) % NAME_NOUN.length]}`;
}

/** Deterministic accent from a uri, for fallback theming. */
export function accentFromUri(uri: string): [number, number, number] {
  const h = Math.abs(hashString(uri)) % 360;
  return hslToRgb(h, 70, 62);
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

/**
 * Guarantee an accent is bright/saturated enough that dark ink text (#0B0B12)
 * on top of it clears WCAG AA — important because accents are sampled from
 * arbitrary (sometimes very dark) album art. Floors lightness and saturation.
 */
export function ensureReadableAccent(rgb: [number, number, number]): [number, number, number] {
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  return hslToRgb(h, Math.max(s, 55), Math.max(l, 62));
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

export const isBrowser = typeof window !== "undefined";
