import { ParticipantStatus } from './registration.enums';

export interface ParticipantModel {
  id: string;
  eventId: string;
  registrationId: string;
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
