import { FC, useState } from "react";
import { Button, Drawer } from "@mui/material";
import styled from "@emotion/styled";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "./menu";

const Div = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  align-self: flex-start;

  svg {
    color: white;
    opacity: 0.5;
    font-size: 3em;
  }
`;
export const TopBar: FC = () => {
  const [menuState, setMenuState] = useState(false);

  return (
    <>
      <Div>
        <Button onClick={() => setMenuState(true)}>
          <MenuIcon />
        </Button>
      </Div>
      <Drawer
        anchor="right"
        open={menuState}
        onClose={() => setMenuState(false)}
      >
        <Menu />
      </Drawer>
    </>
  );
};
