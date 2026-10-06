import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { EventPageModel } from '../../../../core/models/event-page/event-page.model';

@Component({
  selector: 'app-event-website-shell',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './event-website-shell.html',
  styleUrl: './event-website-shell.css',
})
export class EventWebsiteShell {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);
  readonly preview = input(false);

  readonly pages = computed(() =>
    this.data().pages
      .filter(page => this.preview() || page.isPublished)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  );

  /* Finds the website Home page. */
  readonly homePage = computed<EventPageModel | null>(() => {
    const pages = this.pages();
    return pages.find(page =>
      page.slug.trim().toLowerCase() === 'home' ||
      page.name.trim().toLowerCase() === 'home' ||
      page.pageType.trim().toLowerCase() === 'home',
    ) ?? pages[0] ?? null;
  });

  readonly page = computed<EventPageModel | null>(() => {
    const slug = this.pageSlug()?.trim().toLowerCase();
    const pages = this.pages();

    if (!slug) return this.homePage();
    return pages.find(page => page.slug.trim().toLowerCase() === slug && this.isPageAvailable(page)) ?? this.homePage();
  });

  private isPageAvailable(page: EventPageModel): boolean {
    const value = `${page.slug} ${page.name} ${page.pageType}`.trim().toLowerCase();
    if (value.includes('speaker')) return this.hasFeature('speakers');
    if (value.includes('sponsor') || value.includes('partner')) return this.hasFeature('sponsors');
    return true;
  }

  readonly pageSections = computed(() => {
    const pageId = this.page()?.id;
    if (!pageId) return [];

    return this.data().pageSections
      .filter(section => section.pageId === pageId && section.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  });

  readonly navItems = computed(() => {
    const pages = this.pages();
    const homeId = this.homePage()?.id;
    const currentId = this.page()?.id;
    const linkedPageIds = new Set<string>();

    const hrefFor = (page: EventPageModel | null): string => {
      const eventId = this.data().event?.id;
      if (!eventId) return '#';
      if (!page || page.id === homeId) return `/events/${eventId}`;
      return `/events/${eventId}/${encodeURIComponent(page.slug)}`;
    };

    const links: { id: string; label: string; href: string; active: boolean }[] = [];

    // Navigation menu items come first, in their configured order.
    const orderedItems = [...this.data().navigationItems].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    for (const item of orderedItems) {
      if (!item.isVisible) continue;

      const page = item.pageId
        ? pages.find(candidate => candidate.id === item.pageId) ?? null
        : null;
      if (item.pageId && !page) continue;
      if (page && !this.isPageAvailable(page)) continue;
      if (page) linkedPageIds.add(page.id);

      links.push({
        id: `nav-${item.id}`,
        label: item.label,
        href: hrefFor(page),
        active: page ? page.id === currentId : false,
      });
    }

    // Every other published page follows in page order, so pages without a
    // navigation entry still appear in the navbar.
    for (const page of pages) {
      if (linkedPageIds.has(page.id)) continue;
      if (!this.isPageAvailable(page)) continue;

      links.push({
        id: `page-${page.id}`,
        label: page.name.trim() || page.slug,
        href: hrefFor(page),
        active: page.id === currentId,
      });
    }

    return links;
  });

  readonly theme = computed(() => {
    const eventType: string | undefined = this.data().event?.eventType;
    const typeValue = eventType ? eventType.trim() : '';
    const type = typeValue.toLowerCase();
    if (type.includes('conference')) return 'conference';
    if (type.includes('education') || type.includes('workshop')) return 'education';
    if (type.includes('festival') || type.includes('cultural')) return 'festival';
    if (type.includes('sports') || type.includes('competition')) return 'sports';
    if (type.includes('wedding') || type.includes('marriage')) return 'wedding';
    if (type.includes('symposium') || type.includes('summit')) return 'conference';
    if (type.includes('party') || type.includes('celebration')) return 'festival';
    return 'wedding';
  });

  readonly isHomePage = computed(() => this.page()?.id === this.homePage()?.id);

  hasFeature(code: string): boolean {
    return this.data().features.some(
      feature => feature.isEnabled && feature.featureCode.trim().toLowerCase() === code.trim().toLowerCase(),
    );
  }

  sectionKind(sectionType: string | null | undefined, title: string | null | undefined): string {
    const type = sectionType?.trim().toLowerCase() ?? '';
    const titleValue = title?.trim().toLowerCase() ?? '';
    const value = `${type} ${titleValue}`;

    if (type === 'hero' || value.includes('hero')) return 'hero';
    if (type === 'venue' || value.includes('venue') || value.includes('location')) return 'venue';
    if (type === 'schedule' || type === 'sessions' || value.includes('schedule') || value.includes('programme') || value.includes('program') || value.includes('session')) return 'schedule';
    if (type === 'speakers' || value.includes('speaker')) return 'speakers';
    if (type === 'sponsors' || value.includes('sponsor') || value.includes('partner')) return 'sponsors';
    if (type === 'gallery' || type === 'image-gallery' || value.includes('gallery') || value.includes('photo')) return 'gallery';
    if (type === 'rsvp' || value.includes('rsvp') || value.includes('registration')) return 'rsvp';
    return 'content';
  }

  normalizedTitle(value: string | null | undefined): string {
    const text = value?.trim() ?? '';

    if (!text) {
      return '';
    }

    return text
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .replace(/^the\s+/i, '')
      .trim();
  }

  sectionId(sectionType: string | null | undefined, title: string | null | undefined): string {
    const kind = this.sectionKind(sectionType, title);
    return kind === 'content' ? '' : kind;
  }

  imageForSection(imageUrl: string | null | undefined, index: number): string | null {
    return imageUrl || this.data().images[index % Math.max(this.data().images.length, 1)]?.url || null;
  }

  imageForVenue(venue: { imageUrl?: string | null }): string | null {
    return venue.imageUrl?.trim() || this.data().images?.[0]?.url || null;
  }

  imageForSession(session: { imageUrl?: string | null }): string | null {
    return session.imageUrl?.trim() || null;
  }

  displayDescription(value: string | null | undefined, fallback = ''): string {
    const text = value?.trim() ?? '';
    if (!text || /lorem ipsum|dummy text/i.test(text)) return fallback;
    return text;
  }

  registrationHref(): string {
    const eventId = this.data().event?.id;
    return eventId && this.hasFeature('registration')
      ? `/events/${eventId}/register`
      : "#";
  }

  photosHref(): string {
    const eventId = this.data().event?.id;
    return eventId ? `/events/${eventId}/gallery` : "#";
  }

  brandHref(): string {
    const eventId = this.data().event?.id;
    return eventId ? `/events/${eventId}` : '#';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: this.data().event?.timeZone,
    }).format(date);
  }

  formatTime(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric', minute: '2-digit', timeZone: this.data().event?.timeZone,
    }).format(date);
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: this.data().event?.timeZone,
    }).format(date);
  }
}