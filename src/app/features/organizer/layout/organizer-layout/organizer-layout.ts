import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LucideAngularModule, Home, Menu, X } from 'lucide-angular';

import { ORGANIZER_NAVIGATION, OrganizerNavGroup } from '../../config/organizer-navigation';

import { EventService } from '../../../../core/services/event/event.service';
import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';
import { EventPageService } from '../../../../core/services/event-page/event-page.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

import { Event as EventModel } from '../../../../core/models/event/event.model';

@Component({
  selector: 'app-organizer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './organizer-layout.html',
  styleUrl: './organizer-layout.css',
})
export class OrganizerLayout {
  private readonly organizerEventState = inject(OrganizerEventStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly eventFeatureService = inject(EventFeatureService);
  private readonly pageService = inject(EventPageService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  navGroups = signal<OrganizerNavGroup[]>([]);

  event = signal<EventModel | null>(null);

  loading = signal(true);

  mobileMenuOpen = signal(false);

  // Lucide icons to the template
  readonly homeIcon = Home;
  readonly menuIcon = Menu;
  readonly closeIcon = X;

  ngOnInit(): void {
    this.eventFeatureService.changed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((eventId) => {
        if (eventId === this.organizerEventState.eventId()) {
          this.loadNavigation(eventId);
        }
      });

    // Re-run whenever the event in the URL changes,
    // otherwise switching events keeps the previous event in memory.
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.loadEvent(params.get('eventId')));

    this.destroyRef.onDestroy(() => this.organizerEventState.clear());
  }

  private loadEvent(eventId: string | null): void {
    if (!eventId) {
      this.showFallbackNavigation();
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    // Store event ID for child organizer pages
    this.organizerEventState.setEventId(eventId);

    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        const event = response.data;
        if (!event) {
          this.loading.set(false);
          this.showFallbackNavigation();
          this.notification.error('This event could not be loaded.');
          return;
        }

        this.event.set(event);
        this.organizerEventState.setEvent(event);
        this.loadNavigation(eventId);
        this.setupWebsite(eventId);
      },

      error: () => {
        this.loading.set(false);
        this.showFallbackNavigation();
        this.notification.error('This event could not be loaded.');
      },
    });
  }

  // Creates the default pages, page sections and navigation items
  // for events that were created before they existed. It is idempotent.
  private setupWebsite(eventId: string): void {
    this.pageService.ensureWebsite(eventId).subscribe({
      error: () => {
        // Never block the workspace on background setup.
      },
    });
  }

  private loadNavigation(eventId: string): void {
    this.eventFeatureService.getFeatures(eventId).subscribe({
      next: (response) => {
        const features = response.data ?? [];

        /*
         * Create a Set containing the codes
         * of all enabled features.
         *
         * Example:
         * {
         *   'schedule',
         *   'sessions',
         *   'venues',
         *   'gallery'
         * }
         */
        const enabledFeatures = new Set(
          features.filter((feature) => feature.isEnabled).map((feature) => feature.featureCode),
        );

        /*
         * Show:
         *
         * 1. Items without a feature requirement
         * 2. Items whose required feature is enabled
         */
        const visibleGroups = ORGANIZER_NAVIGATION
          .map((group) => ({
            ...group,
            items: group.items.filter(
              (item) => !item.feature || enabledFeatures.has(item.feature),
            ),
          }))
          .filter((group) => group.items.length > 0);

        this.navGroups.set(visibleGroups);
        this.loading.set(false);
      },

      error: () => {
        // If feature loading fails, show only navigation items
        // that don't depend on a feature.
        this.showFallbackNavigation();
        this.loading.set(false);
      },
    });
  }

  private showFallbackNavigation(): void {
    this.navGroups.set(
      ORGANIZER_NAVIGATION.map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.feature),
      })).filter((group) => group.items.length > 0),
    );
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
