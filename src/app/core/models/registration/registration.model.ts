import { RegistrationStatus } from './registration.enums';
import { ParticipantModel } from './participant.model';
import { TicketModel } from './ticket.model';


export interface RegistrationModel {
  id: string;
  eventId: string;
  userId: string;
  registrationNumber: string;
  status: RegistrationStatus;
  registeredAtUtc: string;
  approvedAtUtc: string | null;
  rejectedAtUtc: string | null;
  cancelledAtUtc: string | null;
  waitlistedAtUtc: string | null;
  waitlistPosition: number | null;
  rejectionReason: string | null;
  cancellationReason: string | null;
  participant: ParticipantModel | null;
  ticket: TicketModel | null;
}
