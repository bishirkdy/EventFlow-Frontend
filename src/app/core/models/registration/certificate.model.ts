export interface CertificateSettingsModel {
  eventId: string;
  title: string;
  subtitle: string;
  signatoryName: string | null;
  signatoryTitle: string | null;
  themeColor: string;
  requireApprovedRegistration: boolean;
  minAttendancePercent: number | null;
  updatedAtUtc: string | null;
}

export interface CertificateSettingsRequest {
  title: string;
  subtitle: string;
  signatoryName: string | null;
  signatoryTitle: string | null;
  themeColor: string;
  requireApprovedRegistration: boolean;
  minAttendancePercent: number | null;
}

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

export interface CertificateEligibilityModel {
  totalRegistrations: number;
  eligibleCount: number;
  alreadyIssuedCount: number;
  ineligibleCount: number;
  items: CertificateEligibilityItemModel[];
}

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

export interface CertificateGenerationResultModel {
  generated: number;
  skipped: number;
  failed: number;
  certificates: CertificateModel[];
}

export interface GenerateCertificatesRequest {
  registrationIds: string[] | null;
}

export interface CertificateVerifyModel {
  certificateNumber: string;
  participantName: string;
  eventName: string;
  status: string;
  isValid: boolean;
  issuedAtUtc: string;
  revokedAtUtc: string | null;
}
