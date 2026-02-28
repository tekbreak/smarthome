import { webSocket as RxWebsocket } from "rxjs/webSocket";

import CONFIG from "../../config";

export const getSocket = () => {
  const websocketServer = CONFIG.websocket;

  if (!websocketServer) {
    return null;
  }

  return new WebSocket(websocketServer);
};

export const getRxSocket = <T>() => {
  const websocketServer = CONFIG.websocket;

  if (!websocketServer) {
    return null;
  }

  return RxWebsocket<T>(websocketServer);
};
//
// export const SocketIO = () => {
//   const socket = io("wss://localhost:8001");
//
//   console.log(socket);
//   // socket.connect(() => {
//   //   console.log('Connected to Socket');
//   //   socket.emit('message', 'world');
//   // });
//
//   socket.on("connect", () => {
//     console.log(socket.id); // x8WIv7-mJelg7on_ALbx
//   });
//
//   socket.on("message", (message) => {
//     console.log("mes", message);
//   });
//
//   socket.on("alert", (alert) => {});
// };
