// components/camera/PropsOverlay.jsx
import { useState, useRef, useEffect } from 'react';

export default function PropsOverlay({ 
  stickers = [], 
  texts = [], 
  accessories = [],
  onUpdateProp,
  interactive = true, // default true untuk result screen
}) {
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, id, type) => {
    if (!interactive) return; // Tidak bisa drag di session screen
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!container) return;
    
    setDragging({ id, type });
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging || !interactive) return;
    
    const container = document.querySelector('.pb-props-overlay')?.getBoundingClientRect();
    if (!container) return;

    const x = e.clientX - container.left - dragOffset.x;
    const y = e.clientY - container.top - dragOffset.y;

    onUpdateProp?.(dragging.id, dragging.type, { x, y });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (!interactive) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, interactive]);

  if (stickers.length === 0 && texts.length === 0 && accessories.length === 0) {
    return null;
  }

  return (
    <div 
      className="pb-props-overlay" 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        pointerEvents: interactive ? 'none' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Stiker */}
      {stickers.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: s.x || 0,
            top: s.y || 0,
            width: s.width || 60,
            height: s.height || 60,
            pointerEvents: interactive ? 'auto' : 'none',
            cursor: interactive ? 'grab' : 'default',
            transform: `rotate(${s.rotation || 0}deg)`,
            zIndex: 5,
            opacity: s.opacity || 1,
          }}
          onMouseDown={(e) => handleMouseDown(e, s.id, 'sticker')}
        >
          {s.src ? (
            <img 
              src={s.src} 
              alt="stiker" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                draggable: false,
                pointerEvents: 'none',
              }} 
            />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: s.fontSize || 40,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}>
              {s.emoji}
            </div>
          )}
        </div>
      ))}

      {/* Teks */}
      {texts.map((t) => (
        <div
          key={t.id}
          style={{
            position: 'absolute',
            left: t.x || 0,
            top: t.y || 0,
            pointerEvents: interactive ? 'auto' : 'none',
            cursor: interactive ? 'grab' : 'default',
            color: t.color || '#fff',
            fontSize: t.fontSize || 32,
            fontFamily: t.font || "'Arial Black', Arial, sans-serif",
            fontWeight: 'bold',
            textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.3)',
            transform: `rotate(${t.rotation || 0}deg)`,
            zIndex: 5,
            opacity: t.opacity || 1,
            letterSpacing: t.letterSpacing || 0,
            lineHeight: 1.2,
            maxWidth: 300,
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          onMouseDown={(e) => handleMouseDown(e, t.id, 'text')}
        >
          {t.text}
        </div>
      ))}

      {/* Aksesori */}
      {accessories.map((a) => (
        <div
          key={a.id}
          style={{
            position: 'absolute',
            left: a.x || 0,
            top: a.y || 0,
            width: a.width || 80,
            height: a.height || 80,
            pointerEvents: 'none',
            transform: `rotate(${a.rotation || 0}deg)`,
            zIndex: 6,
            opacity: a.opacity || 1,
          }}
        >
          <img 
            src={a.src} 
            alt="aksesori" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              draggable: false,
              pointerEvents: 'none',
            }} 
          />
        </div>
      ))}

      <style>{`
        .pb-props-overlay {
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}