import { Component, computed, input } from '@angular/core';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';
import { NavigationItemModel } from '../../../../core/models/navigation-item/navigation-item.model';
import { EventPageModel } from '../../../../core/models/event-page/event-page.model';

@Component({
  selector: 'app-event-website-shell',
  standalone: true,
  templateUrl: './event-website-shell.html',
  styleUrl: './event-website-shell.css',
})
export class EventWebsiteShell {
  readonly data = input.required<EventWebsiteData>();
  readonly pageSlug = input<string | null>(null);

  readonly pages = computed(() =>
    this.data().pages
      .filter(page => page.isPublished)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  );

  /** The website home is the page explicitly identified as Home, never an arbitrary page. */
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
    return pages.find(page => page.slug.trim().toLowerCase() === slug) ?? this.homePage();
  });

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
    const publishedIds = new Set(pages.map(page => page.id));

    const primaryMenuIds = new Set(
      this.data().navigationMenus
        .filter(menu => ['header', 'main', 'primary'].includes(menu.location.trim().toLowerCase()))
        .map(menu => menu.id),
    );

    return this.data().navigationItems
      .filter(item => {
        if (!item.isVisible) return false;
        if (item.pageId && !publishedIds.has(item.pageId)) return false;
        if (primaryMenuIds.size > 0 && !primaryMenuIds.has(item.navigationMenuId)) return false;

        const label = item.label.trim().toLowerCase();
        if (label === 'home') return false;
        if (item.pageId && item.pageId === homeId) return false;

        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  });

  readonly theme = computed(() => {
    const type = (this.data().event?.eventType ?? '').trim().toLowerCase();
    if (type === 'conference') return 'conference';
    if (type === 'education') return 'education';
    if (type === 'festival') return 'festival';
    if (type === 'sports') return 'sports';
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
    if (type === 'gallery' || type === 'image-gallery' || value.includes('gallery') || value.includes('photo')) return 'gallery';
    if (type === 'rsvp' || value.includes('rsvp') || value.includes('registration')) return 'rsvp';
    return 'content';
  }

  normalizedTitle(value: string | null | undefined): string {
    return value?.trim().replace(/^the\s+/i, '') ?? '';
  }

  sectionId(sectionType: string | null | undefined, title: string | null | undefined): string {
    const kind = this.sectionKind(sectionType, title);
    return kind === 'content' ? '' : kind;
  }

  imageForSection(imageUrl: string | null | undefined, index: number): string | null {
    return imageUrl || this.data().images[index % Math.max(this.data().images.length, 1)]?.url || null;
  }

  imageForVenue(venue: { imageUrl?: string | null }): string | null {
    return venue.imageUrl?.trim() || null;
  }

  imageForSession(session: { imageUrl?: string | null }): string | null {
    return session.imageUrl?.trim() || null;
  }

  displayDescription(value: string | null | undefined, fallback = ''): string {
    const text = value?.trim() ?? '';
    if (!text || /lorem ipsum|dummy text/i.test(text)) return fallback;
    return text;
  }

  pageHref(item: NavigationItemModel): string {
    const eventId = this.data().event?.id;
    if (!eventId) return '#';

    const rawUrl = item.url?.trim();
    if (rawUrl) {
      if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
      if (rawUrl.startsWith('#')) return `/events/${eventId}${rawUrl}`;

      const slug = rawUrl.replace(/^\/+/, '').split(/[?#]/)[0];
      if (slug) return `/events/${eventId}/${encodeURIComponent(slug)}`;
    }

    if (item.pageId) {
      const page = this.pages().find(candidate => candidate.id === item.pageId);
      if (page && page.id !== this.homePage()?.id) {
        return `/events/${eventId}/${encodeURIComponent(page.slug)}`;
      }
    }

    return `/events/${eventId}`;
  }

  isActive(item: NavigationItemModel): boolean {
    return !!item.pageId && item.pageId === this.page()?.id;
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
