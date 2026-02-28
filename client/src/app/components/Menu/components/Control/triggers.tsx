import { RootState } from "../../../../state/store";
import { set } from "../../../../state/reducers/home";
import { connect, ConnectedProps } from "react-redux";
import { FC } from "react";
import { FormControlLabel, Paper, Switch } from "@mui/material";
import styled from "@emotion/styled";
import { getWS } from "../../../../helpers";
import { findValueForCodeInStatus } from "../../../../helpers/device";
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

const Triggers: FC<PropsFromRedux> = ({ devices }) => {
  // console.log("DEVVVV", devices.length);
  if (!devices.length) {
    return null;
  }

  const sendCommand = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    code: string
  ) => {
    const value = e.target.checked;
    const ws = getWS();

    const command = {
      code,
      value,
    };

    ws.next({
      type: "device:switch",
      payload: {
        id,
        commands: [{ code, value }],
      },
    });
  };

  return (
    <>
      {devices.map((device) => {
        if (device.type !== "ir-trigger") {
          return null;
        }

        return device.code.map((code) => {
          const status = findValueForCodeInStatus(device.status, code);

          let bgColor = status ? COLOR_ENABLED : COLOR_DISABLED;
          if (!device.online) {
            bgColor = "#bbb";
          }

          const DeviceIcon = getDeviceIcon(device.name);
          return (
            <PaperStyle elevation={3} key={`${device.id}-${code}`} bgColor={bgColor}>
              <IconWrapper>
                <DeviceIcon sx={{ fontSize: "3rem" }} />
              </IconWrapper>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={"title"}>{device.name}</div>
                <FormControlLabel
                  control={
                    <Switch
                      defaultChecked={!!status}
                      onChange={(e) => sendCommand(e, device.id, code)}
                    />
                  }
                  label="Switch"
                />
              </div>
            </PaperStyle>
          );
        });
      })}
    </>
  );
};

const PaperStyle = styled(Paper)<{ bgColor: string }>`
  position: relative;
  background-color: ${(props) => props.bgColor};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 2em;
  column-gap: 1em;
  min-height: 7em;
  height: 100%;
  min-width: 0;
  box-sizing: border-box;

  .title {
    font-size: 2rem;
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

const mapDispatch = {
  set: set,
};

const connector = connect(mapState, mapDispatch);

// The inferred type will look like:
// {isOn: boolean, toggleOn: () => void}
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Triggers);
