import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { EventService } from '../event/event.service';
import { EventFeatureService } from '../event-feature/event-feature.service';
import { EventPageService } from '../event-page/event-page.service';
import { EventPageSectionService } from '../event-page-section/event-page-section.service';
import { SectionService } from '../section/section.service';
import { SessionService } from '../session/session.service';
import { VenueService } from '../venue/venue.service';
import { NavigationMenuService } from '../navigation-menu/navigation-menu.service';
import { NavigationItemService } from '../navigation-item/navigation-item.service';

import { PageSectionModel } from '../../models/event-page-section/PageSectionModel';
import { NavigationItemModel } from '../../models/navigation-item/navigation-item.model';
import { EventWebsiteData } from '../../models/website/event-website-data.model';

@Injectable({
  providedIn: 'root',
})
export class EventWebsiteService {
  private readonly eventService = inject(EventService);
  private readonly eventFeatureService = inject(EventFeatureService);
  private readonly eventPageService = inject(EventPageService);
  private readonly pageSectionService = inject(EventPageSectionService);
  private readonly sectionService = inject(SectionService);
  private readonly sessionService = inject(SessionService);
  private readonly venueService = inject(VenueService);
  private readonly navigationMenuService = inject(NavigationMenuService);
  private readonly navigationItemService = inject(NavigationItemService);

  load(eventId: string): Observable<EventWebsiteData> {
    return forkJoin({
      event: this.eventService.getEventById(eventId),
      features: this.eventFeatureService.getFeatures(eventId),
      pages: this.eventPageService.getPages(eventId),
      sections: this.sectionService.getSections(eventId),
      sessions: this.sessionService.getSessions(eventId),
      venues: this.venueService.getVenues(eventId),
      navigationMenus: this.navigationMenuService.getMenus(eventId),
    }).pipe(
      switchMap((response) => {
        const event = response.event.data ?? null;
        const features = response.features.data ?? [];
        const pages = response.pages.data ?? [];
        const sections = response.sections.data ?? [];
        const sessions = response.sessions.data ?? [];
        const venues = response.venues.data ?? [];
        const navigationMenus = response.navigationMenus.data ?? [];

        const pageSectionRequests: Observable<PageSectionModel[]>[] = pages.map((page) =>
          this.pageSectionService.getSections(page.id).pipe(map((result) => result.data ?? [])),
        );

        const navigationItemRequests: Observable<NavigationItemModel[]>[] = navigationMenus.map(
          (menu) =>
            this.navigationItemService.getItems(menu.id).pipe(map((result) => result.data ?? [])),
        );

        const pageSections$ =
          pageSectionRequests.length > 0
            ? forkJoin(pageSectionRequests)
            : of([] as PageSectionModel[][]);

        const navigationItems$ =
          navigationItemRequests.length > 0
            ? forkJoin(navigationItemRequests)
            : of([] as NavigationItemModel[][]);

        return forkJoin({
          pageSections: pageSections$,
          navigationItems: navigationItems$,
        }).pipe(
          map(({ pageSections, navigationItems }): EventWebsiteData => ({
            event,
            images: event?.images ?? [],
            features,
            pages,
            pageSections: pageSections.flat(),
            sections,
            sessions,
            venues,
            navigationMenus,
            navigationItems: navigationItems.flat(),
          })),
        );
      }),
    );
  }
}
