import dsBridge from "dsbridge";
import { AndroidInterface, WsMessage } from "../types";
import { WebSocketSubject } from "rxjs/webSocket";

declare global {
  interface Window {
    hd_android?: AndroidInterface;
    _dsbridge?: unknown;
    _dswk?: unknown;
    hd_ws_connected: boolean;
    hd_ws: WebSocketSubject<WsMessage<any>>;
    hd_volume: number;
    hd_dim: number;
    hd_is_day: boolean;
  }
}

window.hd_android = window.hd_android ?? undefined;

/** Detect if we're in the Android WebView (DSBridge or legacy hd_android) */
const hasDsBridge = (): boolean =>
  typeof window._dsbridge !== "undefined" || typeof window._dswk !== "undefined";

export const getAndroidInterface = (): AndroidInterface | undefined => {
  return window?.hd_android ?? undefined;
};

export const IS_ANDROID = !!getAndroidInterface() || hasDsBridge();

/** Convert values to strings for Android bridge (expects String params) */
const str = (v: unknown): string => String(v);

/** Safe bridge calls - uses DSBridge when available, else legacy hd_android */
const callNative = (method: string, arg?: unknown) => {
  if (hasDsBridge()) {
    try {
      dsBridge.call(method, arg);
    } catch (e) {
      console.warn("DSBridge call failed:", method, e);
    }
    return;
  }
  const hd = getAndroidInterface();
  if (!hd) return;
  switch (method) {
    case "hd.dim":
      hd.dim?.(str(arg));
      break;
    case "hd.say":
      if (arg && typeof arg === "object" && "text" in arg && "volume" in arg) {
        hd.say?.((arg as { text: string; volume: string }).text, (arg as { text: string; volume: string }).volume);
      }
      break;
    case "hd.play":
      if (arg && typeof arg === "object" && "sound" in arg && "volume" in arg) {
        hd.play?.((arg as { sound: string; volume: string }).sound, (arg as { sound: string; volume: string }).volume);
      }
      break;
    case "hd.call":
      hd.call?.(str(arg));
      break;
    case "hd.camera":
      hd.camera?.();
      break;
    case "hd.bluetooth":
      hd.bluetooth?.(str(arg));
      break;
  }
};

/** Safe bridge calls with proper type conversion for Android WebView */
export const androidBridge = {
  dim: (level: number) =>
    callNative("hd.dim", str(Math.max(0.01, Math.min(1, level)))),
  say: (text: string, volume: number) =>
    callNative("hd.say", { text, volume: str(volume) }),
  play: (sound: string, volume: number) =>
    callNative("hd.play", { sound, volume: str(volume) }),
  call: (url: string) => callNative("hd.call", url),
  camera: () => callNative("hd.camera"),
  bluetooth: (enabled: boolean) => callNative("hd.bluetooth", str(enabled)),
};
