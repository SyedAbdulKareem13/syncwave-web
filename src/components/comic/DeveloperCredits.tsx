"use client";
import { useRef } from "react";

/**
 * 3D "CREATED BY" credits card — auto-orbits (card3d), tilts to the pointer, has
 * a spinning two-faced coin, a sheen sweep, and a chroma-pulsing name. Faithful
 * to the design handoff; links out to LinkedIn.
 */
export function DeveloperCredits({
  name = "Syed ⚡",
  role = "Designer & Developer",
  linkedIn,
}: {
  name?: string;
  role?: string;
  linkedIn: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const tilt = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform .08s linear";
    el.style.animation = "none";
    el.style.transform = `rotateY(${(px * 26).toFixed(1)}deg) rotateX(${(-py * 22).toFixed(1)}deg)`;
  };
  const reset = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
    el.style.animation = "";
    el.style.transform = "rotateY(-10deg) rotateX(6deg)";
  };

  return (
    <section id="credits" style={{ position: "relative", padding: "64px 30px 46px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(58% 75% at 50% 42%,rgba(255,42,109,.16),transparent 70%)" }} />
      <span style={{ position: "absolute", left: "12%", top: "30%", fontFamily: "var(--font-sticker)", fontSize: 26, color: "#FFE600", textShadow: "2px 2px 0 #000", animation: "floatBob 4s steps(8) infinite", pointerEvents: "none" }}>✦</span>
      <span style={{ position: "absolute", right: "14%", top: "22%", fontSize: 20, color: "#1FE0FF", animation: "floatBob 5.4s steps(10) .4s infinite", pointerEvents: "none" }}>✦</span>
      <span style={{ position: "absolute", right: "21%", bottom: "20%", fontSize: 22, color: "#FF2A6D", animation: "floatBob 4.6s steps(9) .8s infinite", pointerEvents: "none" }}>✦</span>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, position: "relative" }}>
        <div style={{ width: 46, height: 3, background: "repeating-linear-gradient(90deg,#1FE0FF 0 12px,transparent 12px 18px)" }} />
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,34px)", color: "#F4F1FF" }} className="chroma">CREATED BY</h2>
        <div style={{ width: 46, height: 3, background: "repeating-linear-gradient(90deg,#FF2A6D 0 12px,transparent 12px 18px)" }} />
      </div>
      <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".14em", color: "#9A93B5", marginTop: 8 }}>// EVERY GREAT ROOM NEEDS A SLINGER BEHIND IT</div>

      <div onMouseMove={tilt} onMouseLeave={reset} style={{ perspective: "1200px", display: "flex", justifyContent: "center", padding: "34px 0 6px" }}>
        <div ref={cardRef} data-testid="credits-card" style={{ position: "relative", width: "min(520px,92vw)", transformStyle: "preserve-3d", transform: "rotateY(-10deg) rotateX(6deg)", transition: "transform .6s cubic-bezier(.16,1,.3,1)", animation: "card3d 7s ease-in-out infinite", background: "linear-gradient(160deg,#1a1330,#0e0b18)", border: "3px solid #000", boxShadow: "14px 18px 0 rgba(255,42,109,.4),0 34px 60px -22px #000", padding: "30px 28px 28px" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none", backgroundImage: "radial-gradient(#1FE0FF 1px,transparent 1.4px)", backgroundSize: "9px 9px" }} />

          {/* spinning coin */}
          <div style={{ display: "flex", justifyContent: "center", transform: "translateZ(74px)" }}>
            <div style={{ position: "relative", width: 94, height: 94, transformStyle: "preserve-3d", animation: "coinSpin 6.5s linear infinite" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: "radial-gradient(circle at 34% 28%,#FF4D8D,#FF2A6D 58%,#7B2FF7)", border: "3px solid #000", boxShadow: "inset 0 0 0 3px rgba(255,255,255,.18),0 10px 22px -6px rgba(255,42,109,.6)", display: "grid", placeItems: "center" }}>
                <svg viewBox="0 0 100 100" style={{ width: 58, height: 58 }}>
                  <g stroke="#fff" strokeWidth="3" fill="none">
                    <line x1="50" y1="50" x2="50" y2="6" /><line x1="50" y1="50" x2="88" y2="26" /><line x1="50" y1="50" x2="94" y2="50" /><line x1="50" y1="50" x2="88" y2="74" /><line x1="50" y1="50" x2="50" y2="94" /><line x1="50" y1="50" x2="12" y2="74" /><line x1="50" y1="50" x2="6" y2="50" /><line x1="50" y1="50" x2="12" y2="26" />
                    <polygon points="70,50 64,64 50,70 36,64 30,50 36,36 50,30 64,36" /><polygon points="86,50 75,75 50,86 25,75 14,50 25,25 50,14 75,25" />
                  </g>
                  <circle cx="50" cy="50" r="6" fill="#fff" />
                </svg>
              </div>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "radial-gradient(circle at 34% 28%,#5cf0ff,#1FE0FF 58%,#0a66ff)", border: "3px solid #000", boxShadow: "inset 0 0 0 3px rgba(8,7,15,.2),0 10px 22px -6px rgba(31,224,255,.55)", display: "grid", placeItems: "center" }}>
                <svg viewBox="0 0 100 100" width="52" height="52"><g fill="#08070F"><rect x="24" y="40" width="11" height="20" rx="3" /><rect x="44" y="26" width="11" height="48" rx="3" /><rect x="64" y="46" width="11" height="8" rx="3" /></g></svg>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", transform: "translateZ(30px)", marginTop: 16 }}>
            <span style={{ display: "inline-block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".18em", color: "#08070F", background: "#FFE600", border: "2px solid #000", padding: "3px 10px", transform: "rotate(-2deg)" }}>DEVELOPED BY</span>
          </div>
          <h3 style={{ margin: "14px 0 0", textAlign: "center", fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,46px)", lineHeight: 1, color: "#fff", textShadow: "3px 0 #FF2A6D,-3px 0 #1FE0FF", transform: "translateZ(48px)", animation: "chromaPulse 4s steps(2) infinite" }}>{name}</h3>
          <div style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, letterSpacing: ".08em", color: "#1FE0FF", transform: "translateZ(30px)" }}>{role}</div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 22, transform: "translateZ(60px)" }}>
            <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="cbtn" style={{ "--cs": "5px", "--csh": "8px", display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display)", fontSize: 15, color: "#fff", background: "linear-gradient(180deg,#3aa0ff,#0a66c2)", padding: "13px 20px", border: "3px solid #000", textDecoration: "none", letterSpacing: ".3px" } as React.CSSProperties}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4z" /></svg>
              CONNECT ON LINKEDIN
            </a>
          </div>

          {/* sheen sweep */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", transform: "translateZ(62px)" }}>
            <div style={{ position: "absolute", top: "-30%", left: 0, width: "26%", height: "160%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)", animation: "sheen 5s ease-in-out 1s infinite" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
