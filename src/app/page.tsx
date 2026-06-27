"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { RoomCard } from "@/components/RoomCard";
import { useIdentity } from "@/lib/useIdentity";
import { useLobby } from "@/lib/useLobby";
import { saveRoomMeta } from "@/lib/roomMeta";
import { joinCode } from "@/lib/util";

export default function HomePage() {
  const router = useRouter();
  const { identity, rename } = useIdentity();
  const { rooms, mode } = useLobby();

  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [code, setCode] = useState("");
  const [editingName, setEditingName] = useState(false);

  const startRoom = () => {
    const id = joinCode();
    saveRoomMeta(id, { name: name.trim() || "My SyncWave room", isPublic, createdByMe: true });
    router.push(`/room/${id}`);
  };

  const joinByCode = () => {
    const c = code.trim().toUpperCase();
    if (c) router.push(`/room/${c}`);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto min-h-dvh w-full max-w-2xl px-5 pb-24 pt-8"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌊</span>
          <span className="font-display text-xl font-bold tracking-tight">SyncWave</span>
        </div>
        {identity && (
          <button
            onClick={() => setEditingName(true)}
            className="glass flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10">{identity.avatar}</span>
            <span className="max-w-[120px] truncate">{identity.name}</span>
          </button>
        )}
      </header>

      {editingName && identity && (
        <div role="dialog" aria-modal="true" aria-labelledby="edit-name-title" className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-6" onClick={() => setEditingName(false)}>
          <GlassCard className="w-full max-w-xs p-5" >
            <div onClick={(e) => e.stopPropagation()}>
              <h3 id="edit-name-title" className="mb-3 font-display font-semibold">Your name</h3>
              <input
                autoFocus
                defaultValue={identity.name}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    rename((e.target as HTMLInputElement).value);
                    setEditingName(false);
                  } else if (e.key === "Escape") {
                    setEditingName(false);
                  }
                }}
                className="w-full rounded-full bg-white/8 px-4 py-2 text-sm outline-none focus:bg-white/12"
              />
              <p className="mt-2 text-xs text-text-muted">Press Enter to save.</p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Hero */}
      <section className="mt-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
        >
          Press play once.
          <br />
          <span style={{ color: "rgb(var(--accent))" }}>Everyone&apos;s on the same beat.</span>
        </motion.h1>
        <p className="mx-auto mt-4 max-w-md text-text-muted">
          Start a room, pick music, and every listener hears the exact same moment — within milliseconds. Everyone plays
          their own copy; we sync only the beat.
        </p>
      </section>

      {/* Start a room */}
      <GlassCard className="mt-8 p-5">
        <h2 className="font-display text-lg font-semibold">Start a room</h2>
        <div className="mt-4 flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Room name (e.g. Friday Night In)"
            data-testid="room-name-input"
            className="rounded-full bg-white/8 px-4 py-2.5 text-sm outline-none placeholder:text-text-muted focus:bg-white/12"
          />
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-[rgb(var(--accent))]" />
              List publicly so others can discover it
            </label>
          </div>
          <button
            onClick={startRoom}
            data-testid="start-room"
            className="rounded-full py-3 font-semibold text-ink transition active:scale-[0.99]"
            style={{ background: "rgb(var(--accent))", boxShadow: "0 8px 30px rgb(var(--accent) / 0.4)" }}
          >
            Start a room
          </button>
        </div>
      </GlassCard>

      {/* Join by code */}
      <GlassCard className="mt-4 p-5">
        <h2 className="font-display text-lg font-semibold">Join with a code</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && joinByCode()}
            placeholder="ABC123"
            maxLength={8}
            data-testid="join-code-input"
            className="flex-1 rounded-full bg-white/8 px-4 py-2.5 text-sm uppercase tracking-widest outline-none placeholder:text-text-muted focus:bg-white/12"
          />
          <button onClick={joinByCode} data-testid="join-by-code" className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/16">
            Join
          </button>
        </div>
      </GlassCard>

      {/* Discover */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Live rooms</h2>
          <span className="text-xs text-text-muted">{mode === "supabase" ? "across the world" : "local mode"}</span>
        </div>
        {rooms.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-text-muted">
            No public rooms right now. Start one above — it&apos;ll show up here for everyone.
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {rooms.map((r) => (
              <RoomCard key={r.roomId} room={r} onJoin={() => router.push(`/room/${r.roomId}`)} />
            ))}
          </div>
        )}
      </section>

      {mode === "local" && (
        <p className="mt-8 text-center text-xs text-text-muted">
          Running in <strong>local mode</strong> — sync works between tabs of this browser. Add your Supabase keys
          (see README) to sync across devices and the world.
        </p>
      )}
    </motion.main>
  );
}
