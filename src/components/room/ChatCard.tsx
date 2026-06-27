"use client";
import { useEffect, useRef, useState } from "react";
import { Panel } from "./Panel";
import type { ChatMessage } from "@/lib/types";

export function ChatCard({ chat, meId, onSend }: { chat: ChatMessage[]; meId: string; onSend: (text: string) => void }) {
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
    <Panel label="CHATTER" labelBg="#FF3B3B" labelColor="#fff" shadow="#FF3B3B" rotate={1}>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
        <div className="no-scrollbar" style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
          {chat.length === 0 && <span style={{ color: "#9A93B5", fontSize: 13, textAlign: "center", padding: "14px 0" }}>Say hey 👋</span>}
          {chat.map((m) => {
            const mine = m.userId === meId;
            return (
              <div key={m.id} data-testid="chat-message" style={{ display: "flex", gap: 8, flexDirection: mine ? "row-reverse" : "row" }}>
                <span style={{ marginTop: 2, width: 26, height: 26, flex: "0 0 auto", display: "grid", placeItems: "center", borderRadius: "50%", border: "2px solid #000", background: "#1f1830", fontSize: 13 }}>{m.avatar}</span>
                <div style={{ maxWidth: "78%", padding: "6px 10px", border: "2px solid #000", background: mine ? "#FF2A6D" : "#100d1a", color: mine ? "#fff" : "#F4F1FF" }}>
                  {!mine && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#d8d3e8" }}>{m.name}</div>}
                  <div style={{ fontSize: 13, wordBreak: "break-word" }}>{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message the room…" maxLength={300} className="comic-input" style={{ fontSize: 13, padding: "9px 11px" }} />
          <button onClick={send} className="cbtn-sm" style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "#08070F", background: "#1FE0FF", border: "2.5px solid #000", padding: "0 14px" }}>SEND</button>
        </div>
      </div>
    </Panel>
  );
}
