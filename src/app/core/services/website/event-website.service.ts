import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { EventService } from '../event/event.service';
import { EventPageService } from '../event-page/event-page.service';
import { SectionService } from '../section/section.service';
import { SessionService } from '../session/session.service';
import { VenueService } from '../venue/venue.service';
import { NavigationMenuService } from '../navigation-menu/navigation-menu.service';
import { EventWebsiteData } from '../../models/website/event-website-data.model';

@Injectable({ providedIn: 'root' })
export class EventWebsiteService {
  private readonly eventService = inject(EventService);
  private readonly pageService = inject(EventPageService);
  private readonly sectionService = inject(SectionService);
  private readonly sessionService = inject(SessionService);
  private readonly venueService = inject(VenueService);
  private readonly navigationMenuService = inject(NavigationMenuService);

  load(eventId: string): Observable<EventWebsiteData> {
    return forkJoin({
      event: this.eventService.getEventById(eventId),
      pages: this.pageService.getPages(eventId),
      sections: this.sectionService.getSections(eventId),
      sessions: this.sessionService.getSessions(eventId),
      venues: this.venueService.getVenues(eventId),
      navigationMenus: this.navigationMenuService.getMenus(eventId),
    }).pipe(
      map((r: any) => ({
        event: r.event?.data ?? r.event,
        images: r.event?.data?.images ?? r.event?.images ?? [],
        pages: r.pages?.data ?? [],
        pageSections: [],
        sections: r.sections?.data ?? [],
        sessions: r.sessions?.data ?? [],
        venues: r.venues?.data ?? [],
        navigationMenus: r.navigationMenus?.data ?? [],
        navigationItems: [],
      }))
    );
  }
}
