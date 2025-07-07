import { CreateAlarmRequest, SetUserBedtimeRequest } from "./eightlseep/types";

export const WHOOP_DEFAULT_ALARM_PAYLOAD: Omit<CreateAlarmRequest, "id" | "time"> = {
  skipNext: false,
  snoozing: false,
  tags: [],
  thermal: {
    level: 50,
    enabled: true,
  },
  vibration: {
    powerLevel: 50,
    enabled: true,
    pattern: "INTENSE",
  },
  // time: "07:00:00",
  // id: "00BFEB94-D07B-495F-824E-C4C7F3293697",
  audio: {
    enabled: false,
    level: 30,
  },
  isSuggested: true,
  repeat: {
    weekDays: {
      saturday: true,
      friday: true,
      monday: true,
      sunday: true,
      thursday: true,
      tuesday: true,
      wednesday: true,
    },
    enabled: true,
  },
  enabled: true,
  smart: {
    lightSleepEnabled: false,
    sleepCapEnabled: false,
    sleepCapMinutes: 480,
  },
};

export const ES_DEFAULT_BEDTIME_SCHEDULE_PAYLOAD: {
  schedules: Omit<SetUserBedtimeRequest["schedules"][number], "id" | "time">[];
} = {
  schedules: [
    {
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      // time: "21:54:13",
      // id: uuidv4(),
      enabled: true,
      startSettings: {
        elevationPreset: "sleep",
        pillowBedtime: 0,
        bedtime: 0,
      },
    },
  ],
};
