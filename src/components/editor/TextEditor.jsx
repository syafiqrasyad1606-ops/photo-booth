// components/editor/TextEditor.jsx
import { useState } from 'react';

const TEXT_PRESETS = [
  { text: 'SMILE 😊', color: '#FFD700' },
  { text: 'LOVE ❤️', color: '#FF6B6B' },
  { text: 'FUN 🎉', color: '#FF6BD6' },
  { text: 'COOL 😎', color: '#4ECDC4' },
  { text: 'HI! 👋', color: '#45B7D1' },
  { text: 'WOW ✨', color: '#FFA94D' },
  { text: 'BESTIE 💕', color: '#FF85A1' },
  { text: 'LIT 🔥', color: '#FF6B35' },
];

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA94D', '#FF85A1', '#FFD700', '#FF6BD6', '#FFFFFF', '#000000'];

export default function TextEditor({ onAddText, onClose }) {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(32);

  const handleAdd = () => {
    if (text.trim()) {
      onAddText?.(text.trim(), color, fontSize);
      setText('');
    }
  };

  return (
    <div className="pb-text-editor">
      <div className="pb-text-editor-header">
        <span>✏️ Teks</span>
        {onClose && (
          <button className="pb-text-close" onClick={onClose} type="button">✕</button>
        )}
      </div>

      <div className="pb-text-input-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis teks..."
          className="pb-text-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
        />
        <button className="pb-text-add-btn" onClick={handleAdd} type="button">
          +
        </button>
      </div>

      <div className="pb-text-controls">
        <div className="pb-text-control-group">
          <label>Warna</label>
          <div className="pb-color-picker">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`pb-color-btn ${color === c ? 'active' : ''}`}
                style={{ 
                  background: c,
                  border: color === c ? '2px solid #E8A33D' : '2px solid transparent',
                }}
                onClick={() => setColor(c)}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="pb-text-control-group">
          <label>Ukuran</label>
          <div className="pb-size-control">
            <button onClick={() => setFontSize(Math.max(16, fontSize - 4))} type="button">−</button>
            <span>{fontSize}px</span>
            <button onClick={() => setFontSize(Math.min(72, fontSize + 4))} type="button">+</button>
          </div>
        </div>
      </div>

      <div className="pb-text-presets">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.text}
            className="pb-text-preset-btn"
            onClick={() => {
              setText(preset.text);
              setColor(preset.color);
            }}
            type="button"
          >
            {preset.text}
          </button>
        ))}
      </div>

      <style>{`
        .pb-text-editor {
          padding: 12px;
        }
        .pb-text-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .pb-text-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          opacity: 0.6;
          padding: 4px 8px;
        }
        .pb-text-close:hover {
          opacity: 1;
        }
        .pb-text-input-row {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }
        .pb-text-input {
          flex: 1;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 12px;
          outline: none;
        }
        .pb-text-input:focus {
          border-color: #E8A33D;
        }
        .pb-text-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
        .pb-text-add-btn {
          padding: 6px 12px;
          border-radius: 8px;
          border: none;
          background: #E8A33D;
          color: #000;
          font-weight: 700;
          cursor: pointer;
          font-size: 16px;
        }
        .pb-text-add-btn:hover {
          background: #f0b84d;
        }
        .pb-text-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .pb-text-control-group {
          flex: 1;
          min-width: 120px;
        }
        .pb-text-control-group label {
          display: block;
          color: rgba(255,255,255,0.5);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .pb-color-picker {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .pb-color-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pb-color-btn:hover {
          transform: scale(1.1);
        }
        .pb-size-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pb-size-control button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 16px;
          cursor: pointer;
        }
        .pb-size-control button:hover {
          background: rgba(255,255,255,0.15);
        }
        .pb-size-control span {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }
        .pb-text-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }
        .pb-text-preset-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pb-text-preset-btn:hover {
          background: rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  );
}