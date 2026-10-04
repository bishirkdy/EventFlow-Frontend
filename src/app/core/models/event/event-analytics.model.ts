import { Event } from './event.model';

export interface KeyCountModel {
  key: string;
  count: number;
}

export interface DayCountModel {
  date: string;
  count: number;
}

export interface SectionCountModel {
  sectionId: string;
  name: string;
  count: number;
}

export interface VenueLoadModel {
  venueId: string;
  name: string;
  capacity: number;
  sessionCount: number;
}

export interface PageSectionCountModel {
  pageId: string;
  pageName: string;
  count: number;
}

export interface ProgrammeAnalyticsModel {
  eventId: string;
  sectionsTotal: number;
  sectionsActive: number;
  sessionsTotal: number;
  sessionsPublished: number;
  sessionsDraft: number;
  sessionsWithVenue: number;
  sessionsWithoutVenue: number;
  sessionsWithSpeaker: number;
  sessionsWithoutSpeaker: number;
  speakerCoveragePercent: number;
  totalSessionHours: number;
  sessionsBySection: SectionCountModel[];
  sessionsByType: KeyCountModel[];
  sessionsByDay: DayCountModel[];
  speakersTotal: number;
  speakersActive: number;
  avgSessionsPerSpeaker: number;
  sponsorsTotal: number;
  sponsorsActive: number;
  sponsorsByLevel: KeyCountModel[];
  venuesTotal: number;
  venuesActive: number;
  totalVenueCapacity: number;
  venueLoad: VenueLoadModel[];
}

export interface ContentAnalyticsModel {
  eventId: string;
  pagesTotal: number;
  pagesPublished: number;
  pagesDraft: number;
  pageSectionsTotal: number;
  pageSectionsVisible: number;
  sectionsByPage: PageSectionCountModel[];
  sectionsByType: KeyCountModel[];
  navigationItemsTotal: number;
  navigationItemsVisible: number;
  photosTotal: number;
  photosVisible: number;
  photosPendingApproval: number;
  featuresTotal: number;
  featuresEnabled: number;
  enabledFeatureNames: string[];
}

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
