/** Fixed comic-FX overlays: animated halftone dots + multiply scanlines. */
export function ComicOverlays() {
  return (
    <>
      <div className="fx-halftone" aria-hidden />
      <div className="fx-scan" aria-hidden />
    </>
  );
}
