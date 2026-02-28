import CONFIG from "../../config";
import { webSocket as RxWebsocket, WebSocketSubject } from "rxjs/webSocket";
import { SubscriptionActions, WsMessage } from "../types";

import { distinctUntilChanged } from "rxjs/operators";

export const wsSubscribe = (actions: SubscriptionActions) => {
  if (window.hd_ws_connected) {
    return;
  }

  const websocketServer = CONFIG.websocket;

  if (!websocketServer) {
    return null;
  }

  const ws = RxWebsocket<WsMessage<any>>(websocketServer);

  // console.log("Subscribing");
  ws.pipe(distinctUntilChanged()).subscribe({
    next: ({ type, payload }) => {
      if (type === "device:list") {
        console.log("[WS] received device:list, count:", Array.isArray(payload) ? payload.length : 0);
      }
      actions?.[type]?.(payload);
    },
    error: (error) => {
      console.log("Connection error", error);

      window.hd_ws_connected = false;

      setTimeout(() => {
        if (!window.hd_ws_connected) {
          console.log("Reconnecting...");
          wsSubscribe(actions);
        } else {
          console.log("Connected successfully");
        }
      }, 5000);
    },
  });

  window.hd_ws = ws;
  window.hd_ws_connected = true;
};

export const getWS = (): WebSocketSubject<WsMessage<any>> => {
  if (!window?.hd_ws) {
    window.hd_ws = RxWebsocket<WsMessage<any>>(CONFIG.websocket);
  }

  return window.hd_ws;
};
