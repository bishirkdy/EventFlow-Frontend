import { ParticipantStatus } from './participant-status.enum';

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
