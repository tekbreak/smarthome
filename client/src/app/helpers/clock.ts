import dayjs, { Dayjs } from "dayjs";

export const TIME_FORMAT = "HH:mm";
export const HOUR_FORMAT = "H";
export const OCLOCK_FORMAT = "mm:ss";
export const DATE_FORMAT = "MMMM YYYY";
export const DAY_FORMAT = "D";
export const DAY_NAME_FORMAT = "dddd";

export const getFormattedDateTime = (format: string, anyTime?: Dayjs) => {
  return (anyTime ?? dayjs()).locale("es").format(format);
};
