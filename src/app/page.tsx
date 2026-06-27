"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ComicOverlays } from "@/components/comic/Overlays";
import { WebLogo } from "@/components/comic/WebLogo";
import { Marquee } from "@/components/comic/Marquee";
import { SpiderWebHero } from "@/components/comic/SpiderWebHero";
import { DeveloperCredits } from "@/components/comic/DeveloperCredits";
import { RoomCard } from "@/components/RoomCard";

const LINKEDIN = "https://www.linkedin.com/feed/update/urn:li:activity:7466712261319954432/";
import { useIdentity } from "@/lib/useIdentity";
import { useLobby } from "@/lib/useLobby";
import { saveRoomMeta } from "@/lib/roomMeta";
import { joinCode } from "@/lib/util";

const sv = (cs: number, csh: number, csc = "#000") =>
  ({ "--cs": `${cs}px`, "--csh": `${csh}px`, "--csc": csc }) as React.CSSProperties;

const Arrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export default function HomePage() {
  const router = useRouter();
  const { identity, rename } = useIdentity();
  const { rooms, mode } = useLobby();

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [code, setCode] = useState("");
  const [editingName, setEditingName] = useState(false);
  const joinRef = useRef<HTMLInputElement>(null);

  const startRoom = () => {
    const id = joinCode();
    saveRoomMeta(id, { name: name.trim() || "Your Room", isPublic, createdByMe: true });
    router.push(`/room/${id}`);
  };
  const joinByCode = () => {
    const c = code.trim().toUpperCase();
    if (c) router.push(`/room/${c}`);
  };
  const focusJoin = () => {
    document.getElementById("start")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => joinRef.current?.focus(), 350);
  };

  const live = mode === "supabase";

  return (
    <div style={{ position: "relative", minHeight: "100vh", color: "#F4F1FF", fontFamily: "var(--font-sans)", overflowX: "hidden" }}>
      <ComicOverlays />

      <div style={{ position: "relative", zIndex: 5 }}>
        {/* NAV */}
        <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 30px", background: "linear-gradient(180deg,rgba(8,7,15,.92),rgba(8,7,15,.55))", backdropFilter: "blur(10px)", borderBottom: "2px solid #221836", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <WebLogo />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: ".5px", color: "#F4F1FF" }} className="chroma">SYNCWAVE</div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "#08070F", background: "#1FE0FF", padding: "3px 7px", border: "2px solid #000", transform: "rotate(-3deg)" }}>EARTH-1610</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <a href="#how" className="navlink">HOW IT WORKS</a>
            <a href="#live" className="navlink">LIVE ROOMS</a>
            <a href="#credits" className="navlink">CREDITS</a>
            {identity && (
              <button onClick={() => setEditingName(true)} className="cbtn-sm" style={{ ...sv(3, 5), display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#08070F", background: "#FFE600", border: "2.5px solid #000", padding: "7px 10px" }} title="Set your name">
                <span style={{ fontSize: 13 }}>🕷️</span>{identity.name}
              </button>
            )}
            <a href="#start" className="cbtn-sm" style={{ ...sv(4, 6), fontFamily: "var(--font-display)", fontSize: 13, color: "#fff", background: "#FF2A6D", padding: "11px 16px", border: "2.5px solid #000", textDecoration: "none", letterSpacing: ".3px" }}>START A ROOM</a>
          </div>
        </header>

        {/* HERO */}
        <section style={{ maxWidth: 1240, margin: "0 auto", padding: "54px 30px 30px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 40 }}>
          <div style={{ flex: "1 1 460px", minWidth: 300, animation: "enterUp .6s cubic-bezier(.16,1,.3,1) both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#1FE0FF", border: "2px solid #1FE0FF", padding: "5px 10px", marginBottom: 22, transform: "rotate(-1deg)" }}>// REAL-TIME AUDIO SYNC ENGINE</div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 0.96, fontSize: "clamp(44px,6vw,82px)", letterSpacing: "-.5px", color: "#F4F1FF" }} className="chroma-lg">PRESS PLAY ONCE.</h1>
            <h1 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontWeight: 400, lineHeight: 0.96, fontSize: "clamp(44px,6vw,82px)", letterSpacing: "-.5px", color: "#F4F1FF" }}>
              EVERYONE&apos;S ON<br />THE <span data-testid="glitch-beat" style={{ color: "#1FE0FF", WebkitTextStroke: "2px #000", textShadow: "4px 4px 0 #FF2A6D", display: "inline-block", animation: "glitchTxt 4.5s steps(2) infinite" }}>BEAT.</span>
            </h1>
            <div style={{ margin: "26px 0 30px", maxWidth: 520, background: "#FFE600", color: "#08070F", border: "3px solid #000", boxShadow: "6px 6px 0 #000", padding: "14px 16px", transform: "rotate(-.6deg)" }}>
              <span style={{ fontFamily: "var(--font-sticker)", fontSize: 13, letterSpacing: ".06em", color: "#FF2A6D", display: "block", marginBottom: 2 }}>// NARRATOR</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 15.5, fontWeight: 500, lineHeight: 1.4 }}>Start a room, drop in music, and every listener hits the <b>exact same moment</b> — down to the millisecond. Everyone streams their own copy. We sync only the beat.</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <button onClick={startRoom} className="cbtn" style={{ ...sv(6, 9), display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display)", fontSize: 16, color: "#fff", background: "linear-gradient(180deg,#FF4D8D,#FF2A6D)", padding: "16px 22px", border: "3px solid #000", letterSpacing: ".3px" }}>START A ROOM<Arrow /></button>
              <button onClick={focusJoin} className="cbtn" style={{ ...sv(6, 9, "rgba(31,224,255,.35)"), display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "var(--font-display)", fontSize: 16, color: "#1FE0FF", background: "transparent", padding: "16px 22px", border: "3px solid #1FE0FF", letterSpacing: ".3px" }}>JOIN WITH A CODE</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
              {[{ t: "<12MS DRIFT", c: "#1FE0FF" }, { t: "999+ LISTENERS", c: "#FF2A6D" }, { t: "0 SIGN-UP", c: "#C6FF00" }].map((s) => (
                <span key={s.t} style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: s.c, border: "1.5px solid #2c2440", background: "#120e1e", padding: "6px 10px" }}>{s.t}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: "1 1 380px", minWidth: 320, display: "flex", justifyContent: "center", animation: "enterUp .7s cubic-bezier(.16,1,.3,1) .12s both" }}>
            <SpiderWebHero />
          </div>
        </section>

        <Marquee />

        {/* HOW IT WORKS */}
        <section id="how" style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 30px 10px" }}>
          <SectionHeading title="HOW IT WORKS" dash="#FF2A6D" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {[
              { n: "01", sh: "rgba(255,42,109,.55)", num: "rgba(255,42,109,.16)", bg: "#FF2A6D", tc: "#fff", title: "START A ROOM", body: "Spin up a room in one click. Make it public for the multiverse, or keep it private with a code.", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" /></> },
              { n: "02", sh: "rgba(31,224,255,.5)", num: "rgba(31,224,255,.16)", bg: "#1FE0FF", tc: "#08070F", title: "DROP THE NEEDLE", body: "Queue up tracks. Everyone loads their own copy — no re-uploading, no buffering chaos.", icon: <circle cx="12" cy="12" r="3.4" /> },
              { n: "03", sh: "rgba(198,255,0,.45)", num: "rgba(198,255,0,.18)", bg: "#C6FF00", tc: "#08070F", title: "HIT PLAY ONCE", body: "Press play and the whole room locks to the same beat — synced within milliseconds. Every time.", bolt: true },
            ].map((c) => (
              <div key={c.n} style={{ position: "relative", background: "#16121F", border: "2px solid rgba(255,255,255,.09)", boxShadow: `7px 7px 0 ${c.sh}`, padding: "22px 20px", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -6, top: -22, fontFamily: "var(--font-display)", fontSize: 90, color: c.num, lineHeight: 1 }}>{c.n}</div>
                <div style={{ position: "relative", display: "inline-flex", width: 46, height: 46, borderRadius: 12, background: c.bg, border: "2.5px solid #000", alignItems: "center", justifyContent: "center", color: c.tc, marginBottom: 14 }}>
                  {c.bolt ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">{c.icon}</svg>
                  )}
                </div>
                <h3 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 17, color: "#fff", position: "relative" }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#b8b2cc", position: "relative" }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* START / JOIN */}
        <section id="start" style={{ maxWidth: 1180, margin: "0 auto", padding: "46px 30px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>
          {/* START */}
          <div style={{ position: "relative", background: "#14101F", border: "3px solid #000", boxShadow: "9px 9px 0 #FF2A6D", padding: "26px 24px" }}>
            <div style={{ position: "absolute", left: 18, top: -16, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#08070F", background: "#FF2A6D", padding: "5px 10px", border: "2.5px solid #000", transform: "rotate(-2deg)" }}>01 / START A ROOM</div>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#9A93B5", margin: "14px 0 7px" }}>ROOM NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brooklyn After Dark…" data-testid="room-name-input" className="comic-input" style={{ fontSize: 16, padding: "13px 14px" }} />
            <button onClick={() => setIsPublic((p) => !p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", marginTop: 16, background: "#08070F", border: "2px solid #2c2440", padding: "12px 14px", cursor: "pointer", textAlign: "left" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#F4F1FF" }}>List publicly</span>
                <span style={{ fontSize: 11.5, color: "#9A93B5" }}>so others can discover it</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: isPublic ? "#C6FF00" : "#9A93B5" }}>{isPublic ? "PUBLIC" : "PRIVATE"}</span>
                <span style={{ position: "relative", width: 46, height: 26, borderRadius: 999, border: "2.5px solid #000", background: isPublic ? "#C6FF00" : "#2c2440", transition: "background .15s" }}>
                  <span style={{ position: "absolute", top: 1, left: isPublic ? 23 : 1, width: 18, height: 18, borderRadius: "50%", background: "#fff", border: "2px solid #000", transition: "left .18s cubic-bezier(.34,1.56,.64,1)" }} />
                </span>
              </span>
            </button>
            <button onClick={startRoom} data-testid="start-room" className="cbtn" style={{ ...sv(5, 8), display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", marginTop: 18, fontFamily: "var(--font-display)", fontSize: 17, color: "#fff", background: "linear-gradient(180deg,#FF4D8D,#FF2A6D)", padding: 15, border: "3px solid #000", letterSpacing: ".4px" }}>START A ROOM<Arrow /></button>
          </div>
          {/* JOIN */}
          <div style={{ position: "relative", background: "#14101F", border: "3px solid #000", boxShadow: "9px 9px 0 #1FE0FF", padding: "26px 24px" }}>
            <div style={{ position: "absolute", left: 18, top: -16, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "#08070F", background: "#1FE0FF", padding: "5px 10px", border: "2.5px solid #000", transform: "rotate(2deg)" }}>02 / JOIN WITH A CODE</div>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#9A93B5", margin: "14px 0 7px" }}>6-DIGIT ROOM CODE</label>
            <input ref={joinRef} value={code} onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && joinByCode()} placeholder="GWEN65" maxLength={6} data-testid="join-code-input" className="comic-input cyan" style={{ color: "#1FE0FF", fontFamily: "var(--font-display)", fontSize: 34, letterSpacing: ".42em", textAlign: "center", padding: "16px 0 16px 16px", textTransform: "uppercase" }} />
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10 }}>
              {["#1FE0FF", "#FF2A6D", "#C6FF00"].map((c, i) => (
                <span key={c} style={{ width: 8, height: 8, background: c, borderRadius: "50%", animation: `eqBar 1s ease-in-out ${i * 0.3}s infinite` }} />
              ))}
            </div>
            <button onClick={joinByCode} data-testid="join-by-code" className="cbtn" style={{ ...sv(5, 8), display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", marginTop: 14, fontFamily: "var(--font-display)", fontSize: 17, color: "#08070F", background: "linear-gradient(180deg,#5cf0ff,#1FE0FF)", padding: 15, border: "3px solid #000", letterSpacing: ".4px" }}>
              JUMP IN<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>
            </button>
          </div>
        </section>

        {/* LIVE ROOMS */}
        <section id="live" style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 30px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(26px,3.4vw,40px)", color: "#F4F1FF" }} className="chroma">LIVE ROOMS</h2>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: live ? "#1FE0FF" : "#C6FF00", border: `2px solid ${live ? "#1FE0FF" : "#C6FF00"}`, padding: "5px 9px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: live ? "#1FE0FF" : "#C6FF00", boxShadow: `0 0 8px ${live ? "#1FE0FF" : "#C6FF00"}`, animation: "eqBar 1.1s ease-in-out infinite" }} />{live ? "LIVE · CROSS-DEVICE" : "LOCAL MODE"}
            </span>
            <div style={{ flex: 1, minWidth: 40, height: 3, background: "repeating-linear-gradient(90deg,#1FE0FF 0 14px,transparent 14px 22px)" }} />
          </div>
          {rooms.length === 0 ? (
            <div style={{ background: "#16121F", border: "2px solid rgba(255,255,255,.09)", boxShadow: "6px 6px 0 rgba(0,0,0,.6)", padding: 26, textAlign: "center", color: "#9A93B5", fontSize: 14 }}>
              No public rooms right now. Spin one up above — it&apos;ll swing in here for everyone.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 20 }}>
              {rooms.map((r) => (
                <RoomCard key={r.roomId} room={r} onJoin={() => router.push(`/room/${r.roomId}`)} />
              ))}
            </div>
          )}
          <div style={{ marginTop: 24, background: "#FFE600", color: "#08070F", border: "3px solid #000", boxShadow: "6px 6px 0 #000", padding: "13px 16px", transform: "rotate(-.4deg)", maxWidth: 760 }}>
            <span style={{ fontFamily: "var(--font-sticker)", fontSize: 13, color: "#FF2A6D", letterSpacing: ".05em" }}>// HEADS UP</span>
            <span style={{ display: "block", fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginTop: 2 }}>
              {live ? (
                <>Running <b>LIVE</b> — rooms sync across every device, anywhere. Public rooms show up here for the whole multiverse.</>
              ) : (
                <>Running in <b>LOCAL MODE</b> — sync works between tabs of this browser. Add Supabase keys to swing across devices.</>
              )}
            </span>
          </div>
        </section>

        {/* DEVELOPER CREDITS (3D) */}
        <DeveloperCredits name="Syed ⚡" role="Designer & Developer" linkedIn={LINKEDIN} />

        {/* FOOTER */}
        <footer style={{ borderTop: "2px solid #221836", marginTop: 46, padding: "28px 30px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#F4F1FF" }} className="chroma">SYNCWAVE</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6a6483", letterSpacing: ".04em" }}>listen together, on the beat · made with great power</div>
        </footer>
      </div>

      {/* NAME EDITOR */}
      {editingName && identity && (
        <div role="dialog" aria-modal="true" aria-labelledby="name-title" onClick={() => setEditingName(false)} style={{ position: "fixed", inset: 0, zIndex: 80, display: "grid", placeItems: "center", background: "rgba(8,7,15,.7)", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 340, background: "#14101F", border: "3px solid #000", boxShadow: "8px 8px 0 #1FE0FF", padding: 22 }}>
            <h3 id="name-title" style={{ margin: "0 0 12px", fontFamily: "var(--font-display)", fontSize: 18, color: "#fff" }} className="chroma">YOUR NAME</h3>
            <input autoFocus defaultValue={identity.name} className="comic-input cyan" style={{ fontSize: 16, padding: "12px 14px" }} onKeyDown={(e) => { if (e.key === "Enter") { rename((e.target as HTMLInputElement).value); setEditingName(false); } else if (e.key === "Escape") setEditingName(false); }} />
            <p style={{ margin: "10px 0 0", fontFamily: "var(--font-mono)", fontSize: 11, color: "#9A93B5" }}>Press ENTER to save.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ title, dash }: { title: string; dash: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
      <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(26px,3.4vw,40px)", color: "#F4F1FF" }} className="chroma">{title}</h2>
      <div style={{ flex: 1, height: 3, background: `repeating-linear-gradient(90deg,${dash} 0 14px,transparent 14px 22px)` }} />
    </div>
  );
}
