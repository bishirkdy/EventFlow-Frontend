import { RegistrationTrendPointModel } from './registration-trend-point.model';
import { RejectionReasonModel } from './rejection-reason.model';

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
