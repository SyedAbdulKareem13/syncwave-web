"use client";
import { motion } from "framer-motion";

function Icon({ name }: { name: "play" | "pause" | "next" | "prev" }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "currentColor" } as const;
  switch (name) {
    case "play":
      return (
        <svg {...common}>
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      );
    case "next":
      return (
        <svg {...common}>
          <path d="M6 5l8 7-8 7zM16 5h3v14h-3z" />
        </svg>
      );
    case "prev":
      return (
        <svg {...common}>
          <path d="M18 5l-8 7 8 7zM5 5h3v14H5z" />
        </svg>
      );
  }
}

export function HostControls({
  isHost,
  isPlaying,
  hasTrack,
  hostName,
  onToggle,
  onNext,
  onPrev,
}: {
  isHost: boolean;
  isPlaying: boolean;
  hasTrack: boolean;
  hostName: string;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  if (!isHost) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm text-text-muted">
        <span className="inline-block h-2 w-2 rounded-full bg-text-muted/60" />
        {hostName ? `${hostName} is steering` : "Host is steering"}
      </div>
    );
  }

  const btn =
    "flex items-center justify-center rounded-full text-text-primary transition disabled:opacity-30";

  return (
    <div className="flex items-center justify-center gap-5">
      <motion.button
        whileTap={{ scale: 0.88 }}
        className={`${btn} h-12 w-12 bg-white/8 hover:bg-white/14`}
        onClick={onPrev}
        disabled={!hasTrack}
        aria-label="Previous track"
      >
        <Icon name="prev" />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`${btn} h-[68px] w-[68px]`}
        style={{ background: "rgb(var(--accent))", boxShadow: "0 8px 30px rgb(var(--accent) / 0.5)" }}
        onClick={onToggle}
        disabled={!hasTrack}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        <span className="text-ink">
          <Icon name={isPlaying ? "pause" : "play"} />
        </span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.88 }}
        className={`${btn} h-12 w-12 bg-white/8 hover:bg-white/14`}
        onClick={onNext}
        disabled={!hasTrack}
        aria-label="Next track"
      >
        <Icon name="next" />
      </motion.button>
    </div>
  );
}
