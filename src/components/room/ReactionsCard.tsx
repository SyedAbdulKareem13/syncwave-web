"use client";
import { Panel } from "./Panel";

const EMOJI = ["🔥", "💥", "⚡", "❤️", "🕷️", "🙌", "🎶", "👏"];

export function ReactionsCard({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <Panel label="REACTIONS" labelBg="#7B2FF7" labelColor="#fff" shadow="#7B2FF7">
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 8 }}>
        {EMOJI.map((e) => (
          <button
            key={e}
            onClick={() => onReact(e)}
            aria-label={`React with ${e}`}
            className="cbtn-sm"
            style={{ fontSize: 24, lineHeight: 1, width: 48, height: 48, display: "grid", placeItems: "center", background: "#100d1a", border: "2.5px solid #000" }}
          >
            {e}
          </button>
        ))}
      </div>
    </Panel>
  );
}
