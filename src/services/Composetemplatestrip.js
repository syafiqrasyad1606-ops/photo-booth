// Draws a full-strip PNG template as the background, then places each
// captured photo on top, clipped into its slot rectangle. This works
// whether or not the template PNG has real alpha transparency in the
// slot areas — since the photo is drawn *after* the template and only
// inside the slot's bounds, it naturally covers whatever placeholder
// box color sits there.
//
// Trade-off: any decorative element in the template that's meant to
// overlap slightly onto the photo (like a mascot's hand reaching over
// the edge) will get covered wherever it falls inside the slot
// rectangle, since there's no real cutout to draw around. Minor visual
// cost, but it means calibration doesn't depend on the source file
// having transparency.

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

export default async function composeTemplateStrip({ shots, template }) {
  const canvas = document.createElement("canvas");
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext("2d");

  const templateImg = (template.image);

  // 1) template as the full background
  ctx.drawImage(templateImg, 0, 0, template.width, template.height);

  // 2) each captured photo — with a soft shadow, rounded corners, and a
  // thin edge line so it reads as "sitting inside" the frame instead of
  // a flat rectangle pasted on top.
  template.slots.forEach((slot, i) => {
    const photo = shots[i];
    if (!photo) return;

    const radius = slot.radius ?? Math.min(slot.w, slot.h) * 0.05;

    // soft drop shadow, cast onto the template just outside the slot
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = Math.min(slot.w, slot.h) * 0.06;
    ctx.shadowOffsetY = Math.min(slot.w, slot.h) * 0.02;
    ctx.fillStyle = "#000";
    roundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, radius);
    ctx.fill();
    ctx.restore();

    // cover-fit the photo into the slot, clipped to rounded corners
    const srcW = photo.width, srcH = photo.height;
    const slotAspect = slot.w / slot.h;
    const srcAspect = srcW / srcH;

    let sx, sy, sw, sh;
    if (srcAspect > slotAspect) {
      sh = srcH;
      sw = sh * slotAspect;
      sx = (srcW - sw) / 2;
      sy = 0;
    } else {
      sw = srcW;
      sh = sw / slotAspect;
      sx = 0;
      sy = (srcH - sh) / 2;
    }

    ctx.save();
    roundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, radius);
    ctx.clip();
    ctx.drawImage(photo, sx, sy, sw, sh, slot.x, slot.y, slot.w, slot.h);
    ctx.restore();

    // thin edge line so the photo boundary reads clearly against the
    // template art around it
    ctx.save();
    roundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, radius);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.stroke();
    ctx.restore();
  });

  return canvas;
}