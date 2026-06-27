"use client";
import { motion } from "framer-motion";
import type { LobbyRoom } from "@/lib/types";

export function RoomCard({ room, onJoin }: { room: LobbyRoom; onJoin: () => void }) {
  const a = room.accent ? `rgb(${room.accent.join(",")})` : "rgb(124,92,255)";
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onJoin}
      className="glass group flex w-full items-center gap-4 rounded-card p-4 text-left"
    >
      <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ background: `linear-gradient(135deg, ${a}, rgba(255,255,255,0.06))` }}>
        {room.artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.artworkUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">🎧</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-base font-semibold">{room.name}</h3>
          {room.isPlaying && <span className="h-2 w-2 animate-live-pulse rounded-full bg-sync-ok" />}
        </div>
        <p className="truncate text-sm text-text-muted">
          {room.trackTitle ? `${room.trackTitle}${room.trackArtist ? ` · ${room.trackArtist}` : ""}` : "Idle"}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          {room.hostName} · {room.listeners} listening
        </p>
      </div>
      <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold transition group-hover:bg-accent group-hover:text-ink">
        Join
      </span>
    </motion.button>
  );
}
