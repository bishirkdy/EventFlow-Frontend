import { FeedbackTargetType } from './feedback-target-type.enum';

export interface FeedbackTargetSummary {
  targetType: FeedbackTargetType;
  targetId: string;
  targetName: string;
  count: number;
  averageRating: number;
}
