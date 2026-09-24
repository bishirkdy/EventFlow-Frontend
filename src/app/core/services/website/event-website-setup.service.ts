import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, from, of } from 'rxjs';
import { catchError, concatMap, map, switchMap, toArray } from 'rxjs/operators';

import { EventPageService } from '../event-page/event-page.service';
import { EventPageSectionService } from '../event-page-section/event-page-section.service';
import { NavigationMenuService } from '../navigation-menu/navigation-menu.service';
import { NavigationItemService } from '../navigation-item/navigation-item.service';
import { CreateEventPageModel } from '../../models/event-page/create-event-page.model';
import { CreatePageSectionModel } from '../../models/event-page-section/CreatePageSectionModel';
import { CreateNavigationItemModel } from '../../models/navigation-item/create-navigation-item';
interface PageSeed extends CreateEventPageModel {
  sections: Array<Pick<CreatePageSectionModel, 'sectionType' | 'title' | 'content' | 'displayOrder'>>;
}

interface CreatedPage { id: string; name: string; }

interface NavigationSeed {
  label: string;
  pageName?: string;
  url?: string;
  displayOrder: number;
}

interface EventWebsiteSeed {
  pages: PageSeed[];
  navigation: NavigationSeed[];
}

const TYPE_IDS = {
  wedding: '11111111-1111-1111-1111-111111111111',
  conference: '22222222-2222-2222-2222-222222222222',
  education: '33333333-3333-3333-3333-333333333333',
  festival: '44444444-4444-4444-4444-444444444444',
  sports: '55555555-5555-5555-5555-555555555555',
} as const;

@Injectable({ providedIn: 'root' })
export class EventWebsiteSetupService {
  private readonly pageService = inject(EventPageService);
  private readonly pageSectionService = inject(EventPageSectionService);
  private readonly menuService = inject(NavigationMenuService);
  private readonly itemService = inject(NavigationItemService);

  setup(eventId: string, eventTypeId: string): Observable<void> {
    const seed = this.seedFor(eventTypeId);

    return this.pageService.getPages(eventId).pipe(
      switchMap((existing) => {
        if ((existing.data ?? []).length > 0) {
          return of(undefined);
        }

        return from(seed.pages).pipe(
          concatMap((pageSeed) => this.createPage(eventId, pageSeed)),
          toArray(),
          switchMap((pages) => this.createMainNavigation(eventId, pages, seed.navigation)),
        );
      }),
      catchError((error) => {
        console.error('Event website setup failed:', error);
        return of(undefined);
      }),
    );
  }

  private createPage(eventId: string, seed: PageSeed): Observable<CreatedPage | null> {
    return this.pageService.createPage(eventId, {
      name: seed.name,
      slug: seed.slug,
      pageType: seed.pageType,
      displayOrder: seed.displayOrder,
    }).pipe(
      switchMap((response) => {
        const pageId = response.data;
        if (!pageId) return of(null);

        return from(seed.sections).pipe(
          concatMap((section) =>
            this.pageSectionService.createSection(pageId, section).pipe(catchError(() => of(null))),
          ),
          toArray(),
          switchMap(() => this.pageService.publishPage(eventId, pageId)),
          map(() => ({ id: pageId, name: seed.name })),
        );
      }),
      catchError((error) => {
        console.error(`Failed to seed page ${seed.name}:`, error);
        return of(null);
      }),
    );
  }

  private createMainNavigation(
    eventId: string,
    pages: Array<CreatedPage | null>,
    navigation: NavigationSeed[],
  ): Observable<void> {
    return this.menuService.getMenus(eventId).pipe(
      switchMap((existing) => {
        const primary = (existing.data ?? []).find((menu) => {
          const location = menu.location.trim().toLowerCase();
          return location === 'header' || location === 'main' || location === 'primary';
        });

        if (primary) {
          return of(undefined);
        }

        return this.menuService.createMenu(eventId, {
          name: 'Main Navigation',
          location: 'header',
        }).pipe(
          switchMap((response) => {
            const menuId = response.data;
            if (!menuId) return of(undefined);

            return from(navigation).pipe(
              concatMap((item) => {
                const page = item.pageName
                  ? pages.find((candidate) => candidate?.name === item.pageName)
                  : null;

                const request: CreateNavigationItemModel = {
                  label: item.label,
                  pageId: page?.id ?? null,
                  url: item.url ?? null,
                  displayOrder: item.displayOrder,
                  openInNewTab: false,
                };

                return this.itemService.createItem(menuId, request).pipe(
                  catchError((error) => {
                    console.error(`Failed to seed navigation item ${item.label}:`, error);
                    return of(null);
                  }),
                );
              }),
              toArray(),
              map(() => undefined),
            );
          }),
        );
      }),
      catchError((error) => {
        console.error('Failed to seed main navigation:', error);
        return of(undefined);
      }),
    );
  }

  private seedFor(eventTypeId: string): EventWebsiteSeed {
    if (eventTypeId === TYPE_IDS.wedding) {
      return {
        pages: [
          {
            name: 'Home', slug: 'home', pageType: 'Home', displayOrder: 0,
            sections: [
              { sectionType: 'hero', title: 'A day to remember', content: 'Welcome to our celebration. Everything you need to know about the day is here.', displayOrder: 0 },
              { sectionType: 'text', title: 'The Couple', content: 'Two stories, one journey, and a celebration shared with the people who matter most.', displayOrder: 1 },
              { sectionType: 'text', title: 'Wedding Details', content: 'Join us for a beautiful celebration. Check the date, time, venue and RSVP details before the day.', displayOrder: 2 },
              { sectionType: 'gallery', title: 'Moments', content: 'A small collection of memories from the celebration.', displayOrder: 3 },
            ],
          },
          {
            name: 'Venue', slug: 'venue', pageType: 'Venue', displayOrder: 1,
            sections: [
              { sectionType: 'venue', title: 'Venue', content: 'Find the celebration venue, address and essential location details here.', displayOrder: 0 },
            ],
          },
          {
            name: 'RSVP', slug: 'rsvp', pageType: 'RSVP', displayOrder: 2,
            sections: [
              { sectionType: 'rsvp', title: 'We hope you can join us.', content: 'Please confirm your attendance so we can prepare a place for you.', displayOrder: 0 },
            ],
          },
        ],
        navigation: [
          { label: 'Venue', pageName: 'Venue', displayOrder: 0 },
          { label: 'RSVP', pageName: 'RSVP', displayOrder: 1 },
        ],
      };
    }

    if (eventTypeId === TYPE_IDS.conference) {
      return this.seedProgramEvent('Conference', [
        'Home', 'Program', 'Venues', 'Speakers', 'Sponsors', 'Registration', 'Feedback',
      ]);
    }

    if (eventTypeId === TYPE_IDS.education) {
      return this.seedProgramEvent('Education', [
        'Home', 'Program', 'Venues', 'Registration', 'Attendance', 'Certificates', 'Feedback',
      ]);
    }

    if (eventTypeId === TYPE_IDS.festival) {
      return this.seedProgramEvent('Festival', [
        'Home', 'Program', 'Venues', 'Sponsors', 'Registration', 'Attendance', 'Gallery',
      ]);
    }

    return this.seedProgramEvent('Sports', [
      'Home', 'Program', 'Venues', 'Registration', 'Attendance', 'Gallery', 'Certificates',
    ]);
  }

  private seedProgramEvent(typeName: string, pageNames: string[]): EventWebsiteSeed {
    const pages: PageSeed[] = pageNames.map((name, index) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      pageType: name,
      displayOrder: index,
      sections: this.sectionsForProgramPage(name, typeName),
    }));

    return {
      pages,
      navigation: pageNames
        .filter((name) => name.toLowerCase() !== 'home')
        .map((name, index) => ({ label: name, pageName: name, displayOrder: index })),
    };
  }

  private sectionsForProgramPage(name: string, typeName: string): PageSeed['sections'] {
    const common = `This ${typeName.toLowerCase()} is managed through EventFlow. Check the event information, programme, venue details and participation options below.`;

    switch (name) {
      case 'Home':
        return [
          { sectionType: 'hero', title: `${typeName} experience`, content: common, displayOrder: 0 },
          { sectionType: 'text', title: 'About the event', content: 'A clear, focused event experience with the essential information presented in one place.', displayOrder: 1 },
          { sectionType: 'image', title: 'Event highlights', content: 'Explore the event atmosphere and highlights.', displayOrder: 2 },
        ];
      case 'Program':
        return [
          { sectionType: 'schedule', title: 'Programme', content: 'Explore sessions, timings and locations for the event programme.', displayOrder: 0 },
        ];
      case 'Venues':
        return [
          { sectionType: 'venue', title: 'Event venues', content: 'Find venue addresses, capacity and location information.', displayOrder: 0 },
        ];
      case 'Gallery':
        return [
          { sectionType: 'gallery', title: 'Event gallery', content: 'Browse event images and highlights.', displayOrder: 0 },
        ];
      case 'Speakers':
        return [{ sectionType: 'text', title: 'Speakers', content: 'Speaker information can be added to this page as the programme is finalized.', displayOrder: 0 }];
      case 'Sponsors':
        return [{ sectionType: 'text', title: 'Sponsors', content: 'Sponsor information and partner recognition can be published here.', displayOrder: 0 }];
      case 'Registration':
        return [{ sectionType: 'text', title: 'Registration', content: 'Registration information and participation instructions for attendees.', displayOrder: 0 }];
      case 'Attendance':
        return [{ sectionType: 'text', title: 'Attendance', content: 'Attendance information and event-day participation guidance.', displayOrder: 0 }];
      case 'Certificates':
        return [{ sectionType: 'text', title: 'Certificates', content: 'Certificate information for eligible participants.', displayOrder: 0 }];
      case 'Feedback':
        return [{ sectionType: 'text', title: 'Feedback', content: 'Share your experience and help improve future events.', displayOrder: 0 }];
      default:
        return [{ sectionType: 'text', title: name, content: common, displayOrder: 0 }];
    }
  }
}
