// https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/
import { AlertLevels } from "../types";
import { androidBridge, IS_ANDROID } from "./android";

const sounds: Record<AlertLevels, string> = {
  high: "sounds/high.mp3",
  low: "sounds/medium.mp3",
  medium: "sounds/medium.mp3",
};

export const uiSay = (message: string): void => {
  if (!message) {
    return;
  }

  if (IS_ANDROID) {
    androidBridge.say(message, window.hd_volume ?? 0.5);
    return;
  }

  const voice = window.speechSynthesis
    .getVoices()
    .find((e) => e.voiceURI === "Google español");

  const speech = new SpeechSynthesisUtterance();
  speech.text = message;
  speech.lang = "es-ES";
  speech.voice = voice;
  speech.pitch = 1.5;
  speech.rate = 1;

  window.speechSynthesis.speak(speech);
};
export const uiPlay = (level: AlertLevels, callback: () => void) => {
  const sound = sounds[level];

  if (!sound) {
    return;
  }

  if (IS_ANDROID) {
    androidBridge.play(sound, window.hd_volume ?? 0.5);
    return;
  }

  let beat = new Audio(sound);

  if (callback) {
    beat.addEventListener("ended", () => {
      callback();
    });
  }

  // Play the beat
  try {
    beat.play();
  } catch (_) {
    // do nothing
  }

  // Pause/stop the beat
  // beat.pause();

  // Reload the beat (back to the start)
  // beat.load();
};

export const uiPlaySound = (sound: string, callback: () => void) => {
  if (!sound) {
    return;
  }

  if (IS_ANDROID) {
    androidBridge.play(sound, window.hd_volume ?? 0.5);
    callback();
    return;
  }

  let beat = new Audio(sound);

  if (callback) {
    beat.addEventListener("ended", () => {
      callback();
    });
  }

  // Play the beat
  try {
    beat.play();
  } catch (_) {
    // do nothing
  }

  // Pause/stop the beat
  // beat.pause();

  // Reload the beat (back to the start)
  // beat.load();
};

export const uiNotification = (level: AlertLevels, message: string) => {
  if (level) {
    const callback = message ? () => uiSay(message) : undefined;
    uiPlay(level, callback);

    return;
  }

  if (message) {
    uiSay(message);
  }
};
