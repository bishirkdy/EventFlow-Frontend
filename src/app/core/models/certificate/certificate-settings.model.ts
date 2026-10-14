import { CertificateTemplateFieldModel } from './certificate-template-field.model';
import { CertificateTemplateMode } from './certificate-template-mode.enum';

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
