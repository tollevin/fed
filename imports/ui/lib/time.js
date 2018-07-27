import { moment } from 'meteor/momentjs:moment';

import tz from 'timezone';
import newYorkTimeZone from 'timezone/America/New_York';

const ny = tz(newYorkTimeZone);

export const toNewYorkTimezone= (time) => {
  const nyTimeZoneOffset = ny(time, 'America/New_York', '%z');
  return moment.utc(time).utcOffset(nyTimeZoneOffset);
}
