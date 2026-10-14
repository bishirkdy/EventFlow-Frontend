export interface CertificateEligibilityItemModel {
  registrationId: string;
  userId: string;
  registrationNumber: string;
  participantName: string;
  email: string;
  registrationStatus: string;
  attendancePercent: number | null;
  alreadyIssued: boolean;
  eligible: boolean;
  reasons: string[];
}
