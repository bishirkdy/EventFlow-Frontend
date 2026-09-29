export interface TicketModel {
  id: string;
  registrationId: string;
  participantId: string;
  ticketNumber: string;
  qrCodeValue: string;
  issuedAtUtc: string;
  revokedAtUtc: string | null;
  isActive: boolean;
}
