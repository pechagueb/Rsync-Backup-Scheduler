
export interface RsyncOptions {
  archive: boolean;
  verbose: boolean;
  compress: boolean;
  delete: boolean;
  custom: string;
}

export enum ScheduleType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export interface Schedule {
  type: ScheduleType;
  minute: number;
  hour: number;
  dayOfMonth: number;
  dayOfWeek: number;
}

export interface BackupJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  rsyncOptions: RsyncOptions;
  schedule: Schedule;
}
