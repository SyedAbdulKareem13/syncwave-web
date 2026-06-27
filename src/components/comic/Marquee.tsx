const ITEMS = ["LISTEN TOGETHER", "ON THE BEAT", "ZERO DRIFT", "ONE PLAY · EVERY DEVICE", "THWIP!"];

/** Rotated scrolling marquee bar. */
export function Marquee() {
  const run = [...ITEMS, ...ITEMS];
  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "3px solid #000",
        borderBottom: "3px solid #000",
        background: "#FF2A6D",
        transform: "rotate(-1deg)",
        margin: "18px 0 30px",
        width: "106%",
        marginLeft: "-3%",
      }}
    >
      <div style={{ display: "flex", width: "max-content", animation: "marquee 18s linear infinite" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            padding: "9px 26px",
            fontFamily: "var(--font-sticker)",
            fontSize: 22,
            letterSpacing: ".05em",
            color: "#08070F",
            whiteSpace: "nowrap",
          }}
        >
          {run.map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 26 }}>
              <span>{t}</span>
              <span style={{ color: "#FFE600" }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
