import { NotificationStatus } from './notification-status.enum';

export interface NotificationModel {
  id: string;
  eventId: string;
  userId: string | null;
  recipientEmail: string;
  subject: string;
  status: NotificationStatus;
  attemptCount: number;
  scheduledAtUtc: string;
  sentAtUtc: string | null;
  error: string | null;
}
