import path from "path";
import { fileURLToPath } from "url";
import { LOCATIONS } from "../data/weather.mjs";
import axios from "axios";
import fs from "fs";
import { broadcast } from "./index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEATHER_FILE = path.join(__dirname, "..", "data", "weather.json");

export const sendWeatherUpdate = async (wss) => {
  const weather = await getWeatherMessage();
  broadcast(wss, weather);
};

const getStoredWeather = () => {
  try {
    return JSON.parse(fs.readFileSync(WEATHER_FILE, { encoding: "utf-8" }));
  } catch {
    return { lastUpdate: 0, weather: [] };
  }
};

const getWeather = async () => {
  const requestTime = 10 * 60 * 60; // 10 min
  const now = Date.now();
  const storedWeather = getStoredWeather();

  if (storedWeather.lastUpdate + requestTime > now) {
    return storedWeather;
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    console.warn("WEATHER_API_KEY not set, using cached weather");
    return storedWeather;
  }

  const getOptions = (q) => ({
    method: "GET",
    url: "https://api.weatherapi.com/v1/forecast.json",
    params: { key: apiKey, q, lang: "es" },
  });

  const weather = [];

  for (let i = 0; i < LOCATIONS.length; i++) {
    try {
      const response = await axios.request(getOptions(LOCATIONS[i].location));
      const { current } = response.data;
      weather.push({ ...LOCATIONS[i], ...current });
    } catch (error) {
      console.error(error);
    }
  }

  const newWeather = {
    lastUpdate: now,
    weather,
  };
  fs.writeFileSync(WEATHER_FILE, JSON.stringify(newWeather));

  return newWeather;
};

export const getWeatherMessage = async () => {
  const weather = await getWeather();

  return { type: "weather", payload: weather };
};
