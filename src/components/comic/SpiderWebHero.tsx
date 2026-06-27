/**
 * Hero "synced-beat web": a spider-web with a central BPM beat-core and avatar
 * nodes that beat-thump in UNISON — the visual proof of sync. Pure SVG/CSS.
 */
const NODES = [
  { left: 192, top: 55, bg: "#FF2A6D", color: "#fff", label: "M" },
  { left: 307, top: 123, bg: "#1FE0FF", color: "#08070F", label: "G" },
  { left: 307, top: 261, bg: "#FFE600", color: "#08070F", label: "P" },
  { left: 192, top: 329, bg: "#FF3B3B", color: "#fff", label: "H" },
  { left: 77, top: 261, bg: "#C6FF00", color: "#08070F", label: "P" },
  { left: 77, top: 123, bg: "#7B2FF7", color: "#fff", label: "M" },
];

export function SpiderWebHero({ bpm = 124 }: { bpm?: number }) {
  return (
    <div style={{ position: "relative", width: 440, height: 440 }}>
      {/* spider on a thread */}
      <div style={{ position: "absolute", left: "50%", top: -6, width: 2, height: 64, background: "linear-gradient(#1FE0FF,transparent)", transformOrigin: "top" }}>
        <svg viewBox="0 0 40 40" width="34" height="34" style={{ position: "absolute", left: -16, top: 56, animation: "threadHang 4s steps(8) infinite", transformOrigin: "top center", filter: "drop-shadow(0 4px 4px rgba(0,0,0,.6))" }}>
          <g stroke="#F4F1FF" strokeWidth="2" strokeLinecap="round">
            <path d="M20 18C9 9 6 12 4 8M20 18C9 14 5 17 3 15M20 22C9 26 5 25 3 28M20 22C10 30 7 30 5 34" />
            <path d="M20 18C31 9 34 12 36 8M20 18C31 14 35 17 37 15M20 22C31 26 35 25 37 28M20 22C30 30 33 30 35 34" />
          </g>
          <ellipse cx="20" cy="20" rx="6.5" ry="8" fill="#08070F" stroke="#FF2A6D" strokeWidth="2" />
          <circle cx="17.5" cy="17" r="1.6" fill="#1FE0FF" />
          <circle cx="22.5" cy="17" r="1.6" fill="#1FE0FF" />
        </svg>
      </div>

      <svg viewBox="0 0 440 440" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <g stroke="#1FE0FF" strokeWidth="1.4" fill="none" opacity="0.22">
          <line x1="220" y1="220" x2="420" y2="220" /><line x1="220" y1="220" x2="361" y2="361" /><line x1="220" y1="220" x2="220" y2="420" /><line x1="220" y1="220" x2="79" y2="361" /><line x1="220" y1="220" x2="20" y2="220" /><line x1="220" y1="220" x2="79" y2="79" /><line x1="220" y1="220" x2="220" y2="20" /><line x1="220" y1="220" x2="361" y2="79" />
          <polygon points="290,220 269,269 220,290 171,269 150,220 171,171 220,150 269,171" />
          <polygon points="350,220 312,312 220,350 128,312 90,220 128,128 220,90 312,128" />
          <polygon points="410,220 354,354 220,410 86,354 30,220 86,86 220,30 354,86" />
        </g>
        <g stroke="#FF2A6D" strokeWidth="2.4" opacity="0.9" strokeLinecap="round">
          <line x1="220" y1="220" x2="220" y2="83" /><line x1="220" y1="220" x2="335" y2="151" /><line x1="220" y1="220" x2="335" y2="289" /><line x1="220" y1="220" x2="220" y2="357" /><line x1="220" y1="220" x2="105" y2="289" /><line x1="220" y1="220" x2="105" y2="151" />
        </g>
      </svg>

      {/* center beat core */}
      <div style={{ position: "absolute", left: 160, top: 160, width: 120, height: 120 }}>
        <div style={{ position: "absolute", inset: 0, border: "2px solid #FF2A6D", borderRadius: "50%", animation: "pulseRing 1.4s steps(8) infinite" }} />
        <div style={{ position: "absolute", inset: 0, border: "2px solid #1FE0FF", borderRadius: "50%", animation: "pulseRing 1.4s steps(8) .7s infinite" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#FF4D8D,#FF2A6D 55%,#7B2FF7)", border: "3px solid #000", boxShadow: "0 0 26px rgba(255,42,109,.6),inset 0 0 0 2px rgba(255,255,255,.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "beatThump .92s steps(6) infinite" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "#fff", lineHeight: 1 }}>{bpm}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".18em", color: "#08070F", background: "#FFE600", padding: "1px 5px", marginTop: 3 }}>BPM</div>
        </div>
      </div>

      {/* avatar nodes pulse in unison */}
      {NODES.map((n, i) => (
        <div
          key={i}
          style={{ position: "absolute", left: n.left, top: n.top, width: 56, height: 56, borderRadius: "50%", background: n.bg, border: "3px solid #000", boxShadow: "3px 3px 0 #000", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 20, color: n.color, animation: "beatThump .92s steps(6) infinite" }}
        >
          {n.label}
        </div>
      ))}

      {/* ms latency tags */}
      <span style={{ position: "absolute", left: 255, top: 64, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#08070F", background: "#1FE0FF", padding: "1px 5px", border: "1.5px solid #000" }}>8ms</span>
      <span style={{ position: "absolute", left: 35, top: 200, fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "#08070F", background: "#1FE0FF", padding: "1px 5px", border: "1.5px solid #000" }}>11ms</span>

      {/* THWIP sticker */}
      <div style={{ position: "absolute", right: -10, bottom: 18, fontFamily: "var(--font-sticker)", fontSize: 30, color: "#FFE600", background: "#FF2A6D", border: "3px solid #000", boxShadow: "4px 4px 0 #000", padding: "4px 14px", transform: "rotate(8deg)", letterSpacing: ".04em", animation: "stickerWob 2.4s steps(2) infinite" }}>
        THWIP!
      </div>
    </div>
  );
}
