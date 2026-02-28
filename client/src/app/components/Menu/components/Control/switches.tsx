import { RootState } from "../../../../state/store";
import { connect, ConnectedProps } from "react-redux";
import { FC } from "react";
import styled from "@emotion/styled";
import { getWS } from "../../../../helpers";
import { findValueForCodeInStatus } from "../../../../helpers/device";
import { MenuPaper } from "../menu-paper";
import { DeviceSwitch } from "./device-switch";
import { DeviceCommand } from "../../../../types";
import {
  AcUnit,
  BugReport,
  Celebration,
  Kitchen,
  Lightbulb,
  PowerSettingsNew,
  Wifi,
} from "@mui/icons-material";

const COLOR_ENABLED = "#b0e49a";
const COLOR_DISABLED = "#f4a0a0";

const getDeviceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("wifi")) return Wifi;
  if (n.includes("mosquito")) return BugReport;
  if (n.includes("aire") || n.includes("ac")) return AcUnit;
  if (n.includes("navidad") || n.includes("christmas")) return Celebration;
  if (n.includes("luz") || n.includes("light")) return Lightbulb;
  if (n.includes("mesa") || n.includes("table")) return Kitchen;
  return PowerSettingsNew;
};

const Switches: FC<PropsFromRedux> = ({ devices }) => {
  if (!devices.length) {
    return null;
  }

  const sendCommand = (id: string, command: DeviceCommand) => {
    // const value = e.target.checked;
    const ws = getWS();

    // const command = {
    //   code,
    //   value,
    // };

    ws.next({
      type: "device:switch",
      payload: {
        id,
        commands: [command],
      },
    });
  };

  return (
    <>
      {devices.map((device) => {
        if (!["switch", "ir-switch"].includes(device.type)) {
          return null;
        }

        // console.log(device);

        return device.code.map((code) => {
          const status = findValueForCodeInStatus(device.status, code);

          let bgColor = status ? COLOR_ENABLED : COLOR_DISABLED;
          if (!device.online) {
            bgColor = "#bbb";
          }

          const toggle = () =>
            sendCommand(device.id, { code, value: !status });
          const DeviceIcon = getDeviceIcon(device.name);

          return (
            <MenuPaper
              key={device.name}
              bgColor={bgColor}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "1em",
                cursor: "pointer",
              }}
              onClick={toggle}
            >
              <IconWrapper>
                <DeviceIcon sx={{ fontSize: "3rem" }} />
              </IconWrapper>
              <div className={"title"} style={{ flex: 1, minWidth: 0 }}>
                {device.name}
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <DeviceSwitch
                  status={!!status}
                  code={code}
                  onChange={(command) => sendCommand(device.id, command)}
                />
              </div>
            </MenuPaper>
          );
        });
      })}
    </>
  );
};

const SwitchesStyle = styled.div`
  padding: 5em;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  row-gap: 2em;
  column-gap: 2em;
  height: 100%;

  .switch {
    position: relative;
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
  color: rgba(0, 0, 0, 0.6);
`;

const mapState = (state: RootState) => ({
  devices: state.home.devices,
});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

// The inferred type will look like:
// {isOn: boolean, toggleOn: () => void}
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Switches);
