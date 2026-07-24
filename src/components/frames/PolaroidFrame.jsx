export default function PolaroidFrame(ctx, x, y, w, h) {
  ctx.save();

  const border = 5;
  const bottomExtra = 5; // slightly heavier bottom edge, classic polaroid feel

  const outerX = x - border;
  const outerY = y - border;
  const outerW = w + border * 2;
  const outerH = h + border * 2 + bottomExtra;

  // FIXED: this used to be a single `ctx.fillRect()` covering the whole
  // outer rect (including the photo underneath it) just to get a shadow —
  // since frames draw *after* the photo, that painted solid white over
  // the entire photo. Building the outer + inner (photo) rects as one
  // path and filling with the "evenodd" rule creates a ring/donut shape
  // instead, so the photo area is mathematically excluded from the fill.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.rect(outerX, outerY, outerW, outerH);
  ctx.rect(x, y, w, h);
  ctx.fill("evenodd");
  ctx.restore();

  // small "push pin" accent, top center
  ctx.beginPath();
  ctx.fillStyle = "#C1442E";
  ctx.arc(x + w / 2, y - border + 2, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}