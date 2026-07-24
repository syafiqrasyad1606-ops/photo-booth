export default function FrameSelectScreen({ themes, selectedId, onSelect, onBack }) {
  return (
    <section>
      <button type="button" className="pb-btn-secondary" style={{ marginBottom: 16, width: "100%" }} onClick={onBack}>
        ← Back
      </button>

      <div className="pb-scrapbook-grid">
        {Object.values(themes).map((t) => {
          const previewStickers = (t.stickers || []).slice(0, 2);

          return (
            <button
              key={t.id}
              type="button"
              className={`pb-scrapbook-card${selectedId === t.id ? " selected" : ""}`}
              style={{ background: t.bg }}
              onClick={() => onSelect(t.id)}
            >
              <div className="pb-scrapbook-preview">
                <div className="pb-scrapbook-preview-slot" />
                <div className="pb-scrapbook-preview-slot" />
                <div className="pb-scrapbook-preview-slot" />
              </div>

              {previewStickers[0] && (
                <img
                  className="pb-scrapbook-preview-sticker pb-scrapbook-preview-sticker--a"
                  src={previewStickers[0].src}
                  alt=""
                />
              )}
              {previewStickers[1] && (
                <img
                  className="pb-scrapbook-preview-sticker pb-scrapbook-preview-sticker--b"
                  src={previewStickers[1].src}
                  alt=""
                />
              )}

              <span
                className="pb-scrapbook-card-name"
                style={{ color: t.textColor || "#4A2E2A" }}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}