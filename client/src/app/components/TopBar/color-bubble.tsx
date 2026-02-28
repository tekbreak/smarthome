import styled from "@emotion/styled";
import { getContrastYIQ } from "../../helpers";

const ColorBubblesStyle = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 2em;
`;
const BubbleStyle = styled.div<{ color: string }>`
  border-radius: 50%;
  height: 3em;
  width: 3em;
  background-color: ${(props) => props.color};
  border: 2px solid lightgray;
`;

export const ColorBubbles: React.FC<{ set: (p) => void }> = ({ set }) => {
  const colors = ["#000000", "#FFFFFF"];

  return (
    <ColorBubblesStyle>
      {colors.map((color) => (
        <BubbleStyle
          color={color}
          onClick={() =>
            set({
              backgroundColor: color,
              color: getContrastYIQ(color),
            })
          }
        />
      ))}
    </ColorBubblesStyle>
  );
};
