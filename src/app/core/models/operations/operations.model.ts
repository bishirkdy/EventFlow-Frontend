export enum AttendanceScopeType {
  Event = 1,
  Section = 2,
  Session = 3,
}
export enum AttendanceMethod {
  Qr = 1,
  Manual = 2,
}
export enum NotificationStatus {
  Pending = 1,
  Processing = 2,
  Sent = 3,
  Failed = 4,
}
export interface AttendanceStaffModel {
  id: string;
  eventId: string;
  userId: string;
  email?: string;
  scopeType: AttendanceScopeType;
  scopeId: string | null;
  isActive: boolean;
}
export interface AttendanceModel {
  id: string;
  eventId: string;
  registrationId: string;
  participantId: string;
  sessionId: string | null;
  staffUserId: string;
  method: AttendanceMethod;
  checkedInAtUtc: string;
  checkedOutAtUtc: string | null;
}
export interface AttendanceDashboardModel {
  totalParticipants: number;
  checkedIn: number;
  checkedOut: number;
  currentlyInside: number;
  attendancePercentage: number;
}
export interface NotificationModel {
  id: string;
  eventId: string;
  userId: string | null;
  recipientEmail: string;
  subject: string;
  status: NotificationStatus;
  attemptCount: number;
  scheduledAtUtc: string;
  sentAtUtc: string | null;
  error: string | null;
}
export interface HourBucketModel {
  hour: number;
  count: number;
}
export interface AttendanceDayCountModel {
  date: string;
  count: number;
}
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
