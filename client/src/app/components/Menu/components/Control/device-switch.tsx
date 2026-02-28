import { Switch } from "@mui/material";
import { DeviceCommand } from "../../../../types";

export const DeviceSwitch: React.FC<{
  status: boolean;
  code: string;
  onChange: (c: DeviceCommand) => void;
}> = ({ code, status, onChange }) => {
  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ code, value: e.target.checked });
  };
  return (
    <Switch checked={!!status} onChange={_onChange} />
  );
};
