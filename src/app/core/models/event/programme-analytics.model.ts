import { DayCountModel } from './day-count.model';
import { KeyCountModel } from './key-count.model';
import { SectionCountModel } from './section-count.model';
import { VenueLoadModel } from './venue-load.model';

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
