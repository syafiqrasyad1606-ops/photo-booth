// components/result/ResultScreen.jsx
import { useState, useRef, useEffect } from 'react';

const EMOJI_STICKERS = ['⭐', '❤️', '👑', '😎', '🐱', '🐶', '🌈', '✨', '🌸', '🎉', '🔥', '💎', '🎀', '🌟', '💫', '🦄'];
const TEXT_PRESETS = ['SMILE 😊', 'LOVE ❤️', 'FUN 🎉', 'COOL 😎', 'HI! 👋', 'WOW ✨'];

export default function ResultScreen({
  resultUrl,
  showStrip,
  onDownload,
  onShare,
  onRetake,
  kioskCountdown,
  onCancelAutoReset,
  // Props untuk stiker & teks
  stickers = [],
  texts = [],
  onAddSticker,
  onAddText,
  onRemoveProp,
  onUpdateProp,
}) {
  const imgRef = useRef(null);
  const [revealHeight, setRevealHeight] = useState(0);
  const [showPropsPanel, setShowPropsPanel] = useState(false);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    setRevealHeight(0);
  }, [resultUrl]);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setRevealHeight(imgRef.current.getBoundingClientRect().height);
    }
  };

  const handleAddText = () => {
    if (textInput.trim()) {
      onAddText?.(textInput.trim(), '#FFFFFF', 32);
      setTextInput('');
    }
  };

  return (
    <section>
      <div
        className={`pb-strip-preview ${showStrip ? "show" : ""}`}
        style={{ height: showStrip ? revealHeight : 0 }}
      >
        <div className={`pb-strip-wrapper ${showStrip ? "show" : ""}`} style={{ position: 'relative' }}>
          <img
            ref={imgRef}
            src={resultUrl}
            alt="Hasil photo booth strip"
            onLoad={handleImageLoad}
            style={{ display: 'block' }}
          />
          
          {/* Props Overlay di atas result image */}
          {showStrip && (
            <div 
              className="pb-result-props"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
              }}
            >
              {/* Stickers */}
              {stickers.map((s) => (
                <div
                  key={s.id}
                  style={{
                    position: 'absolute',
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${s.width}px`,
                    height: `${s.height}px`,
                    transform: `rotate(${s.rotation || 0}deg)`,
                    pointerEvents: 'auto',
                    cursor: 'grab',
                    fontSize: `${s.width}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startLeft = s.x;
                    const startTop = s.y;

                    const onMove = (ev) => {
                      const dx = ((ev.clientX - startX) / imgRef.current?.offsetWidth || 1) * 100;
                      const dy = ((ev.clientY - startY) / imgRef.current?.offsetHeight || 1) * 100;
                      onUpdateProp?.(s.id, 'sticker', { 
                        x: Math.max(0, Math.min(100, startLeft + dx)),
                        y: Math.max(0, Math.min(100, startTop + dy))
                      });
                    };

                    const onUp = () => {
                      document.removeEventListener('mousemove', onMove);
                      document.removeEventListener('mouseup', onUp);
                    };

                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                  }}
                >
                  {s.emoji}
                </div>
              ))}

              {/* Texts */}
              {texts.map((t) => (
                <div
                  key={t.id}
                  style={{
                    position: 'absolute',
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    transform: `rotate(${t.rotation || 0}deg)`,
                    color: t.color || '#FFFFFF',
                    fontSize: `${t.fontSize}px`,
                    fontFamily: t.font || "'Arial Black', Arial, sans-serif",
                    fontWeight: 'bold',
                    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                    pointerEvents: 'auto',
                    cursor: 'grab',
                    userSelect: 'none',
                    letterSpacing: '1px',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startLeft = t.x;
                    const startTop = t.y;

                    const onMove = (ev) => {
                      const dx = ((ev.clientX - startX) / imgRef.current?.offsetWidth || 1) * 100;
                      const dy = ((ev.clientY - startY) / imgRef.current?.offsetHeight || 1) * 100;
                      onUpdateProp?.(t.id, 'text', { 
                        x: Math.max(0, Math.min(100, startLeft + dx)),
                        y: Math.max(0, Math.min(100, startTop + dy))
                      });
                    };

                    const onUp = () => {
                      document.removeEventListener('mousemove', onMove);
                      document.removeEventListener('mouseup', onUp);
                    };

                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                  }}
                >
                  {t.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Props Panel (di bawah result) */}
      {showStrip && (
        <>
          <button
            className="pb-props-toggle-btn"
            onClick={() => setShowPropsPanel(!showPropsPanel)}
            type="button"
          >
            {showPropsPanel ? '🎨 Tutup Props' : '🎨 Tambah Stiker / Teks'}
          </button>

          {showPropsPanel && (
            <div className="pb-props-panel-result">
              <div className="pb-props-section">
                <label>Stiker</label>
                <div className="pb-sticker-grid">
                  {EMOJI_STICKERS.map((emoji) => (
                    <button
                      key={emoji}
                      className="pb-sticker-btn"
                      onClick={() => onAddSticker?.(null, emoji)}
                      type="button"
                    >
                      <span style={{ fontSize: 28 }}>{emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pb-props-section">
                <label>Teks</label>
                <div className="pb-text-input-row">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Tulis teks..."
                    className="pb-text-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddText();
                    }}
                  />
                  <button className="pb-text-add-btn" onClick={handleAddText} type="button">
                    +
                  </button>
                </div>
                <div className="pb-text-presets">
                  {TEXT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      className="pb-text-preset-btn"
                      onClick={() => onAddText?.(preset, '#FFFFFF', 28)}
                      type="button"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="pb-remove-prop-btn"
                onClick={onRemoveProp}
                type="button"
              >
                🗑️ Hapus Prop Terakhir
              </button>
            </div>
          )}
        </>
      )}

      <div className={`pb-row-buttons ${showStrip ? "show" : ""}`}>
        <button className="pb-btn-secondary" onClick={onRetake}>Ambil Ulang</button>
        <button className="pb-btn-secondary" onClick={onShare}>Bagikan</button>
      </div>

      <button
        className={`pb-btn-primary pb-download-btn ${showStrip ? "show" : ""}`}
        style={{ marginTop: 12 }}
        onClick={onDownload}
      >
        Download Strip
      </button>

      {kioskCountdown !== null && kioskCountdown !== undefined && (
        <p className="pb-kiosk-note">
          Mode kios aktif — kembali otomatis ke awal dalam {kioskCountdown} detik.
          <button type="button" onClick={onCancelAutoReset}>Batalkan</button>
        </p>
      )}

      <style>{`
        .pb-props-toggle-btn {
          width: 100%;
          padding: 12px;
          margin-top: 12px;
          border-radius: 12px;
          border: 2px solid var(--film);
          background: transparent;
          color: var(--ink);
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pb-props-toggle-btn:hover {
          background: rgba(36,23,19,0.06);
        }
        .pb-props-panel-result {
          background: var(--paper);
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
          border: 2px solid var(--line);
        }
        .pb-props-section {
          margin-bottom: 12px;
        }
        .pb-props-section label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(36,23,19,0.5);
          margin-bottom: 6px;
        }
        .pb-sticker-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
        }
        .pb-sticker-btn {
          padding: 4px;
          border: 2px solid transparent;
          border-radius: 8px;
          background: rgba(36,23,19,0.04);
          cursor: pointer;
          transition: all 0.2s;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pb-sticker-btn:hover {
          background: rgba(36,23,19,0.1);
          border-color: var(--film);
          transform: scale(1.05);
        }
        .pb-text-input-row {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
        }
        .pb-text-input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--line);
          background: #fff;
          font-size: 14px;
          color: var(--ink);
          outline: none;
        }
        .pb-text-input:focus {
          border-color: var(--film);
        }
        .pb-text-add-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: var(--film);
          color: var(--cream);
          font-weight: 700;
          cursor: pointer;
          font-size: 18px;
        }
        .pb-text-add-btn:hover {
          background: #241a15;
        }
        .pb-text-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .pb-text-preset-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--line);
          background: #fff;
          color: var(--ink);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pb-text-preset-btn:hover {
          background: var(--film);
          color: var(--cream);
        }
        .pb-remove-prop-btn {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: var(--rose);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pb-remove-prop-btn:hover {
          background: #d97a85;
        }
        .pb-result-props {
          border-radius: 10px;
          overflow: hidden;
        }
        @media (max-width: 420px) {
          .pb-sticker-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          .pb-props-panel-result {
            padding: 12px;
          }
        }
      `}</style>
    </section>
  );
}