import { FeedbackTargetType } from './feedback-target-type.enum';

export interface SubmitFeedbackPayload {
  targetType: FeedbackTargetType;
  targetId: string | null;
  rating: number;
  comment: string | null;
}
