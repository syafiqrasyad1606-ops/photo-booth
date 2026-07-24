export default function FilmFrame(ctx, x, y, w, h) {
  ctx.save();

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 18;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#fff";
  const spacing = 40;
  // FIXED: this used to be a hardcoded `for (i < 10)`, so the sprocket
  // holes only covered the first ~400px of the photo regardless of its
  // actual height. Now it scales with `h` so holes run the full length.
  const holeCount = Math.max(1, Math.floor((h - 20) / spacing));
  for (let i = 0; i < holeCount; i++) {
    const yy = y + 20 + i * spacing;
    ctx.fillRect(x - 8, yy, 6, 12);
    ctx.fillRect(x + w + 2, yy, 6, 12);
  }

  ctx.restore();
}