"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Member } from "@/lib/types";
import { cx } from "@/lib/util";

/** Floating listener avatars (Section 9.3). Host can tap a member to hand off. */
export function PresenceBar({
  members,
  hostId,
  meId,
  isHost,
  onTransfer,
}: {
  members: Member[];
  hostId: string;
  meId: string;
  isHost: boolean;
  onTransfer: (userId: string) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const sorted = [...members].sort((a, b) => (a.userId === hostId ? -1 : b.userId === hostId ? 1 : 0));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false}>
        {sorted.map((m) => {
          const isRoomHost = m.userId === hostId;
          const isMe = m.userId === meId;
          return (
            <motion.button
              key={m.userId}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              onClick={() => {
                if (isHost && !isMe) setOpen(open === m.userId ? null : m.userId);
              }}
              className={cx(
                "glass relative flex items-center gap-2 rounded-full py-1 pl-1 pr-3",
                isRoomHost && "ring-1 ring-accent",
              )}
              title={m.name}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-base">{m.avatar}</span>
              <span className="max-w-[90px] truncate text-xs font-medium text-text-primary">
                {isMe ? "You" : m.name}
              </span>
              {isRoomHost && (
                <span className="rounded-full bg-accent/20 px-1.5 text-[10px] font-semibold text-accent">
                  HOST
                </span>
              )}
              {open === m.userId && isHost && !isMe && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 top-full z-20 mt-1 whitespace-nowrap rounded-lg bg-ink-2 px-2 py-1 text-[11px] shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransfer(m.userId);
                    setOpen(null);
                  }}
                >
                  Make host
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
