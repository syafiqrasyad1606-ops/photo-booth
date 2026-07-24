export default function ScrapbookFrame(ctx, x, y, w, h) {
  ctx.save();

  // clean thin border right on the photo edge — doesn't compete with the photo
  ctx.strokeStyle = "rgba(36,23,19,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // washi-tape accent, fully in the margin above the photo
  ctx.save();
  ctx.translate(x + w * 0.22, y - 10);
  ctx.rotate(-0.08);
  ctx.fillStyle = "rgba(242, 169, 194, 0.85)";
  ctx.fillRect(-26, -7, 52, 14);
  ctx.restore();

  // small star doodle, fully in the margin to the right
  drawStar(ctx, x + w + 14, y + h * 0.25, 6, "#F2A9C2");

  // small heart-outline doodle, fully in the margin to the left
  drawHeartOutline(ctx, x - 14, y + h * 0.7, 6, "#7BAF9E");

  ctx.restore();
}

function drawStar(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    const innerAngle = angle + Math.PI / 5;
    ctx.lineTo(Math.cos(innerAngle) * r * 0.45, Math.sin(innerAngle) * r * 0.45);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawHeartOutline(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.3);
  ctx.bezierCurveTo(r, -r * 0.6, r * 1.6, r * 0.5, 0, r * 1.4);
  ctx.bezierCurveTo(-r * 1.6, r * 0.5, -r, -r * 0.6, 0, r * 0.3);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}