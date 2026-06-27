"use client";
import { motion } from "framer-motion";

const EMOJI = ["🔥", "❤️", "🕺", "🎉", "😭", "🙌", "✨", "🥁", "🎸", "👏", "🌊", "💜"];

export function ReactPanel({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <div className="py-2">
      <p className="mb-3 text-sm text-text-muted">Tap to react — everyone sees it float by, live.</p>
      <div className="grid grid-cols-6 gap-2">
        {EMOJI.map((e) => (
          <motion.button
            key={e}
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => onReact(e)}
            aria-label={`React with ${e}`}
            className="grid aspect-square place-items-center rounded-2xl bg-white/6 text-2xl hover:bg-white/12"
          >
            {e}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
