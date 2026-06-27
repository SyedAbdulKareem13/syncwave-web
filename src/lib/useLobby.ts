"use client";
import { useEffect, useState } from "react";
import { createTransport, type PresenceMeta } from "./transport";
import type { LobbyRoom } from "./types";
import { uid } from "./util";

/**
 * Live public-room discovery with zero database: hosts of public rooms advertise
 * a `LobbyRoom` via presence on a shared "lobby" channel; this hook reads it.
 * Works identically in Supabase (cross-device) and local (same-browser) modes.
 */
export function useLobby(): { rooms: LobbyRoom[]; mode: "supabase" | "local" } {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [mode, setMode] = useState<"supabase" | "local">("local");

  useEffect(() => {
    const transport = createTransport("lobby", `lobby-watch-${uid()}`);
    setMode(transport.mode);
    let cancelled = false;

    const off = transport.onPresence((members: PresenceMeta[]) => {
      if (cancelled) return;
      const byRoom = new Map<string, LobbyRoom>();
      for (const m of members) {
        if (m.lobby && m.lobby.roomId) byRoom.set(m.lobby.roomId, m.lobby);
      }
      setRooms([...byRoom.values()].sort((a, b) => b.listeners - a.listeners));
    });

    void transport.join();

    return () => {
      cancelled = true;
      off();
      void transport.leave();
    };
  }, []);

  return { rooms, mode };
}
