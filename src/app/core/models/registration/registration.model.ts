import { RegistrationStatus } from './registration.enums';
import { ParticipantModel } from './participant.model';
import { TicketModel } from './ticket.model';

export interface CreateRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  designation?: string | null;
  answers: Record<string, string>;
}

export interface UpdateRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  designation?: string | null;
  answers: Record<string, string>;
}

export interface RejectRegistrationRequest {
  reason: string;
}

export interface CancelRegistrationRequest {
  reason?: string | null;
}

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
