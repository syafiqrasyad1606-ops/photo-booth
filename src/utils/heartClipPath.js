// Draws a heart path (as the current canvas path, not stroked/filled yet)
// fitted to the given bounding box. Call ctx.fill()/ctx.clip() right after.
export default function heartClipPath(ctx, x, y, w, h) {
  const midX = x + w / 2;
  const topCurveHeight = h * 0.32;

  ctx.beginPath();
  ctx.moveTo(midX, y + h);
  ctx.bezierCurveTo(x - w * 0.1, y + h * 0.55, x, y, midX, y + topCurveHeight);
  ctx.bezierCurveTo(x + w, y, x + w + w * 0.1, y + h * 0.55, midX, y + h);
  ctx.closePath();
}