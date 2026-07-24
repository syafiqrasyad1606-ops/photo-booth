export default function RetroFrame(ctx, x, y, w, h) {
  ctx.save();

  // Thick terracotta outer border
  ctx.strokeStyle = "#B5502E";
  ctx.lineWidth = 16;
  ctx.strokeRect(x, y, w, h);

  // Cream inline just inside it
  ctx.strokeStyle = "#E7C9A8";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 12, y + 12, w - 24, h - 24);

  // Dashed vintage "ticket stub" line
  ctx.strokeStyle = "#E7C9A8";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(x + 22, y + 22, w - 44, h - 44);
  ctx.setLineDash([]);

  // Scrapbook-style photo-corner triangles
  const cornerSize = 26;
  ctx.fillStyle = "#B5502E";
  const corners = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + cornerSize * dx, cy);
    ctx.lineTo(cx, cy + cornerSize * dy);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
}