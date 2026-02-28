import { WeatherApiResponseItem } from "../types";

export const getTempUnits = (temp: number) =>
  Math.trunc(Math.round(temp * 10) / 10);

export const getIconClass = (icon: string, isDay = true): string => {
  if (!icon) {
    return defaultWi;
  }

  try {
    const regex = /(\d+)\.png/gm;
    const m = regex.exec(icon);
    const code = Number(m[1]);

    if (code === 113) {
      return `wi wi-${isDay ? "day-sunny" : "night-clear"}`;
    }

    return `wi wi-${isDay ? "day" : "night"}-${wi[code]}`;
  } catch {
    return defaultWi;
  }
};

const defaultWi = "day-sunny";
const wi: Record<number, string> = {
  395: "storm-showers",
  392: "storm-showers",
  386: "storm-showers",
  200: "storm-showers",
  389: "thunderstorm",
  377: "hail",
  350: "hail",
  374: "sleet",
  365: "sleet",
  362: "sleet",
  320: "sleet",
  317: "sleet",
  314: "sleet",
  311: "sleet",
  284: "sleet",
  281: "sleet",
  185: "sleet",
  182: "sleet",
  371: "snow",
  368: "snow",
  338: "snow",
  335: "snow",
  332: "snow",
  329: "snow",
  326: "snow",
  323: "snow",
  227: "snow",
  179: "snow",
  230: "snow-wind",
  359: "rain",
  356: "rain",
  308: "rain",
  305: "rain",
  302: "showers",
  299: "showers",
  353: "sprinkle",
  296: "sprinkle",
  293: "sprinkle",
  266: "sprinkle",
  263: "sprinkle",
  176: "sprinkle",
  143: "sprinkle",
  260: "fog",
  248: "fog",
  122: "fog",
  119: "cloudy",
  116: "cloudy",
  113: "clear",
};

// N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, NWN, NW, and NNW
const wiWind = {};
