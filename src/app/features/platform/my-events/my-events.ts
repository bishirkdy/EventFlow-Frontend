import { Component, inject, signal, PLATFORM_ID, OnInit } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { EventService } from '../../../core/services/event/event.service';
import { EventRoleService } from '../../../core/services/event-role/event-role.service';
import { RegistrationService } from '@/core/services/registration/registration.service';
import { NotificationService } from '../../../core/services/ui/notification.service';

import { Event } from '../../../core/models/event';
import { workspaceUrlForRoles } from '../../../core/routing/event-route.util';
import { TruncateWordsPipe } from '@/shared/components/pipes/truncate-words.pipe';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { FeedbackComponent } from '../feedback/feedback';
import { createAsyncAction } from '@/core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-my-events',
  imports: [DatePipe, RouterLink, TruncateWordsPipe, FeedbackComponent, CapitalizePipe, AsyncState],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css'
})
export class MyEvents implements OnInit {
  events = signal<Event[]>([]);

  private readonly eventService = inject(EventService);
  private readonly roleService = inject(EventRoleService);
  private readonly registrationService = inject(RegistrationService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly registeredEventIds = signal<string[]>([]);
  private readonly restrictedEventIds = signal<string[]>([]);
  private readonly rolesLoadedEventIds = signal<string[]>([]);
  private readonly registrationIds = signal<Record<string, string>>({});

  readonly showFeedbackPopup = signal(false);
  readonly feedbackEventId = signal<string | null>(null);

  private readonly restrictedRoles = [
    'owner',
    'organizer',
    'eventadmin',
    'photographer',
    'staff',
    'attendancestaff'
  ];

  private readonly openAction = createAsyncAction(
    (event: Event) =>
      this.roleService
        .getMyRoles(event.id)
        .pipe(map((response) => ({ event, roles: response.data ?? [] }))),
    {
      toastErrors: true,
      errorFallback: 'Failed to open event',
      onSuccess: ({ event, roles }) => {
        const url = workspaceUrlForRoles(event.id, roles);

        if (!url) {
          this.notify.error("You don't have access to this event.");
          return;
        }

        void this.router.navigate(url);
      }
    }
  );

  private readonly loadAction = createAsyncAction(() => this.eventService.getMyEvents(), {
    errorFallback: 'Failed to load events',
    onSuccess: (response) => {
      const events = response.data ?? [];

      this.events.set(events);

      for (const event of events) {
        this.loadEventRoles(event.id);
        this.loadRegistrationStatus(event.id);
      }
    }
  });

  readonly loading = this.loadAction.pending;
  readonly error = this.loadAction.error;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadEvents();
  }

  openEvent(event: Event): void {
    this.openAction.run(event);
  }

  loadEvents(): void {
    this.loadAction.run();
  }

  goToEvents(): void {
    void this.router.navigate(['/events']);
  }

  private loadEventRoles(eventId: string): void {
    this.roleService.getMyRoles(eventId).subscribe({
      next: (response) => {
        const roles = (response.data ?? []).map((role) => role.roleName.trim().toLowerCase());

        if (roles.some((role) => this.restrictedRoles.includes(role))) {
          this.restrictedEventIds.update((ids) =>
            ids.includes(eventId) ? ids : [...ids, eventId]
          );
        }

        this.rolesLoadedEventIds.update((ids) => (ids.includes(eventId) ? ids : [...ids, eventId]));
      },
      error: () => {
        // Non-critical: roles only hide restricted events from the list.
      }
    });
  }

  private loadRegistrationStatus(eventId: string): void {
    this.registrationService.getMine(eventId).subscribe({
      next: (response) => {
        const registrations = response.data ?? [];

        if (registrations.length > 0) {
          const registration = registrations[0];

          this.registeredEventIds.update((ids) =>
            ids.includes(eventId) ? ids : [...ids, eventId]
          );

          this.registrationIds.update((ids) => ({
            ...ids,
            [eventId]: registration.id
          }));
        }
      },
      error: () => {
        // Non-critical: registration status only decorates the event card.
      }
    });
  }

  isRegistered(eventId: string): boolean {
    return this.registeredEventIds().includes(eventId);
  }

  isEligibleForParticipantActions(eventId: string): boolean {
    return (
      this.rolesLoadedEventIds().includes(eventId) && !this.restrictedEventIds().includes(eventId)
    );
  }

  getRegistrationId(eventId: string): string {
    return this.registrationIds()[eventId] ?? '';
  }

  registrationLink(eventId: string): string[] {
    if (this.isRegistered(eventId)) {
      const registrationId = this.getRegistrationId(eventId);

      return ['/events', eventId, 'registrations', registrationId];
    }

    return ['/events', eventId, 'register'];
  }

  openFeedbackPopup(eventId: string): void {
    this.feedbackEventId.set(eventId);
    this.showFeedbackPopup.set(true);
  }

  closeFeedbackPopup(): void {
    this.showFeedbackPopup.set(false);
    this.feedbackEventId.set(null);
  }
}
