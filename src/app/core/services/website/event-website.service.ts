import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { EventService } from '../event/event.service';
import { EventFeatureService } from '../event-feature/event-feature.service';
import { EventPageService } from '../event-page/event-page.service';
import { EventPageSectionService } from '../event-page-section/event-page-section.service';
import { SessionService } from '../session/session.service';
import { VenueService } from '../venue/venue.service';
import { NavigationItemService } from '../navigation-item/navigation-item.service';
import { SpeakerService } from '../speaker/speaker.service';
import { SponsorService } from '../sponsor/sponsor.service';

import { NavigationItemModel } from '../../models/navigation-item/navigation-item.model';
import { EventWebsiteData } from '../../models/website/event-website-data.model';

@Injectable({ providedIn: 'root' })
export class EventWebsiteService {
  private readonly eventService = inject(EventService);
  private readonly eventFeatureService = inject(EventFeatureService);
  private readonly eventPageService = inject(EventPageService);
  private readonly pageSectionService = inject(EventPageSectionService);
  private readonly sessionService = inject(SessionService);
  private readonly venueService = inject(VenueService);
  private readonly navigationItemService = inject(NavigationItemService);
  private readonly speakerService = inject(SpeakerService);
  private readonly sponsorService = inject(SponsorService);

  load(eventId: string, preview = false): Observable<EventWebsiteData> {
    const pages$ = preview
      ? this.eventPageService.getPreviewPages(eventId)
      : this.eventPageService.getPages(eventId);
    const pageSections$ = preview
      ? this.pageSectionService.getSectionsByEventPreview(eventId)
      : this.pageSectionService.getSectionsByEvent(eventId);

    return forkJoin({
      event: this.eventService.getEventById(eventId),
      features: this.eventFeatureService.getFeatures(eventId),
      pages: pages$,
      navigationItems: this.navigationItemService.getItems(eventId),
      pageSections: pageSections$.pipe(map((result) => result.data ?? [])),
    }).pipe(
      switchMap((response) => {
        const event = response.event.data ?? null;
        const features = response.features.data ?? [];
        const pages = response.pages.data ?? [];
        const navigationItems = response.navigationItems.data ?? [];
        const pageSections = response.pageSections;
        const enabled = new Set(
          features
            .filter((feature) => feature.isEnabled)
            .map((feature) => feature.featureCode.toLowerCase()),
        );

        const sessions$ = enabled.has('sessions')
          ? this.sessionService.getSessions(eventId).pipe(map((result) => result.data ?? []))
          : of([]);
        const venues$ = enabled.has('venues')
          ? this.venueService.getVenues(eventId).pipe(map((result) => result.data ?? []))
          : of([]);
        const speakers$ = enabled.has('speakers')
          ? this.speakerService
              .getSpeakers(eventId)
              .pipe(map((result) => (result.data ?? []).filter((speaker) => speaker.isActive)))
          : of([]);
        const sponsors$ = enabled.has('sponsors')
          ? this.sponsorService
              .getSponsors(eventId)
              .pipe(map((result) => (result.data ?? []).filter((sponsor) => sponsor.isActive)))
          : of([]);

        return forkJoin({
          sessions: sessions$,
          venues: venues$,
          speakers: speakers$,
          sponsors: sponsors$,
        }).pipe(
          map(({ sessions, venues, speakers, sponsors }): EventWebsiteData => ({
            event,
            images: event?.images ?? [],
            features,
            pages,
            pageSections,
            sessions,
            venues,
            speakers,
            sponsors,
            navigationItems,
          })),
        );
      }),
    );
  }
}
