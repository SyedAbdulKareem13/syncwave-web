<div align="center">

# 🎧 SyncWave

### Real-time synchronized listening on the web

*Press play once — every device stays on the same beat.*

<p>
  <a href="https://syncwave-web-kappa.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-22d3ee?style=for-the-badge&logo=vercel&logoColor=0d1117" alt="Live demo" /></a>
</p>

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase%20Realtime-1c1c1c?style=flat-square&logo=supabase&logoColor=3ECF8E)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Playwright](https://img.shields.io/badge/Tested%20with%20Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)

</div>

---

## What is SyncWave?

SyncWave is a web app for **listening together, in sync**. A host opens a room and picks a track; every
listener who joins hears the **exact same moment of the same song**, no matter their device or network.

The trick: SyncWave **doesn't stream audio between peers**. Each client plays its *own* copy of the audio,
and the app synchronizes only the **playback state** (which track, playing/paused, and the precise position).
That keeps bandwidth tiny and quality perfect, while a clock-sync layer keeps everyone aligned to the millisecond.

> 🔴 **Try it live:** **[syncwave-web-kappa.vercel.app](https://syncwave-web-kappa.vercel.app)** — open it in two tabs (or two phones) and press play.

---

## How it works — the sync engine

The hard part of "listening together" is that every device has a slightly different clock and a different
network delay. SyncWave solves this in three steps:

1. **NTP-style clock sync.** The client repeatedly pings a lightweight `/api/time` endpoint, measures
   round-trip time, and computes a **median, RTT-filtered offset** between its own clock and the server's —
   the same idea NTP uses to keep computers' clocks honest.
2. **State-only model.** The room broadcasts a tiny playback state — `{ trackId, isPlaying, positionAt,
   serverTimestamp }` — rather than audio.
3. **Future-start scheduling.** Instead of "play now" (which races the network), the host schedules
   "play at server-time *T*". Every client converts *T* into its own local clock using the offset from step 1
   and starts exactly then. Result: **sample-accurate, drift-free alignment.**

---

## Architecture

SyncWave is built around two pluggable interfaces so the same room logic works across environments:

| Layer | Interface | Implementations |
|-------|-----------|-----------------|
| **Transport** (how state is shared) | `Transport` | `SupabaseTransport` (cross-device, via Supabase Realtime) · `BroadcastChannelTransport` (local multi-tab dev) |
| **Playback** (how audio plays) | `PlaybackAdapter` | `Html5AudioAdapter` · `YouTubeAdapter` · local-files |

```
src/
├─ app/                 # Next.js App Router (routes + /api/time)
├─ components/
│  ├─ room/             # NowPlaying, QueueCard, ChatCard, ListenersCard, FloatingReactions…
│  └─ comic/            # Spider-Verse themed hero, web logo, marquee, overlays
└─ lib/
   ├─ sync/             # clock.ts (offset estimation) + syncEngine.ts
   ├─ transport/        # Supabase + BroadcastChannel transports
   ├─ audio/            # HTML5 + YouTube playback adapters
   └─ hooks/            # useRoom, useLobby, useIdentity
supabase/schema.sql     # room / presence / message tables
```

---

## Features

- ⏱️ **Drift-free sync** — NTP-style clock alignment for sample-accurate playback
- 🔌 **Pluggable transports** — Supabase Realtime for real rooms, BroadcastChannel for local dev
- 🎚️ **Pluggable playback** — HTML5 audio, YouTube, and local files behind one interface
- 👥 **Live rooms** — presence/listeners, a shared queue, real-time chat, and floating emoji reactions
- 🕸️ **Comic / Spider-Verse UI** — animated hero, web logo and marquee built with Framer Motion
- ✅ **End-to-end tested** — Playwright suite covering sync, presence, chat, queue, accessibility & the API

---

## Getting started

> Requires **Node ≥ 18.17**.

```bash
git clone https://github.com/SyedAbdulKareem13/syncwave-web.git
cd syncwave-web
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

Run `supabase/schema.sql` against your project to create the room/presence/message tables.
Without Supabase keys, the app still runs locally using the **BroadcastChannel** transport (multi-tab on one machine).

### Testing

```bash
npm run test:e2e:install   # one-time: install Playwright browsers
npm run test:e2e           # run the end-to-end suite
```

---

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` | Lint & type-check |
| `npm run test:e2e` | Playwright end-to-end tests |

---

## Roadmap

- [ ] Accounts & persistent rooms
- [ ] Native streaming-SDK adapters (Spotify / Apple Music)
- [ ] Mobile-first companion experience
- [ ] Host hand-off & co-host controls

---

<div align="center">
<sub>Built with Next.js, Supabase Realtime & a lot of clock math.</sub>
</div>
