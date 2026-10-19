export interface SessionAttendanceModel {
  sessionId: string;
  totalParticipants: number;
  checkedIn: number;
  checkedOut: number;
  currentlyInside: number;
  attendancePercentage: number;
}
