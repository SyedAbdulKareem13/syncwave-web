"use client";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { cx } from "@/lib/util";

export function ChatPanel({ chat, meId, onSend }: { chat: ChatMessage[]; meId: string; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  const send = () => {
    onSend(text);
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-1">
        {chat.length === 0 && <p className="py-8 text-center text-sm text-text-muted">Say hi 👋</p>}
        {chat.map((m) => {
          const mine = m.userId === meId;
          return (
            <div key={m.id} className={cx("flex gap-2", mine && "flex-row-reverse")}>
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-sm">
                {m.avatar}
              </span>
              <div className={cx("max-w-[75%] rounded-2xl px-3 py-1.5", mine ? "bg-accent/25" : "bg-white/8")}>
                {!mine && <div className="text-[11px] font-medium text-text-muted">{m.name}</div>}
                <div className="text-sm text-text-primary break-words">{m.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message the room…"
          className="flex-1 rounded-full bg-white/8 px-4 py-2 text-sm outline-none placeholder:text-text-muted focus:bg-white/12"
          maxLength={300}
        />
        <button onClick={send} className="rounded-full px-4 py-2 text-sm font-semibold text-ink" style={{ background: "rgb(var(--accent))" }}>
          Send
        </button>
      </div>
    </div>
  );
}
