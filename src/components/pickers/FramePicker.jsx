// components/pickers/FramePicker.jsx
export default function FramePicker({ frame, setFrame, frames }) {
  return (
    <div className="pb-field">
      <label>🎨 Pilih Bingkai</label>
      <div className="pb-frame-grid">
        {Object.values(frames).map((f) => (
          <button
            key={f.id}
            className={`pb-frame-btn ${frame === f.id ? 'selected' : ''}`}
            onClick={() => setFrame(f.id)}
            type="button"
          >
            <span className="pb-frame-icon">{f.label.split(' ')[0]}</span>
            <span className="pb-frame-name">{f.label.split(' ').slice(1).join(' ') || f.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        .pb-frame-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .pb-frame-btn {
          padding: 10px 8px;
          border-radius: 12px;
          border: 2px solid var(--line);
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .pb-frame-btn:hover {
          background: rgba(36,23,19,0.04);
          transform: translateY(-2px);
          border-color: rgba(36,23,19,0.2);
        }
        .pb-frame-btn.selected {
          border-color: var(--film);
          background: var(--film);
          color: var(--cream);
        }
        .pb-frame-icon {
          font-size: 22px;
        }
        .pb-frame-name {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        @media (max-width: 420px) {
          .pb-frame-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}