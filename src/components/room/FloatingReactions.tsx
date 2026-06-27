"use client";
import type { ReactionEvent } from "@/lib/types";
import { hashString } from "@/lib/util";

/** Emoji reactions that thwip upward across the screen. */
export function FloatingReactions({ reactions }: { reactions: ReactionEvent[] }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }} aria-hidden>
      {reactions.map((r) => {
        const left = 6 + (Math.abs(hashString(r.id)) % 78);
        return (
          <span
            key={r.id}
            style={{ position: "absolute", bottom: 80, left: `${left}%`, fontSize: 34, animation: "reactUp 1.5s steps(12) forwards" }}
          >
            {r.emoji}
          </span>
        );
      })}
    </div>
  );
}
