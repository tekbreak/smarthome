import styled from "@emotion/styled";
import { Clock } from "../../components/Clock";
import { Phone } from "../../components/Phone";
import { useDispatch, useSelector } from "react-redux";
import {
  selectBackgroundColor,
  selectColor,
  set,
  type HomeState,
} from "../../state/reducers/home";
import { FC, useEffect, useState } from "react";
import { AlertMessage } from "../../components/Alert";
import Menu from "../../components/Menu";
import type { RootState } from "../../state/store";
import { uiPlaySound, uiSay, wsSubscribe } from "../../helpers";
import { Box } from "@mui/material";
import { MusicPlayer } from "../../components/MusicPlayer";
import CONFIG from "../../../config";
import { AlertLevels, alertDefaultConf } from "../../types";
import { androidBridge } from "../../helpers/android";
import dayjs, { Dayjs } from "dayjs";
import {
  getFormattedDateTime,
  HOUR_FORMAT,
  OCLOCK_FORMAT,
} from "../../helpers/clock";
import Today from "../../components/Today";

const StyledPage = styled.div<{
  color: string;
  background: string;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;

  background-color: ${(props) => props.background ?? "red"};
  color: ${(props) => props.color ?? "white"};

  .Clock {
    font-size: 15em;
  }
`;

const Home: FC = () => {
  const dispatch = useDispatch();
  const setState = (payload: Partial<HomeState>) => dispatch(set(payload));
  const alert = useSelector((state: RootState) => state.home.alert);
  const isDay = useSelector((state: RootState) => state.home?.isDay);
  const [currentTime, setCurrentTime] = useState<Dayjs>();
  const [menuState, setMenuState] = useState(false);
  const background = useSelector(selectBackgroundColor);
  const color = useSelector(selectColor);

  useEffect(() => {
    // proximity();

    wsSubscribe({
      "device:list": (devices) => {
        setState({
          devices,
sensors: devices.filter(
            (device) =>
              device.type === "sensor" ||
              device.type === "smart-home" ||
              device.type === "motion"
          ),
        });
      },
      weather: (weather) => {
        // console.log(weather.weather[0]);
        // const isDayNow = Boolean(weather.weather[0].is_day);

        if (window.hd_is_day !== isDay) {
          window.hd_is_day = isDay;
          window.hd_dim = isDay ? CONFIG.light.day : CONFIG.light.night;
          window.hd_volume = isDay ? CONFIG.volume.day : CONFIG.volume.night; // will be used in ui-tools
          androidBridge.dim(window.hd_dim);
        }

        setState({
          weather,
          isDay: isDay,
        });
      },
      dim: (dim) => {
        androidBridge.dim(typeof dim === "number" ? dim : parseFloat(dim) || 0.5);
      },
      alert: (alert) => {
        const clearAlert = () => setState({ alert: undefined });

        if (!alert) {
          return;
        }

        const alertConfig = {
          ...(alertDefaultConf?.[alert?.level] ??
            alertDefaultConf[AlertLevels.low]),
          ...alert,
        };

        if (alertConfig?.duration > 0) {
          // is not persistent
          setTimeout(() => clearAlert(), alertConfig.duration * 1000);
        }

        setState({
          alert: alertConfig,
        });
      },
      "electro-meter": (electro) => {
        setState({
          electro,
        });
      },
    });

    "dblclick rightclick touchmove dragstart dragend"
      .split(" ")
      .forEach(function (e) {
        window.addEventListener(e, (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          event.stopPropagation();
          // do nothing
        });
      });

    setInterval(() => {
      const newCurrentTime = dayjs();
      setCurrentTime(newCurrentTime);

      if (getFormattedDateTime(OCLOCK_FORMAT, newCurrentTime) === "00:00") {
        uiPlaySound("sounds/oclock.mp3", () => {
          setTimeout(() => {
            const hour = Number(
              getFormattedDateTime(HOUR_FORMAT, newCurrentTime)
            );

            uiSay(
              `${hour === 1 ? "Es la" : "Son las"} ${getFormattedDateTime(
                HOUR_FORMAT,
                newCurrentTime
              )} ${hour === 1 ? "hora" : "horas"}`
            );
          }, 1500);
        });
      }
    }, 1000);
  }, []);

  return (
    <StyledPage color={color} background={background}>
      <Menu menuState={menuState} setMenuState={setMenuState} />
      <Clock currentTime={currentTime} onClick={() => setMenuState(true)} />
      <AlertMessage
        alert={alert}
        clearAlert={() => setState({ alert: undefined })}
      />
      <Today current={currentTime} />
      <Phone />
      <Box>
        <MusicPlayer />
      </Box>
    </StyledPage>
  );
};

export default Home;
