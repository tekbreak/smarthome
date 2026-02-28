import { hexToHsva } from "@uiw/color-convert";
import { getContrastYIQ } from "../../helpers";
import { useState } from "react";
import Wheel from "@uiw/react-color-wheel";
import { RootState } from "../../state/store";

export const TheWheel: React.FC<{
  color: { hex: string };
  set: (s: Partial<RootState["home"]>) => void;
}> = ({ color, set }) => {
  const [selectedColor, setSelectedColor] = useState("#83aee6");

  return (
    <Wheel
      width={200}
      height={200}
      color={hexToHsva(selectedColor)}
      onChange={(color) => {
        setSelectedColor(color.hex);
        set({
          backgroundColor: color.hex,
          color: getContrastYIQ(color.hex),
        });
      }}
    />
  );
};
