import { CertificateTemplateFieldModel } from './certificate-template-field.model';
import { CertificateTemplateMode } from './certificate-template-mode.enum';

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
