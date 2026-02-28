export enum AlertLevels {
  "high" = "high",
  "medium" = "medium",
  "low" = "low",
}

export interface Alert {
  level: AlertLevels;
  title: string;

  backgroundColor?: string;
  duration?: number; // seconds, -1 is infinite
  icon?: string;
  message?: string;
  source?: string;
}

export const alertDefaultConf = {
  [AlertLevels.low]: {
    backgroundColor: "#333",
    duration: 10,
    icon: undefined,
  },
  [AlertLevels.medium]: {
    backgroundColor: "orange",
    duration: 30,
    icon: undefined,
  },
  [AlertLevels.high]: {
    backgroundColor: "red",
    icon: undefined,
    duration: 60,
  },
};
