import { RootState } from "../../../../state/store";
import { set } from "../../../../state/reducers/home";
import { connect, ConnectedProps } from "react-redux";
import { FC } from "react";
import { FormControlLabel, Paper, Switch } from "@mui/material";
import styled from "@emotion/styled";
import { getWS } from "../../../../helpers";
import { findValueForCodeInStatus } from "../../../../helpers/device";

const COLOR_ENABLED = "#b0e49a";
const COLOR_DISABLED = "#f4a0a0";

const Scenes: FC<PropsFromRedux> = ({ devices }) => {
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

    ws.next({
      type: "device:switch",
      payload: {
        id,
        code,
        value,
      },
    });
  };

  return (
    <SwitchesStyle>
      {devices.map((device) => {
        if (device.type !== "switch") {
          return null;
        }

        return device.code.map((code) => {
          const status = findValueForCodeInStatus(device.status, code);

          let bgColor = status ? COLOR_ENABLED : COLOR_DISABLED;
          if (!device.online) {
            bgColor = "#bbb";
          }

          return (
            <PaperStyle elevation={3} key={device.name} bgColor={bgColor}>
              <IconStyle iconSize={device.iconSize ?? 100} image={device.icon ?? ""}>
                {device.icon ? <img src={device.icon} alt={device.name} /> : null}
              </IconStyle>
              <div>
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
    </SwitchesStyle>
  );
};

const PaperStyle = styled(Paper)<{ bgColor: string }>`
  position: relative;
  background-color: ${(props) => props.bgColor};
  display: flex;
  justify-content: flex-start;
  padding: 1em 0;
  column-gap: 1em;

  .title {
    font-size: 2rem;
  }
`;

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

const IconStyle = styled.div<{ iconSize: number; image: string }>`
  width: 6em;
  height: 6em;
  border-radius: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;

  //background-color: white;
  // background-image: url(${(props) => props.image});
  // background-size: ${(props) => props.iconSize ?? 100}%;
  // background-position: 50% 50%;
  // background-repeat: no-repeat;

  img {
    max-width: ${(props) => props.iconSize ?? 100}%;
    mix-blend-mode: multiply;
    filter: contrast(1);
  }
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

export default connector(Scenes);
