// services/composeStrip.js
export default function composeStrip({
  shots,
  frame,
  caption,
  shotCount,
  isGif = false,
  isBoomerang = false,
  stickers = [],
  texts = [],
}) {

  const actualShotCount = shots.length || shotCount || 3;
  
  //----------------------------------
  // Layout
  //----------------------------------

  const PHOTO_W = 900;
  const PHOTO_H = 675;

  const PADDING = 100;
  const GAP = 30;
  const FOOTER = 170;

  const WIDTH = PHOTO_W + PADDING * 2;

  const HEIGHT =
    PADDING +
    actualShotCount * PHOTO_H +
    (actualShotCount - 1) * GAP +
    FOOTER;

  //----------------------------------
  // Canvas
  //----------------------------------

  const canvas = document.createElement("canvas");

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext("2d");

  //----------------------------------
  // Background
  //----------------------------------

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  //----------------------------------
  // Draw helper (cover)
  //----------------------------------

  function drawCover(img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;

    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (imgRatio > boxRatio) {
      sw = img.height * boxRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / boxRatio;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      x,
      y,
      w,
      h
    );
  }

  //----------------------------------
  // Draw Props Helper
  //----------------------------------

  function drawProps(ctx, width, height) {
    // Draw stickers
    stickers.forEach((s) => {
      const x = (s.x / 100) * width;
      const y = (s.y / 100) * height;
      const w = (s.width / 100) * width;
      const h = (s.height / 100) * height;
      
      ctx.save();
      ctx.globalAlpha = s.opacity || 1;
      ctx.translate(x + w/2, y + h/2);
      ctx.rotate((s.rotation || 0) * Math.PI / 180);
      
      ctx.font = `${w}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.emoji || '⭐', 0, 0);
      
      ctx.restore();
    });

    // Draw texts
    texts.forEach((t) => {
      const x = (t.x / 100) * width;
      const y = (t.y / 100) * height;
      const size = (t.fontSize / 100) * Math.min(width, height);
      
      ctx.save();
      ctx.globalAlpha = t.opacity || 1;
      ctx.translate(x, y);
      ctx.rotate((t.rotation || 0) * Math.PI / 180);
      
      ctx.fillStyle = t.color || '#fff';
      ctx.font = `bold ${size}px ${t.font || 'Arial'}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(t.text || '', 0, 0);
      ctx.restore();
    });
  }

  //----------------------------------
  // Photos
  //----------------------------------

  for (let i = 0; i < Math.min(shots.length, actualShotCount); i++) {
    const x = PADDING;
    const y = PADDING + i * (PHOTO_H + GAP);

    //----------------------------------
    // Shadow
    //----------------------------------

    ctx.save();

    ctx.shadowColor = "rgba(0,0,0,.18)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;

    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, PHOTO_W, PHOTO_H);

    ctx.restore();

    //----------------------------------
    // Photo
    //----------------------------------

    drawCover(
      shots[i],
      x,
      y,
      PHOTO_W,
      PHOTO_H
    );

    //----------------------------------
    // Theme Frame
    //----------------------------------

    if (frame?.draw) {
      frame.draw(
        ctx,
        x,
        y,
        PHOTO_W,
        PHOTO_H
      );
    }

    //----------------------------------
    // Props (stickers & text) per frame
    //----------------------------------
    drawProps(ctx, PHOTO_W, PHOTO_H);
  }

  //----------------------------------
  // Footer
  //----------------------------------

  const footerY =
    PADDING +
    actualShotCount * PHOTO_H +
    (actualShotCount - 1) * GAP;

  ctx.strokeStyle = "rgba(0,0,0,.15)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(80, footerY + 20);
  ctx.lineTo(WIDTH - 80, footerY + 20);
  ctx.stroke();

  ctx.fillStyle = "#333";
  ctx.textAlign = "center";

  ctx.font = "bold 42px Arial";

  let displayCaption = (caption || "PHOTO BOOTH").toUpperCase();
  if (isGif) displayCaption = "✨ GIF BOOTH ✨";
  if (isBoomerang) displayCaption = "🔄 BOOMERANG 🔄";
  
  ctx.fillText(
    displayCaption,
    WIDTH / 2,
    footerY + 90
  );

  const now = new Date();

  ctx.font = "20px Arial";

  ctx.fillStyle = "#666";

  ctx.fillText(
    now.toLocaleDateString("id-ID"),
    WIDTH / 2,
    footerY + 125
  );

  return canvas;
}