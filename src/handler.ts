import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import EightSleepClient from "./eightlseep/cli";
import config from "./config";
import { ES_DEFAULT_BEDTIME_SCHEDULE_PAYLOAD, WHOOP_DEFAULT_ALARM_PAYLOAD } from "./requests";
import WhoopClient from "./whoop/cli";
import { newEightSleepTime, newWhoopTime } from "./utils";
import { ESTime, SetUserBedtimeRequest } from "./eightlseep/types";

/**
 * AWS lambda handler
 */
export const handler = async () => {
  const eightSleep = new EightSleepClient(
    config.eightSleep.clientID!,
    config.eightSleep.clientSecret!,
    config.eightSleep.username!,
    config.eightSleep.password!,
  );
  await eightSleep.getSession();

  const whoopClient = new WhoopClient(config.whoop.username!, config.whoop.password!);
  await whoopClient.getSession();

  const whoopAlarmPreferences = await whoopClient.retrieveSmartAlarmPreferences();
  console.debug("[handler:whoop] alarm preferences", JSON.stringify(whoopAlarmPreferences));

  const sleepNeeded = await whoopClient.retrieveSleepNeeded();
  console.debug("[handler:whoop] sleep needed", JSON.stringify(sleepNeeded));

  // we could find the recommendation for peak, goal or weekly optimisation, instead let's aim for 100% recovery
  if (!sleepNeeded.recommended_time_in_bed_formatted || !sleepNeeded.recommended_time_in_bed_formatted["100"]) {
    console.error("[handler:whoop] could not retrieve sleep needed from whoop");
    throw new Error("could not retrieve sleep needed from whoop sleep coach for 100% recovery");
  }

  /**
   * Calculate bedtime
   */

  let bedtime: DateTime;
  let wakeupAlarm: DateTime;

  if (whoopAlarmPreferences.enabled) {
    console.debug("[handler:wakeup] alarm is set recommended, prefer alarm time");

    const whoopWakeUpAlarm = newWhoopTime(
      whoopAlarmPreferences.upper_time_bound,
      whoopAlarmPreferences.time_zone_offset,
    ).plus({ days: 1 });
    console.log(`[handler:whoop] alarm enabled=${whoopAlarmPreferences.enabled} time=${whoopWakeUpAlarm}`);

    const timeInBedNeeded = sleepNeeded.recommended_time_in_bed_formatted["100"].recommended_time_in_bed_time_string;
    console.log(`[handler:whoop] need ${timeInBedNeeded} hours in bed to PEAK at 100%`);

    const dt = DateTime.fromFormat(timeInBedNeeded, "H:mm");

    const goToBedBy = whoopWakeUpAlarm.minus({
      hours: dt.hour,
      minutes: dt.minute,
    });

    console.log(`[handler:whoop] to wake up at alarm=${whoopWakeUpAlarm}, go to bed by ${goToBedBy}`);

    bedtime = goToBedBy;
    wakeupAlarm = whoopWakeUpAlarm;
  } else {
    console.debug("[handler:wakeup] alarm disabled, fallback to sleep coach recommendation for 100% recovery");

    bedtime = newWhoopTime(
      sleepNeeded.recommended_time_in_bed_formatted["100"].optimal_endpoints_formatted.start,
      whoopAlarmPreferences.time_zone_offset,
    );
    wakeupAlarm = bedtime = newWhoopTime(
      sleepNeeded.recommended_time_in_bed_formatted["100"].optimal_endpoints_formatted.end,
      whoopAlarmPreferences.time_zone_offset,
    );
    console.log(`[handler:whoop] sleep coach recommendation for 100% recovery=${bedtime}`);
  }

  const meUser = await eightSleep.getMeUser();
  console.debug("[handler:8sleep] me user", JSON.stringify(meUser));

  const bedtimeFmt: ESTime = newEightSleepTime(bedtime, meUser.user.currentDevice.timeZone);
  const wakeupAlarmFmt: ESTime = newEightSleepTime(wakeupAlarm, meUser.user.currentDevice.timeZone);
  console.log(`[handler:8sleep] computed tz=${meUser.user.currentDevice.timeZone} bedtime_alarm=${bedtimeFmt} wakeup_alarm=${wakeupAlarmFmt}`);

  const schedules = await eightSleep.listSchedules();
  console.debug("[handler:8sleep] schedules", JSON.stringify(schedules));

  if (schedules.length > 1) {
    console.error("[handler:wakeup] could not find a bedtime schedule in 8sleep");
    throw new Error("could not find a bedtime schedule in 8sleep");
  }

  const setBedtimePayload: SetUserBedtimeRequest = {
    schedules: [
      {
        ...ES_DEFAULT_BEDTIME_SCHEDULE_PAYLOAD.schedules[0],
        id: schedules[0].id,
        time: bedtimeFmt,
      },
    ],
  };
  console.debug("[handler:8sleep] saving new bedtime schedule", JSON.stringify(setBedtimePayload));
  await eightSleep.setUserBedtime(setBedtimePayload);
  console.log(`[handler:8sleep] new bedtime schedule set to ${bedtimeFmt}`);

  // Delete all alarms but one. Sync to Whoop wake-up time
  console.log("[handler:8sleep] syncing 8sleep alarm to whoop alarm");

  const { alarms } = await eightSleep.listAlarms();
  console.debug("[handler:8sleep] found alarms", JSON.stringify(alarms));

  const deleteAlarmsPromises = alarms.map((al) => eightSleep.deleteAlarm(al.id));
  await Promise.all(deleteAlarmsPromises);

  const newAlarmPayload = {
    ...WHOOP_DEFAULT_ALARM_PAYLOAD,
    id: uuidv4(),
    time: wakeupAlarmFmt,
  };
  console.debug(`[handler:8sleep] new wakeup alarm payload`, JSON.stringify(newAlarmPayload));

  console.info(`[handler:8sleep] creating new wakeup alarm at ${wakeupAlarm}`);
  await eightSleep.createAlarm(newAlarmPayload);

  console.log("[handler] Done");
};

// Only run locally if this script is invoked directly
if (require.main === module) {
  handler().then(console.log).catch(console.error);
}
