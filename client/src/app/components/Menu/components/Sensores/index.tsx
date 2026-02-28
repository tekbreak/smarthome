import { RootState } from "../../../../state/store";
import { connect, ConnectedProps } from "react-redux";
import { FC } from "react";
import styled from "@emotion/styled";
import { findValueForCodeInStatus, findValueForCodesInStatus } from "../../../../helpers/device";
import { MenuPaper } from "../menu-paper";
import { DoorFront, Thermostat, Sensors } from "@mui/icons-material";
import { BoxContainer } from "../../styles";

const COLOR_OPEN = "#e57373";
const COLOR_CLOSED = "#81c784";
const COLOR_MOTION = "#64b5f6";
const COLOR_NEUTRAL = "#37474f";
const COLOR_OFFLINE = "#455a64";

const MOTION_CODES = ["pir_state", "occupancy_state", "motion_state"];

type SensorTypeTag = "Temp" | "Puertas" | "Movimiento";

const Sensores: FC<PropsFromRedux> = ({ devices }) => {
  const tempSensors = devices.filter((d) => d.type === "sensor");
  const doorSensors = devices.filter((d) => d.type === "smart-home");
  const motionSensors = devices.filter((d) => d.type === "motion");

  const allSensors: Array<{
    device: (typeof devices)[0];
    typeTag: SensorTypeTag;
    icon: typeof Thermostat;
  }> = [
    ...tempSensors.map((d) => ({ device: d, typeTag: "Temp" as const, icon: Thermostat })),
    ...doorSensors.map((d) => ({ device: d, typeTag: "Puertas" as const, icon: DoorFront })),
    ...motionSensors.map((d) => ({ device: d, typeTag: "Movimiento" as const, icon: Sensors })),
  ];

  if (allSensors.length === 0) {
    return (
      <SensoresContainer>
        <EmptyState>Esperando datos de sensores...</EmptyState>
      </SensoresContainer>
    );
  }

  return (
    <SensoresContainer>
      {allSensors.map(({ device, typeTag, icon: Icon }) => {
        let bgColor = COLOR_NEUTRAL;
        let statusText = "—";

        if (typeTag === "Temp") {
          const tempVal = findValueForCodesInStatus(device.status, [
            "va_temperature",
            "temperature",
            "temp",
          ]);
          const temp =
            tempVal != null
              ? (typeof tempVal === "number" ? tempVal : parseInt(String(tempVal), 10)) / 10
              : null;
          statusText = temp != null ? `${temp.toFixed(1)}°C` : "—";
        } else if (typeTag === "Puertas") {
          const isOpen =
            findValueForCodeInStatus(device.status, "doorcontact_state") === true;
          bgColor = isOpen ? COLOR_OPEN : COLOR_CLOSED;
          statusText = isOpen ? "Abierta" : "Cerrada";
        } else {
          const motionVal = findValueForCodesInStatus(device.status, MOTION_CODES);
          const hasMotion = motionVal === true || motionVal === 1 || motionVal === "1";
          bgColor = hasMotion ? COLOR_MOTION : COLOR_NEUTRAL;
          statusText = hasMotion ? "Movimiento" : device.online ? "Sin movimiento" : "Sin datos";
        }

        if (!device.online) bgColor = COLOR_OFFLINE;

        const isLightBg = [COLOR_OPEN, COLOR_CLOSED, COLOR_MOTION].includes(bgColor);
        const textColor = isLightBg ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.95)";
        const mutedColor = isLightBg ? "rgba(0, 0, 0, 0.55)" : "rgba(255, 255, 255, 0.7)";

        return (
          <MenuPaper
            key={device.id}
            bgColor={bgColor}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1em",
              cursor: "default",
              opacity: device.online ? 1 : 0.8,
            }}
          >
            <IconWrapper style={{ color: mutedColor }}>
              <Icon sx={{ fontSize: "3rem" }} />
            </IconWrapper>
            <Content>
              <DeviceName style={{ color: textColor }}>{device.name}</DeviceName>
              <TypeTag style={{ color: mutedColor }}>{typeTag}</TypeTag>
            </Content>
            <StatusLabel style={{ color: textColor }}>{statusText}</StatusLabel>
          </MenuPaper>
        );
      })}
    </SensoresContainer>
  );
};

const SensoresContainer = styled(BoxContainer)`
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5em;
  align-items: start;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  min-width: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const DeviceName = styled.div`
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.3;
`;

const TypeTag = styled.span`
  display: inline-block;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.2em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatusLabel = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 3em 2em;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.6rem;
  text-align: center;
`;

const mapState = (state: RootState) => ({
  devices: state.home.devices,
});

const connector = connect(mapState, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Sensores);
