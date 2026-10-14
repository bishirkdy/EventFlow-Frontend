export type CertificateTemplateMode = 'Classic' | 'ImageTemplate';

export type CertificateFieldAlign = 'Left' | 'Center' | 'Right';

export interface CertificateTemplateFieldModel {
  key: string;
  text: string | null;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  fontSizePt: number;
  fontColor: string;
  bold: boolean;
  align: CertificateFieldAlign;
  fontFamily: string | null;
}

export interface CertificateSettingsModel {
  eventId: string;
  title: string;
  subtitle: string;
  signatoryName: string | null;
  signatoryTitle: string | null;
  themeColor: string;
  requireApprovedRegistration: boolean;
  minAttendancePercent: number | null;
  templateMode: CertificateTemplateMode;
  backgroundImageUrl: string | null;
  backgroundImageWidth: number;
  backgroundImageHeight: number;
  templateFields: CertificateTemplateFieldModel[];
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
  templateMode: CertificateTemplateMode;
  templateFields: CertificateTemplateFieldModel[];
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
  errors: string[];
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
