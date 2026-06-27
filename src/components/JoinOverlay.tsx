"use client";

/**
 * Browsers block programmatic audio until a user gesture. This tap unlocks audio
 * and drops the listener into the exact moment everyone else is hearing.
 */
export function JoinOverlay({ roomName, onJoin }: { roomName: string; onJoin: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="join-title" style={{ position: "fixed", inset: 0, zIndex: 90, display: "grid", placeItems: "center", background: "rgba(8,7,15,.82)", backdropFilter: "blur(6px)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#14101F", border: "3px solid #000", boxShadow: "10px 10px 0 #1FE0FF", padding: 28, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-sticker)", fontSize: 40, color: "#FFE600", lineHeight: 1, transform: "rotate(-3deg)", textShadow: "3px 3px 0 #FF2A6D" }}>THWIP!</div>
        <h2 id="join-title" style={{ margin: "16px 0 8px", fontFamily: "var(--font-display)", fontSize: 22, color: "#fff" }} className="chroma">{roomName}</h2>
        <p style={{ margin: "0 0 22px", fontSize: 14, color: "#b8b2cc", lineHeight: 1.45 }}>Tap to jack in — you&apos;ll land on the exact same beat as everyone else.</p>
        <button onClick={onJoin} autoFocus data-testid="join-listen" className="cbtn" style={{ "--cs": "5px", "--csh": "8px", fontFamily: "var(--font-display)", fontSize: 16, color: "#08070F", background: "linear-gradient(180deg,#5cf0ff,#1FE0FF)", padding: "15px 24px", border: "3px solid #000", letterSpacing: ".3px" } as React.CSSProperties}>
          TAP TO LISTEN IN SYNC
        </button>
      </div>
    </div>
  );
}
