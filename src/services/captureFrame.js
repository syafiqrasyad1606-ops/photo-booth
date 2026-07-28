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

  // FIXED: this used to be `ctx.drawImage(video, 0, 0, width, height)` —
  // that draws the *entire* raw video frame stretched to fill width x
  // height regardless of the camera's actual aspect ratio. Laptop
  // webcams happen to be close to 4:3 so it wasn't obvious, but phone
  // cameras are commonly 16:9 or other ratios, so the stretch squished
  // the image noticeably. This crops a centered region matching the
  // target aspect ratio first (cover-fit), then draws that — no more
  // distortion regardless of what aspect ratio the camera reports.
  const vw = video.videoWidth || width;
  const vh = video.videoHeight || height;
  const targetAspect = width / height;
  const srcAspect = vw / vh;

  let sx, sy, sw, sh;
  if (srcAspect > targetAspect) {
    // source is wider than target — crop the left/right edges
    sh = vh;
    sw = sh * targetAspect;
    sx = (vw - sw) / 2;
    sy = 0;
  } else {
    // source is taller than target — crop the top/bottom edges
    sw = vw;
    sh = sw / targetAspect;
    sx = 0;
    sy = (vh - sh) / 2;
  }

  // Mirror horizontally to match the live preview (CameraView flips the
  // <video> element with a CSS transform so it feels like a mirror while
  // posing) — without this, the saved photo comes out reversed compared
  // to what was seen on screen.
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
  ctx.restore();

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
