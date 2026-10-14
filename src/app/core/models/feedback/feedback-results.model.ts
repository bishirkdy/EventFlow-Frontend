import { FeedbackRatingBucket } from './feedback-rating-bucket.model';
import { FeedbackItem } from './feedback-item.model';
import { FeedbackTargetSummary } from './feedback-target-summary.model';

export interface FeedbackResults {
  totalCount: number;
  averageRating: number;
  ratingDistribution: FeedbackRatingBucket[];
  targets: FeedbackTargetSummary[];
  recentFeedback: FeedbackItem[];
}
