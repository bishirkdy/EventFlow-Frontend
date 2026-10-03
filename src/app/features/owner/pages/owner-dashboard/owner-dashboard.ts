import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';

import { Event as EventModel } from '../../../../core/models/event/event.model';
import { EventTeamMemberModel } from '../../../../core/models/event-role/event-role.model';
import { EventFeatureModel } from '../../../../core/models/event-feature/event-feature.model';

import { EventService } from '../../../../core/services/event/event.service';
import { EventRoleService } from '../../../../core/services/event-role/event-role.service';
import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css',
})
export class OwnerDashboard {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly roleService = inject(EventRoleService);
  private readonly featureService = inject(EventFeatureService);
  private readonly toastr = inject(NotificationService);

  readonly event = signal<EventModel | null>(null);

  readonly team = signal<EventTeamMemberModel[]>([]);

  readonly features = signal<EventFeatureModel[]>([]);

  readonly loading = signal(true);

  readonly teamLoading = signal(true);

  readonly featuresLoading = signal(true);

  readonly assigning = signal(false);

  readonly removingUserId = signal<string | null>(null);

  readonly organizerEmail = signal('');

  readonly isOwner = signal(false);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId');

  ngOnInit(): void {
    if (!this.eventId) {
      void this.router.navigate(['/my-events']);
      return;
    }

    this.loadEvent(this.eventId);
    this.loadRoles(this.eventId);
    this.loadFeatures(this.eventId);
  }

  assignOrganizer(): void {
    const email = this.organizerEmail().trim();

    if (!this.eventId || !email || this.assigning()) {
      return;
    }

    this.assigning.set(true);

    this.roleService.assignOrganizer(this.eventId, email).subscribe({
      next: (response) => {
        this.assigning.set(false);
        this.organizerEmail.set('');

        this.toastr.success(response.message || 'Organizer assigned successfully.');

        // Stay on Owner Dashboard.
        this.loadTeam(this.eventId!);
      },

      error: (error: unknown) => {
        this.assigning.set(false);

        this.toastr.error(this.getErrorMessage(error, 'Failed to assign organizer.'));
      },
    });
  }

  removeOrganizer(userId: string): void {
    if (!this.eventId || this.removingUserId()) {
      return;
    }

    if (!window.confirm('Remove this organizer from the event?')) {
      return;
    }

    this.removingUserId.set(userId);

    this.roleService.removeOrganizer(this.eventId, userId).subscribe({
      next: (response) => {
        this.removingUserId.set(null);

        this.toastr.success(response.message || 'Organizer removed successfully.');

        this.loadTeam(this.eventId!);
      },

      error: () => {
        this.removingUserId.set(null);
        this.toastr.error('Failed to remove organizer.');
      },
    });
  }

  isOrganizer(member: EventTeamMemberModel): boolean {
    return member.roles.some((role) => role.roleName === 'Organizer');
  }

  private loadEvent(eventId: string): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        this.event.set(response.data);
        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);

        this.toastr.error('Failed to load event.');
      },
    });
  }

  private loadRoles(eventId: string): void {
    this.roleService.getMyRoles(eventId).subscribe({
      next: (response) => {
        const roles = response.data ?? [];

        const owner = roles.some((role) => role.roleName === 'Owner');

        this.isOwner.set(owner);

        if (owner) {
          this.loadTeam(eventId);
          return;
        }

        this.eventService.claimOwner(eventId).subscribe({
          next: () => {
            this.loadRoles(eventId);
          },

          error: (error: unknown) => {
            this.isOwner.set(false);

            this.toastr.error(this.getErrorMessage(error, 'Failed to claim event ownership.'));

            console.error('Claim owner failed:', error);
          },
        });
      },

      error: () => {
        this.isOwner.set(false);

        this.toastr.error('Unable to verify your event role.');
      },
    });
  }

  private loadFeatures(eventId: string): void {
    this.featuresLoading.set(true);

    this.featureService.getFeatures(eventId).subscribe({
      next: (response) => {
        const enabledFeatures = (response.data ?? []).filter((feature) => feature.isEnabled);

        this.features.set(enabledFeatures);
        this.featuresLoading.set(false);
      },

      error: () => {
        this.features.set([]);
        this.featuresLoading.set(false);

        this.toastr.error('Failed to load event features.');
      },
    });
  }

  private loadTeam(eventId: string): void {
    this.teamLoading.set(true);

    this.roleService.getTeam(eventId).subscribe({
      next: (response) => {
        this.team.set(response.data ?? []);
        this.teamLoading.set(false);
      },

      error: () => {
        this.team.set([]);
        this.teamLoading.set(false);
      },
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const response = (
        error as {
          error?: {
            message?: string;
          };
        }
      ).error;

      return response?.message || fallback;
    }

    return fallback;
  }
}
