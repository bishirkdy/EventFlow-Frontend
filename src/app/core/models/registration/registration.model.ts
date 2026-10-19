import { ParticipantModel } from './participant.model';
import { RegistrationScope } from './registration-scope.enum';
import { RegistrationStatus } from './registration-status.enum';
import { TicketModel } from './ticket.model';

export interface RegistrationModel {
  id: string;
  eventId: string;
  userId: string;
  scopeType: RegistrationScope;
  scopeId: string | null;
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
