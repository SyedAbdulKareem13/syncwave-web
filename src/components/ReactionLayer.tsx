"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactionEvent } from "@/lib/types";
import { hashString } from "@/lib/util";

/** Live emoji reactions drift upward (Section 9.3). */
export function ReactionLayer({ reactions }: { reactions: ReactionEvent[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {reactions.map((r) => {
          const left = 12 + (Math.abs(hashString(r.id)) % 76); // 12%–88%
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 1, 0], y: -180, scale: [0.6, 1.15, 1, 1.1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.6, ease: "easeOut" }}
              style={{ position: "absolute", bottom: "8%", left: `${left}%` }}
              className="text-3xl drop-shadow-lg"
            >
              {r.emoji}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
