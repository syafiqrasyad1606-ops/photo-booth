import heartClipPath from "../utils/heartClipPath";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function photoPath(ctx, theme, x, y, w, h) {
  if (theme.photoShape === "heart") {
    heartClipPath(ctx, x, y, w, h);
  } else {
    roundedRectPath(ctx, x, y, w, h, 14);
  }
}

// FIXED: photos used to be stretched directly onto the destination
// rectangle (source drawn 0,0,photo.width,photo.height straight onto
// PHOTO_W x PHOTO_H), so any mismatch between the captured photo's
// aspect ratio and the photo slot's aspect ratio squished the image.
// This computes a "cover fit" crop instead — same aspect ratio is kept,
// the photo is just center-cropped to fill the slot, no distortion.
function coverFitCrop(srcW, srcH, destW, destH) {
  const srcAspect = srcW / srcH;
  const destAspect = destW / destH;
  let sx, sy, sw, sh;
  if (srcAspect > destAspect) {
    sh = srcH;
    sw = sh * destAspect;
    sx = (srcW - sw) / 2;
    sy = 0;
  } else {
    sw = srcW;
    sh = sw / destAspect;
    sx = 0;
    sy = (srcH - sh) / 2;
  }
  return { sx, sy, sw, sh };
}

export default async function composeScrapbookStrip({ shots, theme, shotCount, caption }) {
  // Scrapbook themes get a wider margin than the plain canvas frames —
  // there needs to be room for (now bigger) stickers without crowding
  // the photos or getting clipped at the strip's outer edge.
  const PAD = 190;
  const GAP = 18;
  const PHOTO_W = 900;
  const PHOTO_H = 675;
  const FOOTER_H = 160;

  const STRIP_W = PHOTO_W + PAD * 2;
  const photoStackH = PHOTO_H * shotCount + GAP * (shotCount - 1);
  const STRIP_H = PAD + photoStackH + FOOTER_H + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = STRIP_W;
  canvas.height = STRIP_H;
  const ctx = canvas.getContext("2d");

  // matting background
  roundedRectPath(ctx, 0, 0, STRIP_W, STRIP_H, 26);
  ctx.fillStyle = theme.bg;
  ctx.fill();

  const textColor = theme.textColor || "#4A2E2A";
  const strokeColor = theme.textColor === "#FFFFFF" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.15)";

  // photos — clean shape, cover-fit cropped so nothing looks squished
  shots.forEach((photo, i) => {
    const x = PAD;
    const y = PAD + i * (PHOTO_H + GAP);
    const { sx, sy, sw, sh } = coverFitCrop(photo.width, photo.height, PHOTO_W, PHOTO_H);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 5;
    photoPath(ctx, theme, x, y, PHOTO_W, PHOTO_H);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();

    ctx.save();
    photoPath(ctx, theme, x, y, PHOTO_W, PHOTO_H);
    ctx.clip();
    ctx.drawImage(photo, sx, sy, sw, sh, x, y, PHOTO_W, PHOTO_H);
    ctx.restore();

    ctx.save();
    photoPath(ctx, theme, x, y, PHOTO_W, PHOTO_H);
    ctx.lineWidth = 3;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.restore();
  });

  // footer: badge text + optional caption + small watermark
  const footerY = PAD + photoStackH;
  ctx.textAlign = "center";
  ctx.fillStyle = textColor;
  ctx.font = "700 34px 'Comic Sans MS', cursive, sans-serif";
  ctx.fillText((theme.badgeText || "").toUpperCase(), STRIP_W / 2, footerY + 55);

  if (caption) {
    ctx.font = "italic 22px Georgia, serif";
    ctx.globalAlpha = 0.85;
    ctx.fillText(caption, STRIP_W / 2, footerY + 95);
    ctx.globalAlpha = 1;
  }

  ctx.font = "600 14px sans-serif";
  ctx.globalAlpha = 0.5;
  ctx.fillText("photobooth", STRIP_W / 2, STRIP_H - 20);
  ctx.globalAlpha = 1;

  // stickers — loaded then drawn, positioned only within the margins
  // (left/right edges alongside the photo stack, or the bottom margin)
  const stickers = theme.stickers || [];
  const loadedImages = await Promise.all(stickers.map((s) => loadImage(s.src)));

  stickers.forEach((s, i) => {
    const img = loadedImages[i];
    let cx, cy;

    if (s.edge === "left") {
      cx = PAD / 2;
      cy = PAD + s.along * photoStackH;
    } else if (s.edge === "right") {
      cx = STRIP_W - PAD / 2;
      cy = PAD + s.along * photoStackH;
    } else if (s.edge === "top") {
      cx = PAD + s.along * PHOTO_W;
      cy = PAD / 2;
    } else {
      // bottom
      cx = PAD + s.along * PHOTO_W;
      cy = footerY + FOOTER_H * 0.25;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((s.rotation || 0) * Math.PI) / 180);
    ctx.drawImage(img, -s.size / 2, -s.size / 2, s.size, s.size);
    ctx.restore();
  });

  return canvas;
}