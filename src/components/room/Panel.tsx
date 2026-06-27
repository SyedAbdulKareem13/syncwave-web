/** A comic panel: black-bordered card with an offset coloured shadow and a
 *  rotated sticker label pinned to its top-left corner. */
export function Panel({
  label,
  labelBg,
  labelColor = "#08070F",
  shadow,
  rotate = -1.5,
  padding = "20px 18px",
  children,
}: {
  label: string;
  labelBg: string;
  labelColor?: string;
  shadow: string;
  rotate?: number;
  padding?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative", background: "#14101F", border: "3px solid #000", boxShadow: `7px 7px 0 ${shadow}`, padding }}>
      <div style={{ position: "absolute", left: 16, top: -15, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: labelColor, background: labelBg, padding: "5px 10px", border: "2.5px solid #000", transform: `rotate(${rotate}deg)`, zIndex: 2 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
