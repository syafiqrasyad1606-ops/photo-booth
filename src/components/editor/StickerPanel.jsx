// components/editor/StickerPanel.jsx
import { useState } from 'react';

const EMOJI_STICKERS = [
  '⭐', '❤️', '👑', '😎', '🐱', '🐶', '🌈', '✨',
  '🌸', '🎉', '🔥', '💎', '🎀', '🌟', '💫', '🦄',
  '🍕', '🎸', '🏀', '🚀', '🎯', '💪', '🧠', '👀'
];

export default function StickerPanel({ onSelectSticker, selectedSticker, onClose }) {
  const [category, setCategory] = useState('emoji');

  return (
    <div className="pb-sticker-panel">
      <div className="pb-sticker-panel-header">
        <span>🎨 Stiker</span>
        {onClose && (
          <button className="pb-sticker-close" onClick={onClose} type="button">✕</button>
        )}
      </div>
      
      <div className="pb-sticker-categories">
        <button 
          className={`pb-sticker-cat ${category === 'emoji' ? 'active' : ''}`}
          onClick={() => setCategory('emoji')}
          type="button"
        >
          😊 Emoji
        </button>
        <button 
          className={`pb-sticker-cat ${category === 'seasonal' ? 'active' : ''}`}
          onClick={() => setCategory('seasonal')}
          type="button"
        >
          🎄 Seasonal
        </button>
      </div>

      <div className="pb-sticker-grid">
        {EMOJI_STICKERS.map((emoji) => (
          <button
            key={emoji}
            className={`pb-sticker-item ${selectedSticker === emoji ? 'selected' : ''}`}
            onClick={() => onSelectSticker?.(emoji)}
            type="button"
          >
            <span style={{ fontSize: 32 }}>{emoji}</span>
          </button>
        ))}
      </div>

      <style>{`
        .pb-sticker-panel {
          padding: 12px;
        }
        .pb-sticker-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .pb-sticker-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          opacity: 0.6;
          padding: 4px 8px;
        }
        .pb-sticker-close:hover {
          opacity: 1;
        }
        .pb-sticker-categories {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }
        .pb-sticker-cat {
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pb-sticker-cat.active {
          background: rgba(232,163,61,0.2);
          border-color: #E8A33D;
        }
        .pb-sticker-cat:hover {
          background: rgba(255,255,255,0.1);
        }
        .pb-sticker-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
        }
        .pb-sticker-item {
          padding: 6px;
          border: 2px solid transparent;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          transition: all 0.2s;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pb-sticker-item:hover {
          background: rgba(255,255,255,0.15);
          transform: scale(1.05);
        }
        .pb-sticker-item.selected {
          border-color: #E8A33D;
          background: rgba(232,163,61,0.2);
        }
        .pb-sticker-item:active {
          transform: scale(0.9);
        }
      `}</style>
    </div>
  );
}