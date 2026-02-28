import Switches from "./switches";
import Triggers from "./triggers";
import { BoxContainer } from "../../styles";
import styled from "@emotion/styled";

const ControlGrid = styled(BoxContainer)`
  grid-template-columns: 1fr;
  grid-auto-rows: minmax(7em, auto);
  align-items: stretch;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const Control: React.FC = () => {
  return (
    <ControlGrid>
      <Switches />
      <Triggers />
    </ControlGrid>
  );
};
