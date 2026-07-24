// components/camera/CaptureModeSelector.jsx
import { useState } from 'react';

const MODES = [
  { id: 'photo', label: '📸', name: 'Foto' },
  { id: 'gif', label: '🎞️', name: 'GIF' },
  { id: 'boomerang', label: '🔄', name: 'Boomerang' },
  { id: 'video', label: '🎬', name: 'Video' },
];

export default function CaptureModeSelector({ mode, onChange }) {
  return (
    <div className="pb-mode-selector">
      {MODES.map((m) => (
        <button
          key={m.id}
          className={`pb-mode-btn ${mode === m.id ? 'active' : ''}`}
          onClick={() => onChange(m.id)}
          type="button"
        >
          <span className="pb-mode-icon">{m.label}</span>
          <span className="pb-mode-name">{m.name}</span>
        </button>
      ))}
      <style>{`
        .pb-mode-selector {
          display: flex;
          gap: 6px;
          padding: 6px 8px;
          background: rgba(0,0,0,0.6);
          border-radius: 14px;
          backdrop-filter: blur(8px);
          position: absolute;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .pb-mode-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 12px;
          border: 2px solid transparent;
          border-radius: 10px;
          background: transparent;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 11px;
          opacity: 0.5;
          min-width: 52px;
        }
        .pb-mode-btn:hover { 
          opacity: 1; 
          background: rgba(255,255,255,0.08); 
        }
        .pb-mode-btn.active {
          opacity: 1;
          border-color: #E8A33D;
          background: rgba(232,163,61,0.15);
        }
        .pb-mode-icon { font-size: 20px; }
        .pb-mode-name { 
          font-weight: 600; 
          letter-spacing: 0.04em;
          font-size: 9px;
          text-transform: uppercase;
        }
        @media (max-width: 420px) {
          .pb-mode-selector { bottom: 60px; gap: 4px; padding: 4px 6px; }
          .pb-mode-btn { padding: 4px 8px; min-width: 40px; }
          .pb-mode-icon { font-size: 16px; }
          .pb-mode-name { font-size: 8px; }
        }
      `}</style>
    </div>
  );
}