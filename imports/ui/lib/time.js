import moment from 'moment';
import tz from 'timezone';
import newYorkTimeZone from 'timezone/America/New_York';

const ny = tz(newYorkTimeZone);

export const toNewYorkTimezone= (time) => moment(ny(time, 'America/New_York'));