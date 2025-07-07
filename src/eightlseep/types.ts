/** ISO-8601 date **/
export type ESDateTime = string;

/** format: `HH:MM:SS` */
export type ESTime = string;

export interface OAuth2RequestTokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token: string;
  userId: string;
}

export interface GetMeUserResponse {
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: "male" | "female";
    tempPreference: "cool" | string;
    tempPreferenceUpdatedAt: ESDateTime;
    dob: ESDateTime;
    zip: number;
    emailVerified: false;
    sharingMetricsTo: [];
    sharingMetricsFrom: [];
    notifications: {
      weeklyReportEmail: boolean;
      sessionProcessed: boolean;
      temperatureRecommendation: boolean;
      healthInsight: boolean;
      sleepInsight: boolean;
      marketingUpdates: boolean;
      bedtimeReminder: boolean;
      alarmWakeupPush: boolean;
    };
    displaySettings: {
      useRealTemperatures: boolean;
      measurementSystem: "metric";
    };
    createdAt: ESDateTime;
    experimentalFeatures: false;
    autopilotEnabled: false;
    lastReset: ESDateTime;
    nextReset: ESDateTime;
    sleepTracking: {
      enabledSince: ESDateTime;
    };
    features: ["warming", "cooling", "vibration", "tapControls", "alarms"];
    currentDevice: {
      id: string;
      side: "solo" | string;
      /** timezone formatted as America/Mexico_City **/
      timeZone: string;
      specialization: "pod";
    };
    hotelGuest: boolean;
    devices: string[];
  };
}

export interface SetUserBedtimeRequest {
  schedules: [
    {
      days: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday")[];
      time: ESTime;
      id: string;
      enabled: boolean;
      startSettings: ScheduleStartSettings;
    },
  ];
}

export interface ListAlarmsResponse {
  recommendedAlarm: Alarm;
  alarms: Alarm[];
}

export interface CreateAlarmRequest {
  skipNext: boolean;
  snoozing: boolean;
  tags: string[];
  thermal: Thermal;
  vibration: Vibration;
  /** format: `HH:MM:SS` */
  time: string;
  id: string;
  audio: Audio;
  isSuggested: boolean;
  repeat: Repeat;
  enabled: boolean;
  smart: Smart;
}

export interface CreateAlarmResponse {}

export interface Alarm {
  id: string;
  enabled: boolean;
  time: string;
  repeat: Repeat;
  vibration: Vibration;
  thermal: Thermal;
  audio: Audio;
  smart: Smart;
  skipNext: boolean;
  oneTimeOverride: OneTimeOverride;
  nextTimestamp: ESDateTime;
  startTimestamp: ESDateTime;
  endTimestamp: ESDateTime;
  dismissedUntil: ESDateTime;
  skippedUntil: ESDateTime;
  snoozedUntil: ESDateTime;
  snoozing: boolean;
  tags: string[];
}

export interface Repeat {
  enabled: boolean;
  weekDays: WeekDays;
}

export interface WeekDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Vibration {
  enabled: boolean;
  powerLevel: number;
  pattern: "RISE" | "INTENSE";
}

export interface Thermal {
  enabled: boolean;
  level: number;
}

export interface Audio {
  enabled: boolean;
  level: number;
}

export interface Smart {
  lightSleepEnabled: boolean;
  sleepCapEnabled: boolean;
  sleepCapMinutes: number;
}

export interface OneTimeOverride {
  enabledSince: ESDateTime;
  enabledUntil: ESDateTime;
  time: ESTime;
  vibration: Vibration;
  thermal: Thermal;
  audio: Audio;
  smart: Smart;
}

export interface ScheduleStartSettings {
  bedtime: number;
  elevationPreset: "sleep";
  pillowBedtime: number;
}

export interface Schedule {
  id: string;
  enabled: boolean;
  time: string;
  days: string[];
  tags: string[];
  startSettings: ScheduleStartSettings;
}

export interface ListSchedulesResponse {
  devices: {
    device: {
      deviceId: string;
      side: string;
      specialization: string;
    };
    currentLevel: number;
    currentDeviceLevel: number;
    overrideLevels: Record<string, unknown>;
    currentState: {
      type: string;
      started: string;
      instance: {
        timestamp: string;
        startedFrom: string;
        tags: string[];
      };
    };
    smart: {
      bedTimeLevel: number;
      initialSleepLevel: number;
      finalSleepLevel: number;
    };
  }[];
  temperatureSettings: {
    name: string;
    bedTimeLevel: number;
    initialSleepLevel: number;
    finalSleepLevel: number;
  }[];
  nextScheduledTimestamp: string;
  schedules: Schedule[];
  currentSchedule: Schedule;
  nextSchedule: Schedule;
}
