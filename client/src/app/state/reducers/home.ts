import { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { Device } from "../../types";
import { Alert } from "../../types";
import { WeatherApiResponse } from "../../types";
import { ElectroMeter } from "../../types/electro-meter";
export interface HomeState {
  backgroundColor: string;
  color: string;
  silence: boolean;
  devices: Device[];
  sensors: Device[];
  alert: Alert;
  isDay: boolean;
  weather?: WeatherApiResponse;
  electro?: ElectroMeter;
}

export const initialState: HomeState = {
  backgroundColor: "black",
  color: "white",
  silence: false,
  devices: [],
  sensors: [],
  alert: undefined,
  isDay: true,
  weather: undefined,
  electro: undefined,
};

export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Partial<HomeState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { set } = homeSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectBackgroundColor = (state: RootState): string =>
  state.home.backgroundColor;
export const selectColor = (state: RootState): string => state.home.color;

export default homeSlice.reducer;
