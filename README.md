# 🌊 SyncWave — Web

**Press play once. Everyone is on the same beat — within milliseconds.**

SyncWave is real-time *synchronized listening*: a host starts a room, picks music,
and every listener hears the exact same moment of the same track at the same
instant — whether they're in the same room or across the world. This is the
**web** app (Next.js, deployable to Vercel). It implements **Model A** of the
spec: nobody streams audio to anybody — every client plays its **own copy**, and
SyncWave synchronizes only the *playback state* (track, position, play/pause).

> **Licensing invariant (Section 0):** No copyrighted audio ever transits a
> SyncWave server. Audio is always rendered client-side — from the built-in
> royalty-free demo tracks (served directly from their origin), from YouTube
> (each client streams the same video directly), or from the user's own local
> files. Servers carry *control state only*.

---

## ✨ What works

- **The sync engine (Section 4):** NTP-style clock sync, coordinated future-start,
  and continuous drift correction — with **inaudible playback-rate nudging** on
  HTML5 audio and micro-seek correction on YouTube.
- **Rooms:** create / join by code, presence with live avatars, **automatic host
  election** and host transfer.
- **The Resonance UI (Section 9):** dynamic album-art theming, frosted glass,
  spring micro-interactions, and a **three.js / WebGL audio-reactive scene** plus
  the signature **Resonance Ring** — both driven by the *synced position*, so
  they breathe in unison on every device. That shared breath is the visual proof
  of sync. Honors `prefers-reduced-motion`; WCAG AA focus + dialog semantics.
- **Social:** shared queue, live chat, floating emoji reactions.
- **Discovery:** a live public-room lobby — with **zero database** (it rides on
  Realtime presence).
- **Multi-source audio:** built-in royalty-free tracks, **YouTube** (paste a link
  or search), and **local files**.

## 🧱 How the spec maps onto serverless (Vercel + Supabase)

The spec assumes a persistent, stateful Socket.IO gateway. Vercel functions are
stateless and short-lived, so responsibilities are relocated without losing the
guarantees:

| Spec (self-hosted) | SyncWave-Web |
|---|---|
| Gateway holds room state | **Host browser** orchestrates; snapshot served to late joiners |
| `clock:ping/pong` vs gateway | NTP sampling vs a **Next.js `/api/time` edge route** |
| Redis pub/sub fan-out | **Supabase Realtime** broadcast (channel per room) |
| Redis presence set | **Supabase Realtime presence** (carries each client's clock offset) |
| Postgres durable data | **Supabase Postgres** — *optional* (`supabase/schema.sql`) |

A `Transport` interface abstracts the wire, with two implementations:
`SupabaseTransport` (cross-device) and `BroadcastChannelTransport`
(same-browser, **zero config**). The app auto-selects.

---

## 🚀 Quick start

```bash
npm install
npm run dev    # needs Node >= 18.17
```

Open <http://localhost:3000>. With **no configuration**, the app runs in
**local mode**: open the same room in two browser tabs, press play in one, and
watch both tabs lock to the same beat and the Resonance Ring breathe in unison.

> Node note: this repo targets Node ≥ 18.17 (Next.js 14). On Windows, the
> easiest path is [nvm-windows](https://github.com/coreybutler/nvm-windows):
> `nvm install 20 && nvm use 20`.

## 🌍 Cross-device sync (Supabase Realtime)

1. Create a free project at <https://supabase.com>.
2. **Project Settings → API**, copy the **Project URL** and the **anon public** key.
3. Create `.env.local` (see `.env.example`):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. Restart `npm run dev`. That's it — broadcast + presence work out of the box.
   No tables, no SQL, no auth required for the live experience.

### Optional extras

- **In-app YouTube search:** set `YOUTUBE_API_KEY` (YouTube Data API v3). Without
  it, you can still paste any YouTube link — that always works.
- **Durable persistence:** run `supabase/schema.sql` in the Supabase SQL editor
  (history, persisted queue). Not needed for the live experience.

## ✅ End-to-end tests

Playwright drives a real Chromium against a production build. The local-mode
(BroadcastChannel) transport lets two pages in one browser act as two listeners,
so the **sync engine is tested end-to-end with no Supabase**:

```bash
npm run build
npm run test:e2e:install   # one-time: download Chromium
npm run test:e2e
```

17 tests cover: home/navigation, presence + host election, **a host playing a
track + a late joiner catching up in sync**, cross-client chat, shared-queue
sync, the `/api/time` & `/api/search` routes, and accessibility semantics.

## ☁️ Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at <https://vercel.com/new> (framework auto-detects as Next.js).
3. Add the env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   optional `YOUTUBE_API_KEY`) in **Project → Settings → Environment Variables**.
4. Deploy. Vercel builds with Node 20.

---

## 🗂️ Project layout

```
src/
  app/
    page.tsx                 # Home / Discover + Start a room
    room/[id]/page.tsx       # The Listening Room (centerpiece)
    api/time/route.ts        # shared clock authority (NTP)
    api/search/route.ts      # YouTube metadata search proxy (metadata only)
  lib/
    sync/clock.ts            # NTP-style offset estimation (Section 4.1)
    sync/syncEngine.ts       # coordinated start + drift correction (4.2/4.3)
    transport/               # Transport interface + Supabase & BroadcastChannel
    audio/                   # HTML5 / YouTube / local-file adapters
    useRoom.ts               # orchestration: presence, host election, playback
    useLobby.ts              # zero-DB public-room discovery
  components/                # Resonance design system + room UI
supabase/schema.sql          # OPTIONAL durable layer (Section 6)
```

## 🎚️ Sync engine, in one paragraph

Each client estimates its offset from a shared server clock by sampling
`/api/time` NTP-style (keep the lowest-RTT samples, take the median). To start,
the host never says "play now" — it schedules a **future** instant in shared
server time and every client counts down locally (`startAtServerTs - clockOffset`).
Late joiners seek to `position + (serverNow() − atServerTs)` and jump in aligned.
Then a host heartbeat every few seconds lets each client measure drift and
correct it: within tolerance, nothing; small drift, an **inaudible** rate nudge
(0.96–1.04× for ~1.8s on HTML5 audio); large drift, a hard seek.

## 🚧 Not in this MVP (spec breadth for later)

- The React Native mobile app, NestJS gateway, and AWS/Terraform infra
  (Sections 2, 3, 11) — this is the web client + serverless control plane.
- Spotify / Apple Music SDKs (web playback requires Premium + each provider's
  OAuth app); the demo + YouTube + local-file paths cover playback today.
- Account auth, durable queue persistence by default, and a persistent
  mini-player (the building blocks are here).

## 📝 Credits

Demo tracks are SoundHelix's algorithmically generated, free-to-use songs,
streamed directly from soundhelix.com (never proxied). Built to the SyncWave
spec, Model A.
