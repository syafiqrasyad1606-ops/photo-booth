import beep from "../assets/sounds/beep.mp3";
import shutter from "../assets/sounds/shutter.mp3";
import printer from "../assets/sounds/printer.mp3";

const sounds = {
  beep: new Audio(beep),
  shutter: new Audio(shutter),
  printer: new Audio(printer),
};

Object.values(sounds).forEach((audio) => {
  audio.preload = "auto";
});

export function playSound(name, volume = 1) {
  const audio = sounds[name];

  if (!audio) return;

  const clone = audio.cloneNode();

clone.volume = volume;

clone.play().catch(() => {});
}

export function stopSound(name) {
  const audio = sounds[name];

  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
}