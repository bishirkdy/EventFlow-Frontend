import { AttendanceDayCountModel } from './attendance-day-count.model';
import { HourBucketModel } from './hour-bucket.model';

export interface AttendanceAnalyticsModel {
  eventId: string;
  totalCheckIns: number;
  distinctParticipants: number;
  checkedOut: number;
  currentlyInside: number;
  checkOutRatePercent: number;
  sessionsCovered: number;
  sectionsCovered: number;
  activeStaff: number;
  qrCheckIns: number;
  manualCheckIns: number;
  peakHour: number | null;
  peakHourCheckIns: number;
  checkInsByHour: HourBucketModel[];
  checkInsByDay: AttendanceDayCountModel[];
  avgDwellMinutes: number;
  firstCheckInAtUtc: string | null;
  lastCheckInAtUtc: string | null;
}
