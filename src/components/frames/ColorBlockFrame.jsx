export default function ColorBlockFrame(ctx, x, y, w, h) {
  ctx.save();

  const accent = "#FF5A36";

  // Bold accent bar down the left edge, overlapping slightly onto the photo
  ctx.fillStyle = accent;
  ctx.fillRect(x - 4, y - 4, 10, h + 8);

  // Thin accent line along the top
  ctx.fillRect(x - 4, y - 4, w + 8, 4);

  // Small geometric accent circle in the bottom-right margin
  ctx.beginPath();
  ctx.fillStyle = accent;
  ctx.arc(x + w + 4, y + h + 4, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}