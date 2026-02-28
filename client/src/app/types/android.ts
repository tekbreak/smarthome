export interface AndroidInterface {
  say: (text: string, volume: string) => void;
  play: (sound: string, volume: string) => void;
  call: (url: string) => void;
  camera: () => void;
  dim: (dim: string) => void;
  bluetooth: (state: string) => void;
}
