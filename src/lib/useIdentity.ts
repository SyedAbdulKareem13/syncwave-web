"use client";
import { useCallback, useEffect, useState } from "react";
import { pickAvatar, randomName, uid } from "./util";

export interface Identity {
  userId: string;
  name: string;
  avatar: string;
}

const KEY = "syncwave:identity";

/** A lightweight, persistent client identity (no account needed for the MVP). */
export function useIdentity(): { identity: Identity | null; rename: (name: string) => void } {
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    // Test/preview seam: ?uid=&name= give this tab an ephemeral identity (not
    // persisted), so two tabs of one browser can act as two distinct listeners.
    try {
      const params = new URLSearchParams(window.location.search);
      const uidParam = params.get("uid");
      if (uidParam) {
        setIdentity({ userId: uidParam, name: params.get("name") || randomName(uidParam), avatar: pickAvatar(uidParam) });
        return;
      }
    } catch {
      /* ignore */
    }
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setIdentity(JSON.parse(raw) as Identity);
        return;
      }
    } catch {
      /* ignore */
    }
    const id = uid();
    const fresh: Identity = { userId: id, name: randomName(id), avatar: pickAvatar(id) };
    try {
      localStorage.setItem(KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
    setIdentity(fresh);
  }, []);

  const rename = useCallback((name: string) => {
    setIdentity((prev) => {
      if (!prev) return prev;
      const next = { ...prev, name: name.trim() || prev.name };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { identity, rename };
}
