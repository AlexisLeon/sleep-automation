import { DateTime } from "luxon";
import { WhoopDateTime } from "./whoop/types";
import { ESTime } from "./eightlseep/types";

/**
 * Takes a whoop time and timezone offset and returns a date
 * @param time - "07:00:00"
 * @param tzOffset "-0600"
 */
export function newWhoopTime(time: WhoopDateTime, tzOffset: string): DateTime {
  const t = DateTime.fromFormat(`${time}${tzOffset}`, "HH:mm:ssZZZ");

  if (!t.isValid) {
    console.error("parsed invalid luxon date", { time, tzOffset });
    throw new Error("parsed invalid luxon date");
  }

  return t;
}

/**
 * takes a DateTime dt and a timezone as Americas/New_York and returns the time of dt in that timezone
 */
export const newEightSleepTime = (dt: DateTime, tz: string): ESTime => {
  return dt.setZone(tz).toFormat("hh:mm':00'");
}
