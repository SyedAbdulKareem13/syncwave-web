import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SyncWave — listen together, on the beat",
  description:
    "Press play once. Everyone is on the same beat — within milliseconds. Real-time synchronized listening on the web.",
};

export const viewport: Viewport = {
  themeColor: "#0B0B12",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="resonance-bg" aria-hidden />
        {children}
      </body>
    </html>
  );
}
