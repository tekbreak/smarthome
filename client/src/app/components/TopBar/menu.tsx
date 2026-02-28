import { hexToHsva } from "@uiw/color-convert";
import { getContrastYIQ } from "../../helpers";
import Wheel from "@uiw/react-color-wheel";
import { HuePicker } from "react-color";
import { useAppSelector } from "../../state/hooks";
import { selectBackgroundColor, set } from "../../state/reducers/home";
import { RootState } from "../../state/store";
import { connect, ConnectedProps } from "react-redux";
import styled from "@emotion/styled";
import { ColorBubbles } from "./color-bubble";
import { useState } from "react";

const MenuStyled = styled.div`
  padding: 1em 2em;
  background-color: black;
  height: 100vh;
  min-width: 35vw;
  color: white;
`;
const Menu: React.FC<PropsFromRedux> = ({ set }) => {
  const [selectedColor, setSelectedColor] = useState("#83aee6");
  const backgroundColor = useAppSelector(selectBackgroundColor);

  return (
    <MenuStyled>
      <div>
        <h2>Color:</h2>
        <ColorBubbles set={set} />
        <HuePicker
          color={selectedColor}
          onChange={({ hex }) => {
            setSelectedColor(hex);
            set({
              backgroundColor: hex,
              color: getContrastYIQ(hex),
            });
          }}
        />
      </div>
    </MenuStyled>
  );
};

const mapState = (state: RootState) => ({});

const mapDispatch = {
  set: set,
};

const connector = connect(mapState, mapDispatch);

// The inferred type will look like:
// {isOn: boolean, toggleOn: () => void}
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Menu);
