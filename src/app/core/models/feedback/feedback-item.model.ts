import { FeedbackTargetType } from './feedback-target-type.enum';

export interface FeedbackItem {
  id: string;
  targetType: FeedbackTargetType;
  targetId: string;
  targetName: string;
  rating: number;
  comment: string | null;
  submittedAtUtc: string;
}
