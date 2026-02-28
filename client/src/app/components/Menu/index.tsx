import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import { Control } from "./components/Control";
import Sensores from "./components/Sensores";
import { RootState } from "../../state/store";
import { set } from "../../state/reducers/home";
import { connect, ConnectedProps } from "react-redux";
import {
  BackMenuButton,
  BoxContainer,
  FullscreenButton,
  MenuButtonStyle,
  MenuStyle,
} from "./styles";
import { Overlay } from "../Overlay";
import { MenuHome } from "./menu-home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { HomeMap } from "./components/HomeMap";

const Menu: React.FC<Props> = ({ menuState, color, setMenuState }) => {
  const [componentId, setComponentId] = useState<string | undefined>(undefined);

  const components = {
    control: <Control />,
    sensores: <Sensores />,
    triggers: <Control />,
    homemap: <HomeMap />,
  };

  return (
    <>
      {/*<MenuButtonStyle color={color}>*/}
      {/*  <Button onClick={() => setMenuState(!menuState)}>*/}
      {/*    <MenuIcon sx={{ color }} />*/}
      {/*  </Button>*/}
      {/*</MenuButtonStyle>*/}

      {menuState && (
        <>
          <Overlay
            zIndex={9}
            onClick={() => {
              setComponentId(undefined);
              setMenuState(false);
            }}
          />
          <MenuStyle>
            <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <BackMenuButton>
                <div
                  onClick={() => {
                    if (componentId) {
                      setComponentId(undefined);
                    } else {
                      setMenuState(false);
                    }
                  }}
                >
                  <ArrowBackIcon />
                </div>
              </BackMenuButton>
              <FullscreenButton
                onClick={() => {
                  const elem = document.documentElement;

                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    elem.requestFullscreen();
                  }
                }}
              >
                <FullscreenIcon />
              </FullscreenButton>

              <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                {componentId && components[componentId]}
                {!componentId && (
                  <BoxContainer>
                    <MenuHome setMenu={setComponentId} />
                  </BoxContainer>
                )}
              </Box>
            </div>
          </MenuStyle>
        </>
      )}
    </>
  );
};

const mapState = (state: RootState) => ({
  color: state.home.color,
});

const mapDispatch = {
  set: set,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {
  menuState: boolean;
  setMenuState: (s: boolean) => void;
};

export default connector(Menu);
