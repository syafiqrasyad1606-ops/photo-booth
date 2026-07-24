export default function ClassicFrame(ctx, x, y, w, h) {
  ctx.save();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 14;

  ctx.strokeRect(x, y, w, h);

  ctx.restore();
}