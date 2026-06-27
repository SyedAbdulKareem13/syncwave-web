/** Animated spider-web logo mark (swaying). */
export function WebLogo({ size = 42 }: { size?: number }) {
  return (
    <div
      data-testid="web-logo"
      style={{ position: "relative", width: size, height: size, flex: "0 0 auto", animation: "webSway 4s steps(8) infinite" }}
    >
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block", filter: "drop-shadow(0 0 6px rgba(31,224,255,.5))" }}>
        <g stroke="#1FE0FF" strokeWidth="2.5" fill="none" opacity="0.85">
          <line x1="50" y1="50" x2="50" y2="4" />
          <line x1="50" y1="50" x2="92" y2="22" />
          <line x1="50" y1="50" x2="96" y2="50" />
          <line x1="50" y1="50" x2="92" y2="78" />
          <line x1="50" y1="50" x2="50" y2="96" />
          <line x1="50" y1="50" x2="8" y2="78" />
          <line x1="50" y1="50" x2="4" y2="50" />
          <line x1="50" y1="50" x2="8" y2="22" />
          <polygon points="68,50 63,63 50,68 37,63 32,50 37,37 50,32 63,37" />
          <polygon points="88,50 77,77 50,88 23,77 12,50 23,23 50,12 77,23" />
        </g>
        <circle cx="50" cy="50" r="6.5" fill="#FF2A6D" />
      </svg>
    </div>
  );
}
