import ThemePicker from "../pickers/ThemePicker";
import FilterPicker from "../pickers/FilterPicker";
import CountPicker from "../pickers/CountPicker";
import FramePicker from "../pickers/FramePicker";

const CAPTURE_MODES = [
  { id: "photo", label: "Foto" },
  { id: "video", label: "Video" },
  { id: "gif", label: "GIF" },
  { id: "boomerang", label: "Boomerang" },
];

const FRAME_STYLES = [
  { id: "simple", label: "Simple" },
  { id: "scrapbook", label: "Scrapbook" },
];

export default function IntroScreen({
  captureMode,
  setCaptureMode,

  caption,
  setCaption,

  theme,
  setTheme,

  filter,
  setFilter,

  shotCount,
  setShotCount,

  frame,
  setFrame,

  frameStyle,
  setFrameStyle,
  scrapbookThemeId,
  stickerThemes,
  onOpenFrameSelect,

  themes,
  filters,
  frames,
  countOptions,

  onStart,
  starting,
  error,
}) {
  const isPhotoMode = captureMode === "photo";
  const isSimpleStyle = frameStyle === "simple";
  const selectedScrapbookTheme = stickerThemes ? stickerThemes[scrapbookThemeId] : null;

  return (
    <section>
      <div className="pb-field">
        <label>Mode Capture</label>
        <div className="pb-pills">
          {CAPTURE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`pb-pill${captureMode === m.id ? " selected" : ""}`}
              onClick={() => setCaptureMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {isPhotoMode && (
        <div className="pb-field">
          <label htmlFor="pb-caption">
            Caption strip (opsional)
          </label>

          <input
            id="pb-caption"
            type="text"
            placeholder="PHOTO BOOTH"
            maxLength={30}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
      )}

      {isPhotoMode && (
        <div className="pb-field">
          <label>Gaya Bingkai</label>
          <div className="pb-pills">
            {FRAME_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`pb-pill${frameStyle === s.id ? " selected" : ""}`}
                onClick={() => setFrameStyle(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isPhotoMode && isSimpleStyle && (
        <ThemePicker
          themes={themes}
          theme={theme}
          onChange={setTheme}
        />
      )}

      {isPhotoMode && isSimpleStyle && (
        <FramePicker
          frame={frame}
          setFrame={setFrame}
          frames={frames}
        />
      )}

      {isPhotoMode && !isSimpleStyle && (
        <div className="pb-field">
          <label>Tema Scrapbook</label>
          <button
            type="button"
            className="pb-btn-secondary"
            style={{ width: "100%" }}
            onClick={onOpenFrameSelect}
          >
            {selectedScrapbookTheme ? selectedScrapbookTheme.name : "Pilih Tema"} — Ganti
          </button>
        </div>
      )}

      <FilterPicker
        filters={filters}
        filter={filter}
        onChange={setFilter}
      />

      {isPhotoMode && (
        <CountPicker
          options={countOptions}
          shotCount={shotCount}
          onChange={setShotCount}
        />
      )}

      <p className="pb-hint">
        {captureMode === "photo" &&
          `${shotCount} foto akan diambil otomatis, masing-masing dengan hitungan mundur 3 detik.`}
        {captureMode === "video" &&
          "Video akan direkam otomatis selama 5 detik setelah hitungan mundur 3 detik."}
        {captureMode === "gif" &&
          "GIF bergerak singkat akan direkam otomatis setelah hitungan mundur 3 detik."}
        {captureMode === "boomerang" &&
          "Gerakan singkat akan direkam lalu diputar maju-mundur berulang, setelah hitungan mundur 3 detik."}
      </p>

      <button
        className="pb-btn-primary"
        onClick={onStart}
        disabled={starting}
      >
        {starting
          ? "Meminta izin kamera..."
          : "Mulai Sesi"}
      </button>

      {error && (
        <div className="pb-error">
          {error}
        </div>
      )}
    </section>
  );
}