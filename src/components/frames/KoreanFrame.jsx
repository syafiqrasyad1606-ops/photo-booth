export default function KoreanFrame(ctx, x, y, w, h) {
  ctx.save();

  const pad = 8;

  // FIXED: this used to be `ctx.fill()` over a rect covering the whole
  // photo area — since frames draw *after* the photo, that painted solid
  // pastel color over the entire photo instead of just a border ring.
  // A thick stroke only paints along the edge (half into the gap between
  // photos, half overlapping the photo's rim) instead of filling the middle.
  ctx.strokeStyle = "#FBEFF3";
  ctx.lineWidth = pad * 2;
  ctx.strokeRect(x, y, w, h);

  // Thin white line hugging the photo itself
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);

  // Delicate pastel pink outline around the outer edge of the padding
  ctx.strokeStyle = "#F2A9C2";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - pad, y - pad, w + pad * 2, h + pad * 2);

  // Tiny sticker-style dot accents, top corners
  ctx.fillStyle = "#F2A9C2";
  [x + 18, x + w - 18].forEach((dotX) => {
    ctx.beginPath();
    ctx.arc(dotX, y - pad + 5, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}