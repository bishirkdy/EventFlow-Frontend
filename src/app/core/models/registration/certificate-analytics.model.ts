import { RegistrationTrendPointModel } from './registration-trend-point.model';

export interface CertificateAnalyticsModel {
  eventId: string;
  totalIssued: number;
  active: number;
  revoked: number;
  uniqueRecipients: number;
  approvedRegistrations: number;
  issuanceRatePercent: number;
  issuedToday: number;
  issuedLast7Days: number;
  firstIssuedAtUtc: string | null;
  lastIssuedAtUtc: string | null;
  issuedByDay: RegistrationTrendPointModel[];
}
