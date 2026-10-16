import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule, Home, Menu, X, LucideAlignHorizontalJustifyStart } from 'lucide-angular';
import { map } from 'rxjs';
import { ORGANIZER_NAVIGATION, OrganizerNavGroup } from '../../config/organizer-navigation';
import { EventService } from '../../../../core/services/event/event.service';
import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';
import { EventPageService } from '../../../../core/services/event-page/event-page.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { Event as EventModel } from '../../../../core/models/event';
import { TitleCasePipe } from '@angular/common';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-organizer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule , TitleCasePipe, CapitalizePipe],
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

  mobileMenuOpen = signal(false);

  // Lucide icons to the template
  readonly homeIcon = Home;
  readonly home = LucideAlignHorizontalJustifyStart
  readonly menuIcon = Menu;
  readonly closeIcon = X;

  private readonly eventAction = createAsyncAction(
    (eventId: string) =>
      this.eventService.getEventById(eventId).pipe(
        map((response) => ({ eventId, response })),
      ),
    {
      toastErrors: true,
      errorFallback: 'This event could not be loaded.',
      onError: () => this.showFallbackNavigation(),
      onSuccess: ({ eventId, response }) => {
        const event = response.data;
        if (!event) {
          this.showFallbackNavigation();
          this.notification.error('This event could not be loaded.');
          return;
        }

        this.event.set(event);
        this.organizerEventState.setEvent(event);
        this.loadNavigation(eventId);
        this.setupWebsite(eventId);
      },
    },
  );

  private readonly navAction = createAsyncAction(
    (eventId: string) => this.eventFeatureService.getFeatures(eventId),
    {
      onError: () => this.showFallbackNavigation(),
      onSuccess: (response) => {
        const features = response.data ?? [];

        const enabledFeatures = new Set(
          features.filter((feature) => feature.isEnabled).map((feature) => feature.featureCode),
        );

        const visibleGroups = ORGANIZER_NAVIGATION
          .map((group) => ({
            ...group,
            items: group.items.filter(
              (item) => !item.feature || enabledFeatures.has(item.feature),
            ),
          }))
          .filter((group) => group.items.length > 0);

        this.navGroups.set(visibleGroups);
      },
    },
  );

  readonly loading = computed(
    () => this.eventAction.pending() || this.navAction.pending(),
  );

  ngOnInit(): void {
    this.eventFeatureService.changed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((eventId) => {
        if (eventId === this.organizerEventState.eventId()) {
          this.loadNavigation(eventId);
        }
      });

    // Re-run whenever the event in the URL changes,
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.loadEvent(params.get('eventId')));

    this.destroyRef.onDestroy(() => this.organizerEventState.clear());
  }

  private loadEvent(eventId: string | null): void {
    if (!eventId) {
      this.showFallbackNavigation();
      return;
    }

    // Store event ID for child organizer pages
    this.organizerEventState.setEventId(eventId);

    this.eventAction.run(eventId);
  }

  // Creates the default pages, page sections and navigation items
  // for events that were created before they existed
  private setupWebsite(eventId: string): void {
    this.pageService.ensureWebsite(eventId).subscribe({
      error: () => {
        // Never block the workspace on background setup.
      },
    });
  }

  private loadNavigation(eventId: string): void {
    this.navAction.run(eventId);
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
