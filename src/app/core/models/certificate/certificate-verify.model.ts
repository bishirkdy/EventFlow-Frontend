export interface CertificateVerifyModel {
  certificateNumber: string;
  participantName: string;
  eventName: string;
  status: string;
  isValid: boolean;
  issuedAtUtc: string;
  revokedAtUtc: string | null;
}
