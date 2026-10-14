import { CertificateEligibilityItemModel } from './certificate-eligibility-item.model';

export interface CertificateEligibilityModel {
  totalRegistrations: number;
  eligibleCount: number;
  alreadyIssuedCount: number;
  ineligibleCount: number;
  items: CertificateEligibilityItemModel[];
}
