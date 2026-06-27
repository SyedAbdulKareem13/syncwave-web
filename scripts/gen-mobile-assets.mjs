// Generates the Capacitor source assets (committed to /assets) that
// @capacitor/assets expands into Android launcher icons + splash screens.
// Run: node scripts/gen-mobile-assets.mjs   (requires `sharp`)
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(OUT, { recursive: true });

const web = (stroke) => `
  <g stroke="#1FE0FF" stroke-width="${stroke}" fill="none" stroke-linecap="round">
    <line x1="50" y1="50" x2="50" y2="8"/><line x1="50" y1="50" x2="82" y2="22"/><line x1="50" y1="50" x2="92" y2="50"/><line x1="50" y1="50" x2="82" y2="78"/><line x1="50" y1="50" x2="50" y2="92"/><line x1="50" y1="50" x2="18" y2="78"/><line x1="50" y1="50" x2="8" y2="50"/><line x1="50" y1="50" x2="18" y2="22"/>
    <polygon points="68,50 63,63 50,68 37,63 32,50 37,37 50,32 63,37"/><polygon points="86,50 75,75 50,86 25,75 14,50 25,25 50,14 75,25"/>
  </g>
  <circle cx="50" cy="50" r="7" fill="#FF2A6D"/>`;

function composed(size, { bg, scale, stroke }) {
  const t = size / 2 - scale * 50;
  const rect = bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rect}<g transform="translate(${t},${t}) scale(${scale})">${web(stroke)}</g></svg>`;
}
const solid = (size, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${color}"/></svg>`;

const png = (svg, file, size) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(OUT, file));

await png(composed(1024, { bg: "#08070F", scale: 6.6, stroke: 3.4 }), "icon-only.png", 1024);
await png(composed(1024, { bg: null, scale: 5.0, stroke: 3.6 }), "icon-foreground.png", 1024);
await png(solid(1024, "#08070F"), "icon-background.png", 1024);
await png(composed(2732, { bg: "#08070F", scale: 9.2, stroke: 3.4 }), "splash.png", 2732);
await png(composed(2732, { bg: "#08070F", scale: 9.2, stroke: 3.4 }), "splash-dark.png", 2732);

console.log("Wrote mobile assets to", OUT);
