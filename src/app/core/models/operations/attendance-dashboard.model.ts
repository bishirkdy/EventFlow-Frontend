import { SessionAttendanceModel } from './session-attendance.model';

export interface AttendanceDashboardModel {
  totalParticipants: number;
  checkedIn: number;
  checkedOut: number;
  currentlyInside: number;
  attendancePercentage: number;
  sessions: SessionAttendanceModel[];
}
