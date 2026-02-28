import { RootState } from "../../state/store";
import { set } from "../../state/reducers/home";
import { connect, ConnectedProps } from "react-redux";
import { FC } from "react";
import AirIcon from "@mui/icons-material/Air";
import { Weather, WeatherPlaces } from "../../types";
import styled from "@emotion/styled";
import { getIconClass, getTempUnits } from "../../helpers/weather";
import { Box } from "@mui/material";

const TodayWeather: FC<Props> = ({ sensors, weather }) => {
  // Weather can be undefined before WS data arrives, or have flat structure (temp_c directly)
  const current = weather?.current ?? weather;
  if (!current || current.temp_c == null) {
    return null;
  }

  const salonTemp =
    parseInt(
      (sensors
        ?.find((sensor) => sensor.id === "bfe96af25b20f764810chc")
        ?.status?.find((state) => state.code === "va_temperature")?.value ??
        0) as string
    ) / 10;

  const weathers: Record<WeatherPlaces, Weather> = {
    malaga: {
      id: "malaga",
      temp: parseFloat(current?.temp_c ?? "0"),
      text: current?.condition?.text ?? "",
      wind: current?.wind_kph,
      icon: current?.condition?.icon,
      code: getIconClass(current?.condition?.icon, current?.is_day),
    },
    home: {
      id: "casa",
      temp: salonTemp,
      text: "salon",
    },
  };

  return (
    <WeatherStyle>
      <WindAndIn>
        <WeatherInStyle>{getTempUnits(weathers.home.temp)}&deg;</WeatherInStyle>

        {weathers?.malaga?.wind && (
          <WindStyle>
            {Math.ceil(weathers.malaga.wind)} <AirIcon />
          </WindStyle>
        )}
      </WindAndIn>
      <WeatherOutStyle>
        {getTempUnits(weathers.malaga.temp)}&deg;
      </WeatherOutStyle>
      {weathers?.malaga?.icon && (
        <IconStyle>
          <i className={weathers.malaga.code}></i>
        </IconStyle>
      )}
    </WeatherStyle>
  );
};

const mapState = (state: RootState) => ({
  weather: state.home?.weather?.weather?.[0],
  sensors: state.home.sensors,
});

const mapDispatch = {
  set: set,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export default connector(TodayWeather);

const WeatherStyle = styled.div`
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 50%;
  padding-top: 1em !important;
`;

const WindStyle = styled.div`
  font-size: 2em;
  display: flex;
  //flex-direction: column;
  //justify-content: flex-end;
  align-items: initial;
  line-height: 1.1em;

  svg {
    font-size: 1em;
    transform: rotate(180deg);
  }
`;

const IconStyle = styled.div<{ icon?: string }>`
  //padding-top: 3em;
  padding: 0em 0 0.2em 2em;

  i {
    font-size: 5em;
  }
`;

const WeatherOutStyle = styled.div`
  font-size: 6em;
  line-height: 1.1em;
`;

const WeatherInStyle = styled.div`
  margin: 0;
  text-align: right;
  font-size: 2em;
`;

const WindAndIn = styled.div`
  height: 100%;
  justify-content: center;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  margin-right: 1em;
  font-size: 1.2em;
`;
