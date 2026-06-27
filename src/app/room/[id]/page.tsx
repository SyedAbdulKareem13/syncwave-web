"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComicOverlays } from "@/components/comic/Overlays";
import { RoomTopBar } from "@/components/room/RoomTopBar";
import { NowPlaying } from "@/components/room/NowPlaying";
import { QueueCard } from "@/components/room/QueueCard";
import { ListenersCard } from "@/components/room/ListenersCard";
import { ReactionsCard } from "@/components/room/ReactionsCard";
import { ChatCard } from "@/components/room/ChatCard";
import { FloatingReactions } from "@/components/room/FloatingReactions";
import { TrackPicker } from "@/components/TrackPicker";
import { JoinOverlay } from "@/components/JoinOverlay";
import { useIdentity } from "@/lib/useIdentity";
import { useRoom } from "@/lib/useRoom";

export default function RoomPage({ params }: { params: { id: string } }) {
  const roomId = decodeURIComponent(params.id).toUpperCase();
  const router = useRouter();
  const { identity } = useIdentity();
  const room = useRoom(roomId, identity);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!identity) {
    return <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh", color: "#9A93B5", fontFamily: "var(--font-mono)" }}>Loading…</main>;
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#F4F1FF", fontFamily: "var(--font-sans)" }}>
      <ComicOverlays />

      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", flex: 1, animation: "enterUp .45s cubic-bezier(.16,1,.3,1) both" }}>
        <RoomTopBar room={room} roomId={roomId} onLeave={() => router.push("/")} />

        <div className="room-grid">
          <NowPlaying room={room} onAddClick={() => setPickerOpen(true)} />

          <div className="room-right">
            <QueueCard
              queue={room.queue}
              isHost={room.isHost}
              onPlay={(t) => room.playTrack(t)}
              onRemove={room.removeFromQueue}
              onAddClick={() => setPickerOpen(true)}
            />
            <ListenersCard members={room.members} hostId={room.hostId} meId={identity.userId} />
            <ReactionsCard onReact={room.sendReaction} />
            <ChatCard chat={room.chat} meId={identity.userId} onSend={room.sendChat} />
          </div>
        </div>
      </div>

      <FloatingReactions reactions={room.reactions} />

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

      {room.ready && !room.audioReady && <JoinOverlay roomName={room.roomName} onJoin={room.unlock} />}
    </div>
  );
}
