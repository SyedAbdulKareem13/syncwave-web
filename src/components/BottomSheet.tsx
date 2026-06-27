"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cx } from "@/lib/util";

type Tab = "queue" | "chat" | "react";

export function BottomSheet({
  queueCount,
  chatCount,
  queue,
  chat,
  react,
}: {
  queueCount: number;
  chatCount: number;
  queue: React.ReactNode;
  chat: React.ReactNode;
  react: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("queue");

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "queue", label: "Queue", badge: queueCount || undefined },
    { id: "chat", label: "Chat", badge: chatCount || undefined },
    { id: "react", label: "React" },
  ];

  return (
    <motion.div
      className="glass fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl rounded-t-card"
      initial={false}
      animate={{ height: open ? "min(62vh, 560px)" : 64 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center pt-2.5"
        aria-label={open ? "Collapse panel" : "Expand panel"}
      >
        <span className="h-1 w-10 rounded-full bg-white/30" />
      </button>

      <div className="flex items-center gap-1 px-4 pt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setOpen(true);
            }}
            className={cx(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition",
              open && tab === t.id ? "bg-white/14 text-text-primary" : "text-text-muted hover:text-text-primary",
            )}
          >
            {t.label}
            {t.badge ? (
              <span className="rounded-full bg-accent/30 px-1.5 text-[10px] font-semibold text-accent">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {open && (
        <div className="h-[calc(100%-104px)] overflow-hidden px-4 pb-4 pt-3">
          {tab === "queue" && queue}
          {tab === "chat" && chat}
          {tab === "react" && react}
        </div>
      )}
    </motion.div>
  );
}
