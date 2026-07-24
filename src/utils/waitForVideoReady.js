import sleep from "./sleep";

export default async function waitForVideoReady(video, timeoutMs = 5000) {
  const start = Date.now();

  while (
    (!video.videoWidth || !video.videoHeight) &&
    Date.now() - start < timeoutMs
  ) {
    await sleep(100);
  }

  return video.videoWidth > 0 && video.videoHeight > 0;
}