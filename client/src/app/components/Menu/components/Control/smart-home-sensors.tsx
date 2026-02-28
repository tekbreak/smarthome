import { RootState } from "../../../../state/store";
import { connect, ConnectedProps } from "react-redux";
import { FC } from "react";
import styled from "@emotion/styled";
import { findValueForCodeInStatus } from "../../../../helpers/device";
import { MenuPaper } from "../menu-paper";
import { DoorFront } from "@mui/icons-material";

const COLOR_OPEN = "#f4a0a0";
const COLOR_CLOSED = "#b0e49a";

const SmartHomeSensors: FC<PropsFromRedux> = ({ devices }) => {
  const smartHomeDevices = devices.filter((d) => d.type === "smart-home");
  if (!smartHomeDevices.length) {
    return null;
  }

  return (
    <>
      {smartHomeDevices.map((device) => {
        const isOpen = findValueForCodeInStatus(
          device.status,
          "doorcontact_state"
        ) === true;
        let bgColor = isOpen ? COLOR_OPEN : COLOR_CLOSED;
        if (!device.online) {
          bgColor = "#bbb";
        }

        return (
          <MenuPaper
            key={device.id}
            bgColor={bgColor}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1em",
              cursor: "default",
            }}
          >
            <IconWrapper>
              <DoorFront sx={{ fontSize: "3rem" }} />
            </IconWrapper>
            <div className={"title"} style={{ flex: 1 }}>
              {device.name}
            </div>
            <StatusLabel>{isOpen ? "Abierta" : "Cerrada"}</StatusLabel>
          </MenuPaper>
        );
      })}
    </>
  );
};

const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  min-width: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
  color: rgba(0, 0, 0, 0.6);
`;

const StatusLabel = styled.span`
  font-size: 1.6rem;
  font-weight: 500;
  opacity: 0.9;
`;

const mapState = (state: RootState) => ({
  devices: state.home.devices,
});

const connector = connect(mapState, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SmartHomeSensors);
