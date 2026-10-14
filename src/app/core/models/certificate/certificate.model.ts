export interface CertificateModel {
  id: string;
  eventId: string;
  registrationId: string;
  certificateNumber: string;
  participantName: string;
  participantEmail: string;
  eventName: string;
  status: string;
  issuedAtUtc: string;
  revokedAtUtc: string | null;
}
