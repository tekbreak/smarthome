export interface DeviceStatus {
  code: string;
  value: boolean | number | string;
}
export interface Device {
  name: string;
  id: string;
  code?: string[];
  type: "switch" | "sensor" | "smart-home" | "ir-trigger" | "motion";
  online?: boolean;
  status?: DeviceStatus[];
  icon?: string;
  iconSize?: number;
}

export type DeviceCode = {
  id: string;
  code: string;
};

export type DeviceCommand = {
  code: string;
  value: string | boolean | number;
};
