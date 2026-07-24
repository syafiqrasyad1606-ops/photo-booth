import GIF from "gif.js/dist/gif.js";
// The '?url' suffix tells Vite to give us the resolved file URL instead of
// trying to bundle/execute this as a module — gif.js needs a real worker
// script URL to spin up its Web Worker, not an ES import.
import gifWorkerUrl from "gif.js/dist/gif.worker.js?url";

// Encodes an array of canvases into an animated GIF blob. Runs off the
// main thread via gif.js's Web Worker, so it won't freeze the UI even
// though encoding can take a second or two.
export default function encodeGif(frameCanvases, { delay = 120, quality = 10, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    if (!frameCanvases || frameCanvases.length === 0) {
      reject(new Error("Tidak ada frame untuk di-encode."));
      return;
    }

    const gif = new GIF({
      workers: 2,
      quality,
      width: frameCanvases[0].width,
      height: frameCanvases[0].height,
      workerScript: gifWorkerUrl,
      repeat: 0, // loop forever
    });

    frameCanvases.forEach((canvas) => {
      gif.addFrame(canvas, { delay, copy: true });
    });

    if (onProgress) {
      gif.on("progress", (p) => onProgress(Math.round(p * 100)));
    }

    gif.on("finished", (blob) => resolve(blob));
    gif.on("abort", () => reject(new Error("GIF encoding dibatalkan")));

    try {
      gif.render();
    } catch (err) {
      reject(err);
    }
  });
}