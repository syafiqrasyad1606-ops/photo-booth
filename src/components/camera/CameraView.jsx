export default function CameraView({
  videoRef,
  filterCss,
  shotIndex,
  shotCount,
  countdownValue,
  flashing,
  shutter,
  focusLock,
  note,
  previewShot,
  mode = "photo",
  recordSecondsLeft = null,
}) {
  const isCapturingClip = (mode === "video" || mode === "gif" || mode === "boomerang") && recordSecondsLeft !== null;

  return (
    <section>
      <div className="pb-camera-wrap">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            display: "block",
            filter: filterCss,
          }}
        />

        {/* Preview hasil foto */}
        {previewShot && (
          <div className="pb-preview">
            <img src={previewShot} alt="Preview" />
          </div>
        )}

        {/* Focus */}
        <div className={`pb-focus ${focusLock ? "show" : ""}`} />

        {/* Flash */}
        <div className={`pb-flash ${flashing ? "flashing" : ""}`} />

        {/* Shutter */}
        <div className={`pb-shutter ${shutter ? "active" : ""}`}>
          <div className="pb-shutter-top" />
          <div className="pb-shutter-bottom" />
        </div>

        {isCapturingClip ? (
          <div className="pb-rec-indicator">
            <span className="pb-rec-dot" />
            {mode === "gif" ? "GIF" : mode === "boomerang" ? "BOOMERANG" : "REC"} {recordSecondsLeft}s
          </div>
        ) : (
          <div className="pb-shot-label">
            Foto {shotIndex} dari {shotCount}
          </div>
        )}

        <div className="pb-countdown">
          {countdownValue || ""}
        </div>
      </div>

      <p className="pb-note">{note}</p>
    </section>
  );
}