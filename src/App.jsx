import { useState, useRef, useCallback, useEffect } from "react";

import captureFrame from "./services/captureFrame";
import composeStrip from "./services/composeStrip";
import THEMES from "./config/themes";
import FILTERS from "./config/filters";
import LAYOUTS from "./config/layouts";
import FRAMES from "./config/frames";
import STICKER_THEMES from "./config/stickerThemes";
import IntroScreen from "./components/intro/IntroScreen";
import FrameSelectScreen from "./components/frames/FrameSelectScreen";
import CameraView from "./components/camera/CameraView";
import sleep from "./utils/sleep";
import waitForVideoReady from "./utils/waitForVideoReady";
import { playSound, stopSound } from "./utils/sound";
import { loadHistory, saveToHistory, deleteFromHistory, clearHistory } from "./services/history";
import encodeGif from "./services/encodeGif";
import composeScrapbookStrip from "./services/composeScrapbookStrip";

const GlobalStyle = () => (
  <style>{`
    html{ -webkit-text-size-adjust:100%; text-size-adjust:100%; }
    body{ margin:0; overflow-x:hidden; }
    .pb-root{
      --curtain:#2B0A10; --curtain-deep:#170508; --paper:#EDE3D0; --ink:#241713;
      --cream:#F5ECDD; --flash:#E8A33D; --rose:#C9707B; --film:#14100E; --line:rgba(36,23,19,0.14);
      min-height:100svh; min-height:100vh; width:100%; max-width:100vw; display:flex;
      align-items:center; justify-content:center; overflow-x:hidden;
      padding:32px 16px; padding-top:max(32px, env(safe-area-inset-top));
      padding-bottom:max(32px, env(safe-area-inset-bottom));
      padding-left:max(16px, env(safe-area-inset-left));
      padding-right:max(16px, env(safe-area-inset-right));
      box-sizing:border-box; color:var(--cream);
      font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      -webkit-tap-highlight-color:transparent;
      background:
        repeating-linear-gradient(90deg, rgba(0,0,0,0.14) 0 2px, transparent 2px 42px),
        radial-gradient(ellipse at top, #4a1219 0%, var(--curtain) 55%, var(--curtain-deep) 100%);
    }
    .pb-root *{ box-sizing:border-box; min-width:0; }
    .pb-root button{ -webkit-tap-highlight-color:transparent; touch-action:manipulation; }
    .pb-stage{ width:100%; max-width:620px; }

    /* ---------- Marquee title ---------- */
    .pb-marquee{ position:relative; text-align:center; padding:20px 10px 22px; margin-bottom:22px; }
    .pb-marquee::before, .pb-marquee::after{
      content:''; position:absolute; left:6px; right:6px; height:10px;
      background-image: radial-gradient(circle, var(--flash) 3px, rgba(232,163,61,0.15) 3.6px, transparent 4px);
      background-size:26px 10px; background-repeat:repeat-x;
    }
    .pb-marquee::before{ top:0; }
    .pb-marquee::after{ bottom:0; }
    .pb-marquee h1{
      margin:0; font-family:"Arial Narrow","Helvetica Neue Condensed",Arial,sans-serif; font-weight:900;
      font-size:clamp(34px,7vw,52px); letter-spacing:0.12em; text-transform:uppercase;
      color:var(--cream); text-shadow:0 0 18px rgba(232,163,61,0.35);
    }
    .pb-marquee p{ margin:6px 0 0; font-size:13px; letter-spacing:0.08em; color:rgba(245,236,221,0.6); text-transform:uppercase; }

    .pb-header-actions{ display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin:-6px 0 18px; }
    .pb-kiosk-toggle{
      display:flex; align-items:center; justify-content:center; gap:8px;
      padding:8px 16px; border-radius:999px;
      background:rgba(245,236,221,0.08); border:1px solid rgba(245,236,221,0.25);
      color:var(--cream); font-size:12px; font-weight:700; letter-spacing:0.04em;
      text-transform:uppercase; cursor:pointer;
    }
    .pb-kiosk-toggle:hover{ background:rgba(245,236,221,0.14); }
    .pb-kiosk-toggle.active{ background:var(--flash); border-color:var(--flash); color:var(--film); }
    .pb-kiosk-toggle:focus-visible{ outline:2px solid var(--flash); outline-offset:2px; }
    .pb-kiosk-dot{ width:8px; height:8px; border-radius:50%; background:currentColor; opacity:.5; flex-shrink:0; }
    .pb-kiosk-toggle.active .pb-kiosk-dot{ opacity:1; }

    .pb-gallery-nav{
      padding:8px 16px; border-radius:999px;
      background:rgba(245,236,221,0.08); border:1px solid rgba(245,236,221,0.25);
      color:var(--cream); font-size:12px; font-weight:700; letter-spacing:0.04em;
      text-transform:uppercase; cursor:pointer;
    }
    .pb-gallery-nav:hover{ background:rgba(245,236,221,0.14); }
    .pb-gallery-nav:focus-visible{ outline:2px solid var(--flash); outline-offset:2px; }

    .pb-kiosk-note{ text-align:center; font-size:12.5px; color:rgba(36,23,19,0.55); margin-top:10px; line-height:1.5; }
    .pb-kiosk-note button{
      background:none; border:none; padding:0; margin-left:4px;
      color:var(--film); font-weight:700; text-decoration:underline; cursor:pointer; font-size:inherit;
    }

    .pb-gallery-empty{ text-align:center; font-size:13.5px; color:rgba(36,23,19,0.6); margin:20px 0; line-height:1.6; }

    .pb-edit-canvas{
      position:relative; width:100%; max-width:320px; margin:0 auto;
      border-radius:10px; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,0.3);
      touch-action:none;
    }
    .pb-edit-canvas img{ display:block; width:100%; height:auto; user-select:none; pointer-events:none; }
    .pb-overlay{
      position:absolute; transform:translate(-50%,-50%); cursor:grab;
      user-select:none; touch-action:none; line-height:1; white-space:nowrap;
    }
    .pb-overlay.selected{ outline:2px dashed var(--flash); outline-offset:6px; }
    .pb-overlay-delete{
      position:absolute; top:-14px; right:-14px; width:28px; height:28px; border-radius:50%;
      background:var(--film); color:#fff; border:2px solid var(--paper); font-size:13px; line-height:1;
      display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0;
    }
    .pb-sticker-palette{ display:flex; flex-wrap:wrap; gap:8px; }
    .pb-sticker-btn{
      width:44px; height:44px; border-radius:10px; border:1.5px solid var(--line);
      background:#fff; font-size:22px; cursor:pointer; display:flex; align-items:center;
      justify-content:center; padding:0;
    }
    .pb-sticker-btn:hover{ background:rgba(36,23,19,0.05); }
    .pb-text-row{ display:flex; gap:8px; margin-bottom:10px; }
    .pb-text-row input{
      flex:1; padding:10px 12px; border-radius:10px; border:1.5px solid var(--line);
      font-size:14px; font-family:inherit;
    }
    .pb-color-dots{ display:flex; gap:8px; }
    .pb-color-dot{ width:32px; height:32px; border-radius:50%; border:2px solid transparent; cursor:pointer; padding:0; }
    .pb-color-dot.selected{ border-color:var(--ink); }
    .pb-gallery-grid{ display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:16px; }
    .pb-gallery-thumb{
      padding:0; border:2px solid var(--line); border-radius:10px; overflow:hidden;
      background:#fff; cursor:pointer; aspect-ratio:1/1.9;
    }
    .pb-gallery-thumb:hover{ border-color:rgba(36,23,19,0.35); }
    .pb-gallery-thumb img{ width:100%; height:100%; object-fit:cover; object-position:top; display:block; }
    .pb-gallery-modal{
      position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center;
      justify-content:center; z-index:1000; padding:24px;
    }
    .pb-gallery-modal-inner{
      background:var(--paper); border-radius:14px; padding:20px; max-width:360px; width:100%;
      max-height:90vh; overflow-y:auto; position:relative; text-align:center;
    }
    .pb-gallery-modal-inner img{ max-width:100%; border-radius:8px; display:block; margin:0 auto; }
    .pb-gallery-modal-close{
      position:absolute; top:10px; right:10px; width:34px; height:34px; border-radius:50%;
      border:none; background:var(--film); color:#fff; font-size:15px; cursor:pointer; line-height:1;
    }
    @media (max-width:420px){
      .pb-gallery-grid{ grid-template-columns:repeat(2, 1fr); }
    }

    /* ---------- Panel & form fields ---------- */
    .pb-panel{ background:var(--paper); color:var(--ink); border-radius:18px; padding:28px;
      box-shadow:0 24px 60px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(36,23,19,0.06); }
    .pb-field{ margin-bottom:20px; }
    .pb-field label{ display:block; font-size:12px; font-weight:700; letter-spacing:0.06em;
      text-transform:uppercase; color:rgba(36,23,19,0.65); margin-bottom:8px; }
    .pb-field input[type="text"]{ width:100%; padding:12px 14px; border-radius:10px;
      border:1.5px solid var(--line); background:#fff; font-size:15px; color:var(--ink); font-family:inherit; }
    .pb-field input[type="text"]:focus{ outline:2px solid var(--flash); outline-offset:1px; }
    .pb-themes{ display:flex; gap:14px; }

    .pb-scrapbook-grid{ display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:16px; }
    .pb-scrapbook-card{
      aspect-ratio:3/4; border-radius:16px; border:3px solid transparent;
      display:flex; align-items:flex-end; justify-content:center; padding:14px;
      cursor:pointer; text-align:center; position:relative; overflow:hidden;
    }
    .pb-scrapbook-card:hover{ border-color:rgba(36,23,19,0.2); }
    .pb-scrapbook-card.selected{ border-color:var(--film); }
    .pb-scrapbook-card:focus-visible{ outline:2px solid var(--flash); outline-offset:2px; }
    .pb-scrapbook-card-name{ position:relative; z-index:2; font-weight:800; font-size:13px; text-shadow:0 1px 3px rgba(255,255,255,0.6); }
    .pb-scrapbook-preview{
      position:absolute; inset:12% 22% 20%; display:flex; flex-direction:column; gap:6%;
      z-index:1; pointer-events:none;
    }
    .pb-scrapbook-preview-slot{ flex:1; background:rgba(255,255,255,0.8); border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
    .pb-scrapbook-preview-sticker{
      position:absolute; width:36px; height:36px; object-fit:contain;
      filter:drop-shadow(0 2px 3px rgba(0,0,0,0.25)); pointer-events:none; z-index:1;
    }
    .pb-scrapbook-preview-sticker--a{ top:8px; left:8px; transform:rotate(-10deg); }
    .pb-scrapbook-preview-sticker--b{ bottom:38px; right:8px; transform:rotate(10deg); }
    .pb-swatch{ width:52px; height:52px; border-radius:50%; border:3px solid transparent; cursor:pointer;
      position:relative; display:flex; align-items:center; justify-content:center; padding:0; }
    .pb-swatch:focus-visible{ outline:2px solid var(--ink); outline-offset:2px; }
    .pb-swatch.selected{ border-color:var(--ink); }
    .pb-swatch.selected::after{ content:'✓'; color:#fff; font-weight:900; font-size:18px; text-shadow:0 1px 2px rgba(0,0,0,0.4); }
    .pb-pills{ display:flex; gap:10px; flex-wrap:wrap; }
    .pb-pill{ padding:10px 18px; border-radius:999px; border:1.5px solid var(--line); background:#fff;
      color:var(--ink); font-size:14px; font-weight:700; cursor:pointer; letter-spacing:0.02em; }
    .pb-pill:hover{ background:rgba(36,23,19,0.05); }
    .pb-pill:focus-visible{ outline:2px solid var(--flash); outline-offset:2px; }
    .pb-pill.selected{ background:var(--film); border-color:var(--film); color:var(--cream); }
    .pb-hint{ font-size:13px; color:rgba(36,23,19,0.6); margin:4px 0 24px; line-height:1.5; }
    .pb-btn-primary{ width:100%; padding:16px; border:none; border-radius:12px; background:var(--film);
      color:var(--cream); font-size:16px; font-weight:800; letter-spacing:0.05em; text-transform:uppercase;
      cursor:pointer; transition:transform .15s ease, background .15s ease; }
    .pb-btn-primary:hover{ background:#241a15; }
    .pb-btn-primary:active{ transform:scale(0.98); }
    .pb-btn-primary:focus-visible{ outline:3px solid var(--flash); outline-offset:2px; }
    .pb-btn-primary:disabled{ opacity:0.55; cursor:not-allowed; }
    .pb-row-buttons{ display:flex; gap:12px; margin-top:14px; }
    .pb-btn-secondary{ flex:1; padding:14px; border-radius:12px; border:1.5px solid var(--film);
      background:transparent; color:var(--ink); font-weight:700; letter-spacing:0.03em; cursor:pointer; font-size:14px; }
    .pb-btn-secondary:hover{ background:rgba(36,23,19,0.06); }
    .pb-btn-secondary:focus-visible{ outline:2px solid var(--film); outline-offset:2px; }
    .pb-error{ background:#fff4ee; border:1.5px solid #d97757; color:#7a3419; padding:14px 16px;
      border-radius:10px; font-size:13.5px; line-height:1.5; margin-top:16px; }

    /* ---------- Camera / session screen ---------- */
    .pb-camera-wrap{ position:relative; width:100%; aspect-ratio:4/3; background:#000; border-radius:12px;
      overflow:hidden; box-shadow: inset 0 0 0 6px var(--film); }
    .pb-shot-label{ position:absolute; top:14px; left:0; right:0; text-align:center; font-size:12px;
      letter-spacing:0.1em; text-transform:uppercase; font-weight:700; color:#fff; text-shadow:0 1px 4px rgba(0,0,0,0.6); }
    .pb-rec-indicator{
      position:absolute; top:14px; left:0; right:0; text-align:center;
      font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:700;
      color:#fff; text-shadow:0 1px 4px rgba(0,0,0,0.6);
      display:flex; align-items:center; justify-content:center; gap:6px;
    }
    .pb-rec-dot{ width:9px; height:9px; border-radius:50%; background:#ff3b3b; animation:pb-rec-pulse 1s ease-in-out infinite; }
    @keyframes pb-rec-pulse{ 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }
    .pb-countdown{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
      font-family:"Courier New",monospace; font-weight:700; font-size:120px; color:#fff;
      text-shadow:0 0 24px rgba(0,0,0,0.7); pointer-events:none; }
    .pb-flash{ position:absolute; inset:0; background:#fff; opacity:0; pointer-events:none; }
    .pb-flash.flashing{ animation:pb-flashpop 380ms ease-out; }
    @keyframes pb-flashpop{ 0%{opacity:0.95;} 100%{opacity:0;} }

    .pb-shutter{ position:absolute; inset:0; overflow:hidden; pointer-events:none; }
    .pb-shutter-top, .pb-shutter-bottom{ position:absolute; width:100%; height:50%; background:#111; transition:.18s ease; }
    .pb-shutter-top{ top:-50%; }
    .pb-shutter-bottom{ bottom:-50%; }
    .pb-shutter.active .pb-shutter-top{ top:0; }
    .pb-shutter.active .pb-shutter-bottom{ bottom:0; }

    .pb-focus{
      position:absolute; left:50%; top:50%; width:180px; height:180px;
      transform:translate(-50%,-50%) scale(.6);
      border:4px solid #fff; border-radius:18px; opacity:0;
      box-shadow: 0 0 0 2px rgba(0,0,0,.25), 0 0 25px rgba(255,255,255,.5);
      transition:.25s;
    }
    .pb-focus.show{ opacity:1; transform:translate(-50%,-50%) scale(1); }

    .pb-preview{
      position:absolute; top:18px; right:18px; width:140px; height:105px;
      border-radius:12px; overflow:hidden; background:#fff;
      box-shadow: 0 12px 30px rgba(0,0,0,.35); border:4px solid white;
      z-index:999; animation:pb-preview-pop .25s ease;
    }
    .pb-preview img{ width:100%; height:100%; object-fit:cover; }
    @keyframes pb-preview-pop{
      from{ opacity:0; transform:scale(.8) translateY(-10px); }
      to{ opacity:1; transform:scale(1) translateY(0); }
    }

    .pb-note{ text-align:center; font-size:13px; color:rgba(36,23,19,0.6); margin-top:14px; line-height:1.5; }

    /* ---------- Processing screen ---------- */
    .pb-processing{ text-align:center; padding:60px 20px; }
    .pb-processing h2{ font-size:28px; margin-bottom:40px; color:var(--ink); }
    .pb-progress{ width:100%; height:12px; background:#ddd; border-radius:999px; overflow:hidden; }
    .pb-progress-fill{ height:100%; background:#111; transition:width .08s linear; }
    .pb-processing p{ margin-top:18px; font-size:18px; font-weight:700; }

    /* ---------- Result screen (printer reveal) ---------- */
    .pb-printer-slot{
      width:min(100%, 320px); height:20px; margin:0 auto -2px;
      background:linear-gradient(180deg, #0a0a0a, #1e1e1e);
      border-radius:10px 10px 4px 4px; position:relative; z-index:5;
      box-shadow: inset 0 2px 6px rgba(0,0,0,.65), 0 3px 6px rgba(0,0,0,.3);
    }
    .pb-printer-slot::after{
      content:""; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
      width:6px; height:6px; border-radius:50%; background:#555;
    }
    .pb-printer-slot.printing::after{
      background:#6be675; box-shadow:0 0 6px 2px rgba(107,230,117,.7);
      animation:pb-printer-blink .6s ease-in-out infinite;
    }
    @keyframes pb-printer-blink{ 0%,100%{ opacity:1; } 50%{ opacity:.25; } }

    .pb-strip-preview{
      display:flex; justify-content:center; align-items:flex-start;
      overflow:hidden;
    }
    /* height is driven frame-by-frame from JS (see ResultScreen) for a
       constant "print speed" feel — no CSS transition here, it would
       just fight with the per-frame inline style updates. */

    .pb-strip-wrapper{ position:relative; display:flex; justify-content:center; }
    .pb-strip-wrapper.settled{ animation:pb-settle .35s ease-out; }
    @keyframes pb-settle{
      0%{ transform:translateY(-6px); }
      60%{ transform:translateY(3px); }
      100%{ transform:translateY(0); }
    }
    .pb-strip-wrapper::after{
      content:""; position:absolute; top:0; bottom:0; left:-45%; width:40%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
      transform:skewX(-18deg); opacity:0;
    }
    .pb-strip-wrapper.settled::after{ animation: pb-shine 1s ease forwards; }
    @keyframes pb-shine{
      from{ left:-50%; opacity:1; }
      to{ left:140%; opacity:0; }
    }

    .pb-strip-preview img{ max-width:320px; width:100%; border-radius:10px; box-shadow:0 12px 30px rgba(0,0,0,0.3); display:block; }

    .pb-video-preview{ text-align:center; }
    .pb-video-preview video, .pb-video-preview img{ max-width:320px; width:100%; border-radius:10px; box-shadow:0 12px 30px rgba(0,0,0,0.3); display:block; margin:0 auto; }

    .pb-row-buttons.pb-reveal{ opacity:0; transform:translateY(20px); transition:.4s; transition-delay:.15s; }
    .pb-row-buttons.pb-reveal.show{ opacity:1; transform:translateY(0); }
    .pb-download-btn.pb-reveal{ opacity:0; transform:translateY(20px); transition:.4s; transition-delay:.3s; }
    .pb-download-btn.pb-reveal.show{ opacity:1; transform:translateY(0); }

    @media (max-width:420px){
      .pb-panel{ padding:20px; }
      .pb-countdown{ font-size:90px; }
    }
    @media (max-width:380px){
      .pb-row-buttons{ flex-wrap:wrap; }
      .pb-row-buttons button{ flex:1 1 calc(50% - 6px); }
      .pb-scrapbook-grid, .pb-template-grid{ grid-template-columns:1fr 1fr; gap:8px; }
      .pb-marquee h1{ font-size:28px; letter-spacing:0.08em; }
      .pb-panel{ padding:16px; }
    }
    @media (min-width:900px){
      .pb-stage{ max-width:460px; }
    }
  `}</style>
);

function MarqueeTitle() {
  return (
    <div className="pb-marquee">
      <h1>Photo Booth Odoi</h1>
      <p>Senyum, jepret, langsung jadi</p>
    </div>
  );
}

function KioskToggle({ active, onToggle }) {
  return (
    <button
      type="button"
      className={`pb-kiosk-toggle${active ? " active" : ""}`}
      onClick={onToggle}
    >
      <span className="pb-kiosk-dot" />
      Mode Kios: {active ? "Aktif" : "Nonaktif"}
    </button>
  );
}

function GalleryScreen({ history, onDelete, onClearAll, onDownloadItem }) {
  const [selected, setSelected] = useState(null);

  if (history.length === 0) {
    return (
      <section>
        <p className="pb-gallery-empty">Belum ada riwayat foto. Yuk mulai sesi pertama!</p>
      </section>
    );
  }

  return (
    <section>
      <div className="pb-gallery-grid">
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            className="pb-gallery-thumb"
            onClick={() => setSelected(item)}
          >
            <img src={item.dataUrl} alt="Riwayat strip photo booth" />
          </button>
        ))}
      </div>

      <button className="pb-btn-secondary" style={{ width: "100%" }} onClick={onClearAll}>
        Hapus Semua Riwayat
      </button>

      {selected && (
        <div className="pb-gallery-modal" onClick={() => setSelected(null)}>
          <div className="pb-gallery-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pb-gallery-modal-close" onClick={() => setSelected(null)}>✕</button>
            <img src={selected.dataUrl} alt="Riwayat strip photo booth" />
            <div className="pb-row-buttons" style={{ marginTop: 12 }}>
              <button
                className="pb-btn-secondary"
                onClick={() => {
                  onDelete(selected.id);
                  setSelected(null);
                }}
              >
                Hapus
              </button>
              <button className="pb-btn-primary" onClick={() => onDownloadItem(selected)}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ResultScreen({ resultUrl, showStrip, onDownload, onShare, onRetake, onEditAgain, onPrintFinished, kioskCountdown, onCancelAutoReset }) {
  const imgRef = useRef(null);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [revealHeight, setRevealHeight] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [settled, setSettled] = useState(false);
  const rafRef = useRef(null);

  // Re-measure whenever a new strip comes in (different frame/theme can
  // change the rendered height), and reset so the reveal has somewhere
  // to animate from.
  useEffect(() => {
    setNaturalHeight(0);
    setRevealHeight(0);
    setSettled(false);
  }, [resultUrl]);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setNaturalHeight(imgRef.current.getBoundingClientRect().height);
    }
  };

  // Constant "print speed" rather than a fixed total duration — a longer
  // strip (4 photos) takes proportionally longer to emerge than a
  // shorter one (3 photos), just like a real printer feeding paper at a
  // steady rate. Eases out near the end so it settles instead of
  // stopping abruptly.
  useEffect(() => {
    if (!showStrip || naturalHeight === 0) return;

    const PRINT_SPEED = 340; // px per second
    const duration = Math.max(500, (naturalHeight / PRINT_SPEED) * 1000);
    const start = performance.now();

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    setPrinting(true);
    setSettled(false);

    function tick(now) {
      const elapsed = now - start;
      const rawT = Math.min(1, elapsed / duration);
      setRevealHeight(easeOutCubic(rawT) * naturalHeight);

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPrinting(false);
        setSettled(true);
        if (onPrintFinished) onPrintFinished();
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showStrip, naturalHeight]);

  return (
    <section>
      <div className={`pb-printer-slot${printing ? " printing" : ""}`} />

      <div className="pb-strip-preview" style={{ height: revealHeight }}>
        <div className={`pb-strip-wrapper${settled ? " settled" : ""}`}>
          <img
            ref={imgRef}
            src={resultUrl}
            alt="Hasil photo booth strip"
            onLoad={handleImageLoad}
          />
        </div>
      </div>

      <div className={`pb-row-buttons pb-reveal ${settled ? "show" : ""}`}>
        <button className="pb-btn-secondary" onClick={onRetake}>Ambil Ulang</button>
        <button className="pb-btn-secondary" onClick={onEditAgain}>Edit Lagi</button>
        <button className="pb-btn-secondary" onClick={onShare}>Bagikan</button>
      </div>

      <button
        className={`pb-btn-primary pb-download-btn pb-reveal ${settled ? "show" : ""}`}
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
    </section>
  );
}

function VideoResultScreen({ videoUrl, onDownload, onShare, onRetake }) {
  return (
    <section>
      <div className="pb-video-preview">
        <video src={videoUrl} controls playsInline />
      </div>
      <div className="pb-row-buttons">
        <button className="pb-btn-secondary" onClick={onRetake}>Ambil Ulang</button>
        <button className="pb-btn-secondary" onClick={onShare}>Bagikan</button>
      </div>
      <button className="pb-btn-primary" style={{ marginTop: 12 }} onClick={onDownload}>
        Download Video
      </button>
    </section>
  );
}

function GifResultScreen({ gifUrl, onDownload, onShare, onRetake }) {
  return (
    <section>
      <div className="pb-video-preview">
        <img src={gifUrl} alt="Hasil GIF photo booth" />
      </div>
      <div className="pb-row-buttons">
        <button className="pb-btn-secondary" onClick={onRetake}>Ambil Ulang</button>
        <button className="pb-btn-secondary" onClick={onShare}>Bagikan</button>
      </div>
      <button className="pb-btn-primary" style={{ marginTop: 12 }} onClick={onDownload}>
        Download GIF
      </button>
    </section>
  );
}

function flattenOverlays(baseCanvas, overlays) {
  const canvas = document.createElement("canvas");
  canvas.width = baseCanvas.width;
  canvas.height = baseCanvas.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(baseCanvas, 0, 0);

  overlays.forEach((o) => {
    const px = (o.xPct / 100) * canvas.width;
    const py = (o.yPct / 100) * canvas.height;
    const fontSize = (o.sizePct / 100) * canvas.width;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (o.type === "sticker") {
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillText(o.content, px, py);
    } else {
      ctx.font = `700 ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = o.color || "#241713";
      ctx.fillText(o.content, px, py);
    }
    ctx.restore();
  });

  return canvas;
}

const STICKER_OPTIONS = ["🎉", "💕", "⭐", "😎", "🎈", "✨", "🔥", "📸"];
const TEXT_COLOR_OPTIONS = ["#241713", "#E8A33D", "#C9707B", "#F5ECDD"];

function EditScreen({
  baseImageUrl,
  overlays,
  setOverlays,
  selectedOverlayId,
  setSelectedOverlayId,
  containerRef,
  containerWidth,
  textDraft,
  setTextDraft,
  textColor,
  setTextColor,
  onAddSticker,
  onAddText,
  onDeleteOverlay,
  onFinish,
}) {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function handlePointerDown(e, overlay) {
    e.stopPropagation();
    setSelectedOverlayId(overlay.id);
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startXPct = overlay.xPct;
    const startYPct = overlay.yPct;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    function onMove(ev) {
      const dxPct = ((ev.clientX - startClientX) / rect.width) * 100;
      const dyPct = ((ev.clientY - startClientY) / rect.height) * 100;
      setOverlays((prev) =>
        prev.map((o) =>
          o.id === overlay.id
            ? { ...o, xPct: clamp(startXPct + dxPct, 0, 100), yPct: clamp(startYPct + dyPct, 0, 100) }
            : o
        )
      );
    }
    function onUp() {
      target.releasePointerCapture(e.pointerId);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
    }
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
  }

  return (
    <section>
      <p className="pb-hint" style={{ marginBottom: 10 }}>
        Tambahin stiker atau teks, geser ke posisi yang lo mau.
      </p>

      <div className="pb-edit-canvas" ref={containerRef} onClick={() => setSelectedOverlayId(null)}>
        <img src={baseImageUrl} alt="Strip sebelum stiker" />
        {overlays.map((o) => {
          const fontSize = (o.sizePct / 100) * containerWidth;
          return (
            <div
              key={o.id}
              className={`pb-overlay${selectedOverlayId === o.id ? " selected" : ""}`}
              style={{
                left: `${o.xPct}%`,
                top: `${o.yPct}%`,
                fontSize: `${fontSize}px`,
                color: o.type === "text" ? o.color : undefined,
                fontWeight: o.type === "text" ? 700 : 400,
              }}
              onPointerDown={(e) => handlePointerDown(e, o)}
            >
              {o.content}
              {selectedOverlayId === o.id && (
                <button
                  type="button"
                  className="pb-overlay-delete"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteOverlay(o.id);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="pb-field" style={{ marginTop: 16 }}>
        <label>Stiker</label>
        <div className="pb-sticker-palette">
          {STICKER_OPTIONS.map((s) => (
            <button key={s} type="button" className="pb-sticker-btn" onClick={() => onAddSticker(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-field">
        <label>Tambah Teks</label>
        <div className="pb-text-row">
          <input
            type="text"
            placeholder="Tulis sesuatu..."
            maxLength={24}
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
          />
          <button type="button" className="pb-btn-secondary" style={{ flex: "0 0 auto" }} onClick={onAddText}>
            Tambah
          </button>
        </div>
        <div className="pb-color-dots">
          {TEXT_COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              className={`pb-color-dot${textColor === c ? " selected" : ""}`}
              style={{ background: c }}
              onClick={() => setTextColor(c)}
            />
          ))}
        </div>
      </div>

      <button className="pb-btn-primary" onClick={onFinish}>
        Lanjut ke Hasil
      </button>
    </section>
  );
}

export default function PhotoBooth() {
  const [screen, setScreen] = useState("intro");
  const [captureMode, setCaptureMode] = useState("photo");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(0);
  const [resultVideoUrl, setResultVideoUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const resultVideoBlobRef = useRef(null);

  const [resultGifUrl, setResultGifUrl] = useState(null);
  const resultGifBlobRef = useRef(null);

  const [processingLabel, setProcessingLabel] = useState("Developing Your Photos...");
  const [caption, setCaption] = useState("");
  const [theme, setTheme] = useState("noir");
  const [filter, setFilter] = useState("normal");
  const [shotCount, setShotCount] = useState(3);
  const [frame, setFrame] = useState("film");
  const [frameStyle, setFrameStyle] = useState("simple");
  const [scrapbookThemeId, setScrapbookThemeId] = useState(Object.keys(STICKER_THEMES)[0]);
  const [processing, setProcessing] = useState(0);
  const [showStrip, setShowStrip] = useState(false);

  // FIXED: was declared as `previewShots` / `setPreviewShots` (plural, array)
  // but every call site below (setPreviewShot / previewShot prop) used the
  // singular name, which was never defined — that threw a ReferenceError as
  // soon as a session started. This only ever needs to hold one shot at a time.
  const [previewShot, setPreviewShot] = useState(null);

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [shotIndex, setShotIndex] = useState(0);
  const [countdownValue, setCountdownValue] = useState(null);
  const [flashing, setFlashing] = useState(false);
  const [shutter, setShutter] = useState(false);
  const [focusLock, setFocusLock] = useState(false);

  const [note, setNote] = useState("Bersiap...");
  const [resultUrl, setResultUrl] = useState(null);

  const [kioskMode, setKioskMode] = useState(false);
  const [kioskCountdown, setKioskCountdown] = useState(null);
  const kioskTimeoutRef = useRef(null);
  const kioskIntervalRef = useRef(null);

  const [history, setHistory] = useState(() => loadHistory());

  const [overlays, setOverlays] = useState([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState(null);
  const [textDraft, setTextDraft] = useState("");
  const [textColor, setTextColor] = useState("#241713");
  const [editContainerWidth, setEditContainerWidth] = useState(320);
  const baseCanvasRef = useRef(null);
  const editContainerRef = useRef(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const shotsRef = useRef([]);
  const finalCanvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (resultVideoUrl) URL.revokeObjectURL(resultVideoUrl);
    };
  }, [resultVideoUrl]);

  useEffect(() => {
    return () => {
      if (resultGifUrl) URL.revokeObjectURL(resultGifUrl);
    };
  }, [resultGifUrl]);

  useEffect(() => {
    if (screen !== "edit") return;
    const el = editContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setEditContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [screen]);

  const toggleKioskMode = useCallback(() => {
    setKioskMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.requestFullscreen?.().catch(() => { /* ignored: fullscreen may be blocked by the browser */ });
      } else if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => { /* ignored */ });
      }
      return next;
    });
  }, []);

  const cancelAutoReset = useCallback(() => {
    clearInterval(kioskIntervalRef.current);
    clearTimeout(kioskTimeoutRef.current);
    setKioskCountdown(null);
  }, []);

  // When kiosk mode is on and we land on the result screen, count down and
  // automatically go back to the intro screen so the next guest can jump
  // straight in without anyone needing to touch the laptop.
  useEffect(() => {
    if (!kioskMode || screen !== "result") {
      setKioskCountdown(null);
      return;
    }
    const IDLE_SECONDS = 20;
    setKioskCountdown(IDLE_SECONDS);

    kioskIntervalRef.current = setInterval(() => {
      setKioskCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    kioskTimeoutRef.current = setTimeout(() => {
      resetToIntro();
    }, IDLE_SECONDS * 1000);

    return () => {
      clearInterval(kioskIntervalRef.current);
      clearTimeout(kioskTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kioskMode, screen, resultUrl]);

  const startPhotoSession = useCallback(async () => {
    setError("");
    setStarting(true);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
    } catch (err) {
      setStarting(false);
      setError("Tidak bisa mengakses kamera. Pastikan kamu mengizinkan akses kamera di browser. Kalau masih gagal, coba buka file ini langsung di browser (bukan lewat preview).");
      return;
    }
    setStarting(false);
    streamRef.current = stream;

    // The <video> element only exists once we're on the session screen —
    // switch first, then wait for the ref to actually attach to it.
    setScreen("session");
    let attempts = 0;
    while (!videoRef.current && attempts < 50) {
      await sleep(50);
      attempts++;
    }

    if (!videoRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Terjadi kesalahan saat menyiapkan tampilan kamera. Coba lagi ya.");
      setScreen("intro");
      return;
    }

    videoRef.current.srcObject = stream;
    try { await videoRef.current.play(); } catch (e) { /* some browsers auto-play already */ }
    const ready = await waitForVideoReady(videoRef.current);
    if (!ready) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Kamera nyala tapi videonya nggak muncul-muncul. Coba tutup aplikasi lain yang mungkin lagi pakai kamera, lalu coba lagi.");
      setScreen("intro");
      return;
    }

    shotsRef.current = [];
    setNote("Bersiap...");

    for (let i = 1; i <= shotCount; i++) {
      setShotIndex(i);

      for (const n of [3, 2, 1]) {
        setCountdownValue(n);
        if (n !== 1) {
          playSound("beep", 0.2);
        }
        await sleep(1000);
      }
      setCountdownValue(null);

      setFocusLock(true);
      await sleep(300);

      setShutter(true);
      playSound("shutter", 0.9);
      setFlashing(true);
      await sleep(80);

      const photoCanvas = captureFrame(videoRef.current, 480, 360, FILTERS[filter].css);

      // FIXED: this was calling `setPreviewShot` on an undeclared `previewShot`
      // state — now matches the `previewShot` state declared above.
      setPreviewShot(photoCanvas.toDataURL());

      await sleep(3000);

      setPreviewShot(null);
      setTimeout(() => setFlashing(false), 300);
      setShutter(false);
      setFocusLock(false);

      shotsRef.current.push(photoCanvas);

      // REMOVED: there used to be a second `setFlashing(true)` +
      // `setTimeout(() => setFlashing(false), 380)` right here. It fired
      // ~3 seconds after the real shutter flash above (leftover from before
      // the preview-shot feature existed) and made the screen flash twice
      // per photo. The one real flash is already handled above.

      setNote(i < shotCount ? "Siap-siap foto berikutnya..." : "Selesai! Menyusun strip...");
      if (i < shotCount) await sleep(1000);
    }

    stream.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setShowStrip(false);
    setProcessing(10);
    setProcessingLabel("Developing Your Photos...");
    setScreen("processing");
    playSound("printer", 0.5);

    await sleep(120);

    let canvas;
    if (frameStyle === "scrapbook") {
      // Loading the sticker PNGs is genuinely async and can take a
      // noticeable moment, during which the progress bar would otherwise
      // just sit still at 10% and then jump straight to 90% — looks like
      // it froze. This fakes a steady climb while we wait.
      setProcessing(20);
      let simulated = 20;
      const simInterval = setInterval(() => {
        simulated = Math.min(80, simulated + 5);
        setProcessing(simulated);
      }, 150);

      try {
        canvas = await composeScrapbookStrip({
          shots: shotsRef.current,
          theme: STICKER_THEMES[scrapbookThemeId],
          shotCount,
          caption,
        });
      } finally {
        clearInterval(simInterval);
      }
    } else {
      canvas = composeStrip({
        shots: shotsRef.current,
        frame: FRAMES[frame],
        theme: THEMES[theme],
        shotCount,
        caption,
      });
    }

    setProcessing(90);
    await sleep(180);
    setProcessing(100);
    await sleep(800);

    baseCanvasRef.current = canvas;
    setOverlays([]);
    setSelectedOverlayId(null);
    setScreen("edit");
  }, [shotCount, filter, theme, caption, frame, frameStyle, scrapbookThemeId]);

  const startVideoSession = useCallback(async () => {
    if (typeof MediaRecorder === "undefined") {
      setError("Browser ini nggak mendukung perekaman video.");
      return;
    }

    setError("");
    setStarting(true);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: true,
      });
    } catch (err) {
      setStarting(false);
      setError("Tidak bisa mengakses kamera/mikrofon. Pastikan browser mengizinkan akses keduanya.");
      return;
    }
    setStarting(false);
    streamRef.current = stream;

    setScreen("session");
    let attempts = 0;
    while (!videoRef.current && attempts < 50) {
      await sleep(50);
      attempts++;
    }
    if (!videoRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Terjadi kesalahan saat menyiapkan tampilan kamera. Coba lagi ya.");
      setScreen("intro");
      return;
    }

    videoRef.current.srcObject = stream;
    try { await videoRef.current.play(); } catch (e) { /* some browsers auto-play already */ }
    const ready = await waitForVideoReady(videoRef.current);
    if (!ready) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Kamera nyala tapi videonya nggak muncul-muncul. Coba lagi.");
      setScreen("intro");
      return;
    }

    setShotIndex(1);
    setNote("Bersiap...");
    for (const n of [3, 2, 1]) {
      setCountdownValue(n);
      playSound("beep", 0.2);
      await sleep(1000);
    }
    setCountdownValue(null);

    const VIDEO_DURATION_SECONDS = 5;
    const mimeCandidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    const mimeType = mimeCandidates.find(
      (type) => typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(type)
    ) || "";

    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    const stopped = new Promise((resolve) => {
      recorder.onstop = resolve;
    });

    recorder.start();
    setIsRecordingVideo(true);
    setRecordSecondsLeft(VIDEO_DURATION_SECONDS);
    setNote("Sedang merekam...");

    const tickInterval = setInterval(() => {
      setRecordSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    await sleep(VIDEO_DURATION_SECONDS * 1000);
    clearInterval(tickInterval);

    recorder.stop();
    await stopped;
    setIsRecordingVideo(false);

    stream.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    const blob = new Blob(recordedChunksRef.current, { type: mimeType || "video/webm" });
    resultVideoBlobRef.current = blob;
    setResultVideoUrl(URL.createObjectURL(blob));
    setScreen("videoResult");
  }, []);

  const startGifSession = useCallback(async () => {
    setError("");
    setStarting(true);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
    } catch (err) {
      setStarting(false);
      setError("Tidak bisa mengakses kamera. Pastikan browser mengizinkan akses kamera.");
      return;
    }
    setStarting(false);
    streamRef.current = stream;

    setScreen("session");
    let attempts = 0;
    while (!videoRef.current && attempts < 50) {
      await sleep(50);
      attempts++;
    }
    if (!videoRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Terjadi kesalahan saat menyiapkan tampilan kamera. Coba lagi ya.");
      setScreen("intro");
      return;
    }

    videoRef.current.srcObject = stream;
    try { await videoRef.current.play(); } catch (e) { /* some browsers auto-play already */ }
    const ready = await waitForVideoReady(videoRef.current);
    if (!ready) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Kamera nyala tapi videonya nggak muncul-muncul. Coba lagi.");
      setScreen("intro");
      return;
    }

    setShotIndex(1);
    setNote("Bersiap...");
    for (const n of [3, 2, 1]) {
      setCountdownValue(n);
      playSound("beep", 0.2);
      await sleep(1000);
    }
    setCountdownValue(null);

    const FRAME_COUNT = 14;
    const FRAME_INTERVAL_MS = 120;
    const GIF_W = 320, GIF_H = 240;

    const frames = [];
    setIsRecordingVideo(true);
    setRecordSecondsLeft(Math.ceil((FRAME_COUNT * FRAME_INTERVAL_MS) / 1000));

    const tickInterval = setInterval(() => {
      setRecordSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    for (let i = 0; i < FRAME_COUNT; i++) {
      frames.push(captureFrame(videoRef.current, GIF_W, GIF_H, FILTERS[filter].css));
      await sleep(FRAME_INTERVAL_MS);
    }
    clearInterval(tickInterval);
    setIsRecordingVideo(false);

    stream.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setProcessingLabel("Merangkai GIF...");
    setProcessing(5);
    setScreen("processing");

    try {
      const blob = await encodeGif(frames, {
        width: GIF_W,
        height: GIF_H,
        delay: FRAME_INTERVAL_MS,
        onProgress: (pct) => setProcessing(Math.max(5, pct)),
      });
      resultGifBlobRef.current = blob;
      setResultGifUrl(URL.createObjectURL(blob));
      setScreen("gifResult");
    } catch (e) {
      setError("Gagal bikin GIF-nya, coba lagi ya.");
      setScreen("intro");
    } finally {
      setProcessingLabel("Developing Your Photos...");
      setProcessing(0);
    }
  }, [filter]);

  const startBoomerangSession = useCallback(async () => {
    setError("");
    setStarting(true);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
    } catch (err) {
      setStarting(false);
      setError("Tidak bisa mengakses kamera. Pastikan browser mengizinkan akses kamera.");
      return;
    }
    setStarting(false);
    streamRef.current = stream;

    setScreen("session");
    let attempts = 0;
    while (!videoRef.current && attempts < 50) {
      await sleep(50);
      attempts++;
    }
    if (!videoRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Terjadi kesalahan saat menyiapkan tampilan kamera. Coba lagi ya.");
      setScreen("intro");
      return;
    }

    videoRef.current.srcObject = stream;
    try { await videoRef.current.play(); } catch (e) { /* some browsers auto-play already */ }
    const ready = await waitForVideoReady(videoRef.current);
    if (!ready) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setError("Kamera nyala tapi videonya nggak muncul-muncul. Coba lagi.");
      setScreen("intro");
      return;
    }

    setShotIndex(1);
    setNote("Bersiap...");
    for (const n of [3, 2, 1]) {
      setCountdownValue(n);
      playSound("beep", 0.2);
      await sleep(1000);
    }
    setCountdownValue(null);

    const FRAME_COUNT = 12;
    const FRAME_INTERVAL_MS = 100;
    const GIF_W = 320, GIF_H = 240;

    const frames = [];
    setIsRecordingVideo(true);
    setRecordSecondsLeft(Math.ceil((FRAME_COUNT * FRAME_INTERVAL_MS) / 1000));

    const tickInterval = setInterval(() => {
      setRecordSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    for (let i = 0; i < FRAME_COUNT; i++) {
      frames.push(captureFrame(videoRef.current, GIF_W, GIF_H, FILTERS[filter].css));
      await sleep(FRAME_INTERVAL_MS);
    }
    clearInterval(tickInterval);
    setIsRecordingVideo(false);

    stream.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setProcessingLabel("Merangkai Boomerang...");
    setProcessing(5);
    setScreen("processing");

    try {
      // forward frames, then reversed (minus both ends so the first/last
      // frame don't hold for a double-length beat when the loop repeats)
      const reversed = [...frames].reverse().slice(1, -1);
      const bounced = [...frames, ...reversed];

      const blob = await encodeGif(bounced, {
        width: GIF_W,
        height: GIF_H,
        delay: FRAME_INTERVAL_MS,
        onProgress: (pct) => setProcessing(Math.max(5, pct)),
      });
      resultGifBlobRef.current = blob;
      setResultGifUrl(URL.createObjectURL(blob));
      setScreen("gifResult");
    } catch (e) {
      setError("Gagal bikin Boomerang-nya, coba lagi ya.");
      setScreen("intro");
    } finally {
      setProcessingLabel("Developing Your Photos...");
      setProcessing(0);
    }
  }, [filter]);

  const handleStart = useCallback(() => {
    if (captureMode === "video") {
      startVideoSession();
    } else if (captureMode === "gif") {
      startGifSession();
    } else if (captureMode === "boomerang") {
      startBoomerangSession();
    } else {
      startPhotoSession();
    }
  }, [captureMode, startVideoSession, startGifSession, startBoomerangSession, startPhotoSession]);

  const addSticker = useCallback((emoji) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setOverlays((prev) => [...prev, { id, type: "sticker", content: emoji, xPct: 50, yPct: 50, sizePct: 12 }]);
    setSelectedOverlayId(id);
  }, []);

  const addText = useCallback(() => {
    if (!textDraft.trim()) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setOverlays((prev) => [
      ...prev,
      { id, type: "text", content: textDraft.trim(), xPct: 50, yPct: 50, sizePct: 8, color: textColor },
    ]);
    setSelectedOverlayId(id);
    setTextDraft("");
  }, [textDraft, textColor]);

  const deleteOverlay = useCallback((id) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    setSelectedOverlayId(null);
  }, []);

  const finishEditing = useCallback(() => {
    if (!baseCanvasRef.current) return;
    const finalCanvas = flattenOverlays(baseCanvasRef.current, overlays);
    finalCanvasRef.current = finalCanvas;
    const dataUrl = finalCanvas.toDataURL("image/png");
    setResultUrl(dataUrl);
    setHistory(saveToHistory(dataUrl));
    setShowStrip(false);
    setScreen("result");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShowStrip(true);
      });
    });
  }, [overlays]);

  const handlePrintFinished = useCallback(() => {
    stopSound("printer");
  }, []);

  const downloadStrip = useCallback(() => {
    if (!finalCanvasRef.current) return;
    const link = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `photobooth-strip-${ts}.png`;
    link.href = finalCanvasRef.current.toDataURL("image/png");
    link.click();
  }, []);

  const downloadHistoryItem = useCallback((item) => {
    const link = document.createElement("a");
    const ts = new Date(item.timestamp).toISOString().replace(/[:.]/g, "-");
    link.download = `photobooth-strip-${ts}.png`;
    link.href = item.dataUrl;
    link.click();
  }, []);

  const downloadVideo = useCallback(() => {
    if (!resultVideoUrl) return;
    const link = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `photobooth-video-${ts}.webm`;
    link.href = resultVideoUrl;
    link.click();
  }, [resultVideoUrl]);

  const shareVideo = useCallback(async () => {
    if (!resultVideoBlobRef.current) return;
    try {
      const file = new File([resultVideoBlobRef.current], "photobooth-video.webm", {
        type: resultVideoBlobRef.current.type || "video/webm",
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Photo Booth Video" });
        return;
      }
    } catch (e) { /* fall through to download fallback */ }
    downloadVideo();
    alert("Fitur bagikan langsung belum didukung browser ini — video sudah didownload, silakan bagikan manual ya.");
  }, [downloadVideo]);

  const downloadGif = useCallback(() => {
    if (!resultGifUrl) return;
    const link = document.createElement("a");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `photobooth-gif-${ts}.gif`;
    link.href = resultGifUrl;
    link.click();
  }, [resultGifUrl]);

  const shareGif = useCallback(async () => {
    if (!resultGifBlobRef.current) return;
    try {
      const file = new File([resultGifBlobRef.current], "photobooth.gif", { type: "image/gif" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Photo Booth GIF" });
        return;
      }
    } catch (e) { /* fall through to download fallback */ }
    downloadGif();
    alert("Fitur bagikan langsung belum didukung browser ini — GIF sudah didownload, silakan bagikan manual ya.");
  }, [downloadGif]);

  const handleDeleteHistoryItem = useCallback((id) => {
    setHistory(deleteFromHistory(id));
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm("Hapus semua riwayat foto? Ini nggak bisa dibatalin.")) {
      setHistory(clearHistory());
    }
  }, []);

  const shareStrip = useCallback(async () => {
    if (!finalCanvasRef.current) return;
    try {
      const blob = await new Promise((resolve) => finalCanvasRef.current.toBlob(resolve, "image/png"));
      const file = new File([blob], "photobooth-strip.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Photo Booth", text: caption || "Photo Booth" });
        return;
      }
    } catch (e) { /* fall through to download fallback */ }
    downloadStrip();
    alert("Fitur bagikan langsung belum didukung browser ini — strip sudah didownload, silakan bagikan manual ya.");
  }, [caption, downloadStrip]);

  const resetToIntro = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) { /* ignore */ }
    }
    shotsRef.current = [];
    finalCanvasRef.current = null;
    baseCanvasRef.current = null;
    setOverlays([]);
    setSelectedOverlayId(null);
    setResultUrl(null);
    setResultVideoUrl(null);
    resultVideoBlobRef.current = null;
    setIsRecordingVideo(false);
    setRecordSecondsLeft(0);
    setResultGifUrl(null);
    resultGifBlobRef.current = null;
    setProcessingLabel("Developing Your Photos...");
    setShowStrip(false);
    setShotIndex(0);
    setProcessing(0);
    setScreen("intro");
  }, []);

  return (
    <div className="pb-root">
      <GlobalStyle />
      <div className="pb-stage">
        <MarqueeTitle />
        <div className="pb-header-actions">
          <KioskToggle active={kioskMode} onToggle={toggleKioskMode} />
          {(screen === "intro" || screen === "result" || screen === "videoResult" || screen === "gifResult" || screen === "gallery") && (
            <button
              type="button"
              className="pb-gallery-nav"
              onClick={() => setScreen(screen === "gallery" ? "intro" : "gallery")}
            >
              {screen === "gallery" ? "← Kembali" : `Galeri (${history.length})`}
            </button>
          )}
        </div>
        <div className="pb-panel">
          {screen === "intro" && (
            <IntroScreen
              captureMode={captureMode}
              setCaptureMode={setCaptureMode}
              caption={caption}
              setCaption={setCaption}
              theme={theme}
              setTheme={setTheme}
              filter={filter}
              setFilter={setFilter}
              shotCount={shotCount}
              setShotCount={setShotCount}
              frame={frame}
              setFrame={setFrame}
              frameStyle={frameStyle}
              setFrameStyle={setFrameStyle}
              scrapbookThemeId={scrapbookThemeId}
              stickerThemes={STICKER_THEMES}
              onOpenFrameSelect={() => setScreen("frameSelect")}
              themes={THEMES}
              filters={FILTERS}
              frames={FRAMES}
              countOptions={LAYOUTS}
              onStart={handleStart}
              starting={starting}
              error={error}
            />
          )}

          {screen === "frameSelect" && (
            <FrameSelectScreen
              themes={STICKER_THEMES}
              selectedId={scrapbookThemeId}
              onSelect={(id) => {
                setScrapbookThemeId(id);
                setScreen("intro");
              }}
              onBack={() => setScreen("intro")}
            />
          )}

          {screen === "session" && (
            <CameraView
              videoRef={videoRef}
              filterCss={FILTERS[filter].css}
              shotIndex={shotIndex}
              shotCount={shotCount}
              countdownValue={countdownValue}
              flashing={flashing}
              shutter={shutter}
              focusLock={focusLock}
              note={note}
              previewShot={previewShot}
              mode={captureMode}
              recordSecondsLeft={isRecordingVideo ? recordSecondsLeft : null}
            />
          )}

          {screen === "processing" && (
            <section className="pb-processing">
              <h2>{processingLabel}</h2>
              <div className="pb-progress">
                <div className="pb-progress-fill" style={{ width: `${processing}%` }} />
              </div>
              <p>{processing}%</p>
            </section>
          )}

          {screen === "edit" && baseCanvasRef.current && (
            <EditScreen
              baseImageUrl={baseCanvasRef.current.toDataURL("image/png")}
              overlays={overlays}
              setOverlays={setOverlays}
              selectedOverlayId={selectedOverlayId}
              setSelectedOverlayId={setSelectedOverlayId}
              containerRef={editContainerRef}
              containerWidth={editContainerWidth}
              textDraft={textDraft}
              setTextDraft={setTextDraft}
              textColor={textColor}
              setTextColor={setTextColor}
              onAddSticker={addSticker}
              onAddText={addText}
              onDeleteOverlay={deleteOverlay}
              onFinish={finishEditing}
            />
          )}

          {screen === "result" && (
            <ResultScreen
              resultUrl={resultUrl}
              showStrip={showStrip}
              onDownload={downloadStrip}
              onShare={shareStrip}
              onRetake={resetToIntro}
              onEditAgain={() => setScreen("edit")}
              onPrintFinished={handlePrintFinished}
              kioskCountdown={kioskCountdown}
              onCancelAutoReset={cancelAutoReset}
            />
          )}

          {screen === "videoResult" && (
            <VideoResultScreen
              videoUrl={resultVideoUrl}
              onDownload={downloadVideo}
              onShare={shareVideo}
              onRetake={resetToIntro}
            />
          )}

          {screen === "gifResult" && (
            <GifResultScreen
              gifUrl={resultGifUrl}
              onDownload={downloadGif}
              onShare={shareGif}
              onRetake={resetToIntro}
            />
          )}

          {screen === "gallery" && (
            <GalleryScreen
              history={history}
              onDelete={handleDeleteHistoryItem}
              onClearAll={handleClearHistory}
              onDownloadItem={downloadHistoryItem}
            />
          )}
        </div>
      </div>
    </div>
  );
}
