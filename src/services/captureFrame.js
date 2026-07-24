export default function captureFrame(
  video,
  width = 900,
  height = 675,
  filterCss = ""
) {
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  //------------------------------------
  // Apply selected CSS filter
  //------------------------------------

  ctx.filter = filterCss || "none";

  //------------------------------------
  // Draw webcam
  //------------------------------------

  ctx.drawImage(video, 0, 0, width, height);

  ctx.filter = "none";

  //------------------------------------
  // AUTO ENHANCE
  //------------------------------------

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  const brightness = 12; // +12
  const contrast = 1.08; // +8%
  const saturation = 1.08; // +8%

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    //-----------------------
    // Brightness
    //-----------------------

    r += brightness;
    g += brightness;
    b += brightness;

    //-----------------------
    // Contrast
    //-----------------------

    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    //-----------------------
    // Saturation
    //-----------------------

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;

    //-----------------------
    // Warm tone
    //-----------------------

    r += 4;
    g += 2;
    b -= 2;

    //-----------------------
    // Clamp
    //-----------------------

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(image, 0, 0);

  //------------------------------------
  // Soft vignette
  //------------------------------------

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.35,
    width / 2,
    height / 2,
    width * 0.75
  );

  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,.12)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  //------------------------------------
  // Fine Grain
  //------------------------------------

  ctx.save();

  ctx.globalAlpha = 0.03;

  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";

    ctx.fillRect(
      Math.random() * width,
      Math.random() * height,
      1,
      1
    );
  }

  ctx.restore();

  return canvas;
}