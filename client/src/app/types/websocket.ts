export interface WsMessage<T> {
  type: string;
  payload: T;
}

enum Actions {
  deviceList = "device:list",
  deviceSend = "device:send",
  alert = "alert",
  weather = "weather",
  dim = "dim",
  electroMeter = "electro-meter",
}

export type SubscriptionActions = {
  [key in Actions]?: (t: any) => void;
};
