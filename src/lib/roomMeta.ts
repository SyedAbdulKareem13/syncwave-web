// The creator of a room remembers its name + visibility locally so it can label
// the room and advertise it to the lobby. Joiners learn the name from the host's
// presence instead.

export interface RoomMeta {
  name: string;
  isPublic: boolean;
  createdByMe: boolean;
}

const key = (id: string) => `syncwave:room:${id}`;

export function saveRoomMeta(id: string, meta: RoomMeta): void {
  try {
    localStorage.setItem(key(id), JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

export function loadRoomMeta(id: string): RoomMeta | null {
  try {
    const raw = localStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as RoomMeta) : null;
  } catch {
    return null;
  }
}
