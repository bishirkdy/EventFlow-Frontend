import { AttendanceScopeType } from './attendance-scope-type.enum';

export interface AttendanceStaffModel {
  id: string;
  eventId: string;
  userId: string;
  email?: string;
  scopeType: AttendanceScopeType;
  scopeId: string | null;
  isActive: boolean;
}
