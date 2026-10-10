import { Component, inject, signal, PLATFORM_ID, OnInit } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { EventService } from '../../../core/services/event/event.service';
import { EventRoleService } from '../../../core/services/event-role/event-role.service';
import { RegistrationService } from '@/core/services/registration/registration.service';
import { NotificationService } from '../../../core/services/ui/notification.service';

import { Event } from '../../../core/models/event/event.model';
import { TruncateWordsPipe } from '@/shared/components/pipes/truncate-words.pipe';

@Component({
  selector: 'app-my-events',
  imports: [DatePipe, RouterLink, TruncateWordsPipe],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css',
})
export class MyEvents implements OnInit {
  events = signal<Event[]>([]);
  loading = signal(true);

  private readonly eventService = inject(EventService);
  private readonly roleService = inject(EventRoleService);
  private readonly registrationService = inject(RegistrationService);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly registeredEventIds = signal<string[]>([]);
  private readonly restrictedEventIds = signal<string[]>([]);
  private readonly rolesLoadedEventIds = signal<string[]>([]);

  private readonly restrictedRoles = [
    'owner',
    'organizer',
    'eventadmin',
    'photographer',
    'staff',
    'attendancestaff',
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    this.loadEvents();
  }

  openEvent(event: Event): void {
    this.roleService.getMyRoles(event.id).subscribe({
      next: (response) => {
        const roles = (response.data ?? []).map((role) => role.roleName.trim().toLowerCase());

        if (roles.includes('owner')) {
          void this.router.navigate(['/owner', event.id]);
        } else if (roles.includes('attendancestaff')) {
          void this.router.navigate(['/attendance-staff', event.id]);
        } else if (roles.includes('photographer')) {
          void this.router.navigate(['/photographer', event.id, 'photos']);
        } else if (roles.includes('organizer')) {
          void this.router.navigate(['/organizer', event.id, 'overview']);
        } else {
          void this.router.navigate(['/events', event.id]);
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load event roles', error);
        this.toastr.error(error, 'Failed to open event');
      },
    });
  }

  private loadEvents(): void {
    this.loading.set(true);

    this.eventService.getMyEvents().subscribe({
      next: (response) => {
        const events = response.data ?? [];

        this.events.set(events);
        this.loading.set(false);

        for (const event of events) {
          this.loadEventRoles(event.id);
          this.loadRegistrationStatus(event.id);
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load events', error);
        this.toastr.error(error, 'Failed to load events');
        this.loading.set(false);
      },
    });
  }

  private loadEventRoles(eventId: string): void {
    this.roleService.getMyRoles(eventId).subscribe({
      next: (response) => {
        const roles = (response.data ?? []).map((role) => role.roleName.trim().toLowerCase());

        if (roles.some((role) => this.restrictedRoles.includes(role))) {
          this.restrictedEventIds.update((ids) =>
            ids.includes(eventId) ? ids : [...ids, eventId],
          );
        }

        this.rolesLoadedEventIds.update((ids) => (ids.includes(eventId) ? ids : [...ids, eventId]));
      },
      error: (error: unknown) => {
        // Keep actions hidden when role information cannot be verified.
        console.error(`Failed to load roles for event ${eventId}`, error);
      },
    });
  }

  private loadRegistrationStatus(eventId: string): void {
    this.registrationService.getMine(eventId).subscribe({
      next: (response) => {
        const registrations = response.data ?? [];

        if (registrations.length > 0) {
          this.registeredEventIds.update((ids) =>
            ids.includes(eventId) ? ids : [...ids, eventId],
          );
        }
      },
      error: (error: unknown) => {
        console.error(`Failed to load registrations for event ${eventId}`, error);
      },
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

  registrationLink(eventId: string): string[] {
    return this.isRegistered(eventId)
      ? ['/events', eventId, 'my-registration']
      : ['/events', eventId, 'register'];
  }
}
