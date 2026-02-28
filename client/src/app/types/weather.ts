export type WeatherPlaces = "malaga" | "home";
export type Weather = {
  id: string;
  temp: number;
  text: string;
  icon?: string;
  wind?: number;
  code?: string;
};

type WeatherCondition = {
  text: string;
  icon: string;
};

export type WeatherApiResponseItem = {
  today: {
    max: string;
    min: string;
    condition: WeatherCondition;
    willRain: boolean;
    uv: number;
    maxWind: number;
  };
  current: {
    temp_c: string;
    isDay: boolean;
    wind_kph: number;
    uv: number;
    condition: WeatherCondition;
  };
};

export type WeatherApiResponse = {
  lastUpdate: Date;
  weather: WeatherApiResponseItem[];
};
