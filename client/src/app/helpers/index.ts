export * from "./ui-tools";
export * from "./ws";
export * from "./color";

export const proximity = () => {
  const listen = (a) => alert(a);
  window.addEventListener("deviceproximity", () => listen("deviceproximity"));
  window.addEventListener("userproximity", () => listen("userproximity"));
};
