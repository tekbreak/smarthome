import { DeviceStatus } from "../types";

export const findValueForCodeInStatus = (
  status: DeviceStatus[],
  code: string
) => {
  return status?.find((status) => status.code === code)?.value;
};

/** Try multiple status codes; returns first non-null value. Used for temp sensors. */
export const findValueForCodesInStatus = (
  status: DeviceStatus[],
  codes: string[]
) => {
  for (const code of codes) {
    const val = findValueForCodeInStatus(status, code);
    if (val != null) return val;
  }
  return undefined;
};
