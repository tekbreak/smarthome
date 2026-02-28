import { getWeather2 } from "./utils/index.mjs";

const a = await getWeather2();

console.log(JSON.stringify(a, null, 4));