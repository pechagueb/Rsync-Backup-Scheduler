
import { Schedule, ScheduleType } from '../types';

export function generateCronString(schedule: Schedule): string {
  const { minute, hour, dayOfMonth, dayOfWeek, type } = schedule;

  switch (type) {
    case ScheduleType.HOURLY:
      return `${minute} * * * *`;
    case ScheduleType.DAILY:
      return `${minute} ${hour} * * *`;
    case ScheduleType.WEEKLY:
      return `${minute} ${hour} * * ${dayOfWeek}`;
    case ScheduleType.MONTHLY:
      return `${minute} ${hour} ${dayOfMonth} * *`;
    default:
      return '* * * * *';
  }
}

export function getScheduleDescription(schedule: Schedule): string {
    const { minute, hour, dayOfMonth, dayOfWeek, type } = schedule;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    switch (type) {
        case ScheduleType.HOURLY:
            return `Hourly at ${minute} minutes past the hour`;
        case ScheduleType.DAILY:
            return `Daily at ${time}`;
        case ScheduleType.WEEKLY:
            return `Weekly on ${days[dayOfWeek]} at ${time}`;
        case ScheduleType.MONTHLY:
            return `Monthly on day ${dayOfMonth} at ${time}`;
        default:
            return 'Invalid schedule';
    }
}
