import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LucideAngularModule, Menu, X } from 'lucide-angular';

import { ORGANIZER_NAVIGATION, OrganizerNavItem } from '../../config/organizer-navigation';

import { EventService } from '../../../../core/services/event/event.service';
import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';
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
  private readonly destroyRef = inject(DestroyRef);
  navItems = signal<OrganizerNavItem[]>([]);

  event = signal<EventModel | null>(null);

  loading = signal(true);

  mobileMenuOpen = signal(false);

  // Lucide icons to the template
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
    const eventId = this.route.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.loading.set(false);
      return;
    }

    // Store event ID for child organizer pages
    this.organizerEventState.setEventId(eventId);
    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        const event = response.data;
        if (!event) {
          this.loading.set(false);
          return;
        }

        this.event.set(event);
        this.organizerEventState.setEvent(event);
        this.loadNavigation(eventId);
      },

      error: (error: unknown) => {
        console.error('Failed to load event:', error);

        this.loading.set(false);
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
        const visibleNavigation = ORGANIZER_NAVIGATION.filter(
          (item) => !item.feature || enabledFeatures.has(item.feature),
        );

        this.navItems.set(visibleNavigation);

        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load event features:', error);

        /*
         * If feature loading fails,
         * show only navigation items
         * that don't depend on a feature.
         */
        this.navItems.set(ORGANIZER_NAVIGATION.filter((item) => !item.feature));

        this.loading.set(false);
      },
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
