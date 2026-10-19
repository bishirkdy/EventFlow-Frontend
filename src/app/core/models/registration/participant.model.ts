import { ParticipantStatus } from './participant-status.enum';
import { RegistrationScope } from './registration-scope.enum';

export interface ParticipantModel {
  id: string;
  eventId: string;
  registrationId: string;
  scopeType: RegistrationScope;
  scopeId: string | null;
  userId: string;
  participantNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  organization: string | null;
  designation: string | null;
  status: ParticipantStatus;
}
