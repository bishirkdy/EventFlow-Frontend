import { CertificateModel } from './certificate.model';

export interface CertificateGenerationResultModel {
  generated: number;
  skipped: number;
  failed: number;
  certificates: CertificateModel[];
  errors: string[];
}
