export interface RegistrationStatsModel {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  waitlisted: number;
  participants: number;
  activeTickets: number;
}

export interface RegistrationTrendPointModel {
  date: string;
  total: number;
  approved: number;
  pending: number;
}

export interface RejectionReasonModel {
  reason: string;
  count: number;
}

export interface RegistrationAnalyticsModel {
  eventId: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  waitlisted: number;
  participants: number;
  activeTickets: number;
  approvalRatePercent: number;
  rejectionRatePercent: number;
  waitlistRatePercent: number;
  avgApprovalHours: number;
  avgRejectionHours: number;
  registeredToday: number;
  registeredLast7Days: number;
  firstRegistrationAtUtc: string | null;
  lastRegistrationAtUtc: string | null;
  peakDay: RegistrationTrendPointModel | null;
  trend: RegistrationTrendPointModel[];
  topRejectionReasons: RejectionReasonModel[];
}

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

