import { Event } from './event.model';

export interface EventOverviewAnalyticsModel {
  eventId: string;
  event: Event | null;
  sections: number;
  sessions: number;
  venues: number;
  speakers: number;
  sponsors: number;
  pages: number;
  pageSections: number;
  navigationItems: number;
  photos: number;
  photosVisible: number;
  feedbackCount: number;
  feedbackAverageRating: number;
  featuresEnabled: number;
  daysUntilStart: number;
  daysUntilEnd: number;
  computedAtUtc: string;
}
