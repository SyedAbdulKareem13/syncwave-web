"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ResonanceRing } from "@/components/ResonanceRing";
import { AlbumArt } from "@/components/AlbumArt";
import { SyncHealthChip } from "@/components/SyncHealthChip";
import { Timeline } from "@/components/Timeline";
import { HostControls } from "@/components/HostControls";
import { PresenceBar } from "@/components/PresenceBar";
import { ReactionLayer } from "@/components/ReactionLayer";
import { BottomSheet } from "@/components/BottomSheet";
import { QueuePanel } from "@/components/QueuePanel";
import { ChatPanel } from "@/components/ChatPanel";
import { ReactPanel } from "@/components/ReactPanel";
import { TrackPicker } from "@/components/TrackPicker";
import { JoinOverlay } from "@/components/JoinOverlay";
import { useIdentity } from "@/lib/useIdentity";
import { useRoom } from "@/lib/useRoom";
import { resolveAccents, type AccentPair } from "@/lib/colors";
import { applyAccents } from "@/lib/accents";

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = decodeURIComponent(params.id).toUpperCase();
  const { identity } = useIdentity();
  const room = useRoom(roomId, identity);

  const [accents, setAccents] = useState<AccentPair>({ accent: [124, 92, 255], accent2: [40, 200, 220] });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ringSize, setRingSize] = useState(320);
  const [copied, setCopied] = useState(false);

  // Theme morph on track change (Section 9.1).
  useEffect(() => {
    let alive = true;
    void resolveAccents(room.track).then((p) => {
      if (!alive) return;
      setAccents(p);
      applyAccents(p);
    });
    return () => {
      alive = false;
    };
  }, [room.track?.uri]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const calc = () => setRingSize(Math.min(360, Math.max(232, window.innerWidth - 72)));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  if (!identity) {
    return <main className="grid min-h-dvh place-items-center text-text-muted">Loading…</main>;
  }

  const hostMember = room.members.find((m) => m.userId === room.hostId);
  const showStartCta = !room.track && room.isHost;
  const showWaiting = !room.track && !room.isHost;

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-2xl px-5 pb-28 pt-5">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="glass grid h-9 w-9 place-items-center rounded-full text-text-muted hover:text-text-primary" aria-label="Back home">
          ‹
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate font-display text-base font-semibold">{room.roomName}</h1>
          <button onClick={share} className="text-xs tracking-widest text-text-muted hover:text-text-primary">
            {copied ? "Link copied ✓" : `CODE ${roomId} · share`}
          </button>
        </div>
        <SyncHealthChip skewMs={room.skewMs} quality={room.syncQuality} isHost={room.isHost} mode={room.mode} />
      </header>

      {/* Presence */}
      <div className="mt-4 flex justify-center">
        <PresenceBar
          members={room.members}
          hostId={room.hostId}
          meId={identity.userId}
          isHost={room.isHost}
          onTransfer={room.transferHost}
        />
      </div>

      {/* Player */}
      <section className="relative mt-6 flex flex-col items-center">
        <ReactionLayer reactions={room.reactions} />

        <ResonanceRing positionMs={room.positionMs} isPlaying={room.isPlaying} accent={accents.accent} accent2={accents.accent2} size={ringSize}>
          <AlbumArt track={room.track} accent={accents.accent} accent2={accents.accent2} />
        </ResonanceRing>

        <div className="mt-7 text-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={room.track?.uri ?? "none"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              {room.track?.title ?? (showWaiting ? "Waiting for the host…" : "Nothing playing")}
            </motion.h2>
          </AnimatePresence>
          {room.track?.artist && <p className="mt-1 text-text-muted">{room.track.artist}</p>}
        </div>

        {room.unresolved && (
          <div className="mt-3 rounded-full bg-sync-warn/15 px-4 py-1.5 text-xs text-sync-warn">
            Can&apos;t play this track on your device — you&apos;re still in the room.
          </div>
        )}

        {/* Timeline + controls */}
        <div className="mt-6 w-full max-w-md">
          <Timeline positionMs={room.positionMs} durationMs={room.durationMs} canScrub={room.isHost && !!room.track} onSeek={room.seek} />
          <div className="mt-5">
            <HostControls
              isHost={room.isHost}
              isPlaying={room.isPlaying}
              hasTrack={!!room.track}
              hostName={hostMember?.name ?? ""}
              onToggle={room.togglePlay}
              onNext={room.next}
              onPrev={room.prev}
            />
          </div>
        </div>

        {showStartCta && (
          <button
            onClick={() => setPickerOpen(true)}
            className="mt-6 rounded-full px-6 py-3 font-semibold text-ink"
            style={{ background: "rgb(var(--accent))", boxShadow: "0 8px 30px rgb(var(--accent) / 0.45)" }}
          >
            Start the music
          </button>
        )}
      </section>

      {/* Bottom sheet */}
      <BottomSheet
        queueCount={room.queue.length}
        chatCount={room.chat.length}
        queue={
          <QueuePanel
            queue={room.queue}
            isHost={room.isHost}
            onRemove={room.removeFromQueue}
            onReorder={room.reorderQueue}
            onAddClick={() => setPickerOpen(true)}
          />
        }
        chat={<ChatPanel chat={room.chat} meId={identity.userId} onSend={room.sendChat} />}
        react={<ReactPanel onReact={room.sendReaction} />}
      />

      {/* Modals */}
      <AnimatePresence>
        {pickerOpen && (
          <TrackPicker
            canPlayNow={room.isHost}
            onClose={() => setPickerOpen(false)}
            onSelect={(track, mode) => {
              if (mode === "play") void room.playTrack(track);
              else room.addToQueue(track);
              setPickerOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {room.ready && !room.audioReady && <JoinOverlay roomName={room.roomName} onJoin={room.unlock} />}
    </main>
  );
}
