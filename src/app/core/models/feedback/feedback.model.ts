export enum FeedbackTargetType {
  Event = 1,
  Session = 2,
  Speaker = 3,
  Venue = 4,
}

export interface SubmitFeedbackPayload {
  targetType: FeedbackTargetType;
  targetId: string | null;
  rating: number;
  comment: string | null;
}

export interface SubmitFeedbackResult {
  feedbackId: string;
  rating: number;
  submittedAtUtc: string;
}

export interface FeedbackRatingBucket {
  rating: number;
  count: number;
}

export interface FeedbackTargetSummary {
  targetType: FeedbackTargetType;
  targetId: string;
  targetName: string;
  count: number;
  averageRating: number;
}

export interface FeedbackItem {
  id: string;
  targetType: FeedbackTargetType;
  targetId: string;
  targetName: string;
  rating: number;
  comment: string | null;
  submittedAtUtc: string;
}

export interface FeedbackResults {
  totalCount: number;
  averageRating: number;
  ratingDistribution: FeedbackRatingBucket[];
  targets: FeedbackTargetSummary[];
  recentFeedback: FeedbackItem[];
}
