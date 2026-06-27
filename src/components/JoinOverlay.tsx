"use client";
import { motion } from "framer-motion";

/**
 * Browsers block programmatic audio until a user gesture. This tap both unlocks
 * audio and lands the listener into the currently-playing moment, in sync.
 */
export function JoinOverlay({ roomName, onJoin }: { roomName: string; onJoin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-title"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/70 backdrop-blur-md p-6"
    >
      <div className="glass flex max-w-sm flex-col items-center gap-5 rounded-card p-8 text-center">
        <div className="text-5xl">🎧</div>
        <div>
          <h2 id="join-title" className="font-display text-2xl font-semibold">{roomName}</h2>
          <p className="mt-2 text-sm text-text-muted">
            Tap to listen — you&apos;ll drop into the exact same moment everyone else is hearing.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onJoin}
          autoFocus
          data-testid="join-listen"
          className="rounded-full px-6 py-3 font-semibold text-ink"
          style={{ background: "rgb(var(--accent))", boxShadow: "0 8px 30px rgb(var(--accent) / 0.5)" }}
        >
          Tap to listen in sync
        </motion.button>
      </div>
    </motion.div>
  );
}
