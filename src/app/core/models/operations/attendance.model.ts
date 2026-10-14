import { AttendanceMethod } from './attendance-method.enum';

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
