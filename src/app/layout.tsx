import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SyncWave — listen together, on the beat",
  description:
    "Press play once. Everyone's on the beat — synced within milliseconds. Real-time synchronized listening, Spider-Verse style.",
};

export const viewport: Viewport = {
  themeColor: "#08070F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Bangers&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* comic overlays — toggled per-screen by the pages, but global by default */}
        {children}
      </body>
    </html>
  );
}
