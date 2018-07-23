import moment from 'moment';
import 'moment-timezone';

import tz from 'timezone';
import newYorkTimeZone from 'timezone/America/New_York';

const ny = tz(newYorkTimeZone);

// export const toNewYorkTimezone = (time) => moment(ny(time, 'America/New_York'));
export const toNewYorkTimezone =  (time) => time.tz('America/New_York');
