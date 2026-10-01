import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Event } from '../../../../core/models/event/event.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../../core/services/event/event.service';
import { EventRoleService } from '../../../../core/services/event-role/event-role.service';
import { EventTeamMemberModel } from '../../../../core/models/event-role/event-role.model';

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
  private readonly toastr = inject(ToastrService);

  readonly event = signal<Event | null>(null);
  readonly team = signal<EventTeamMemberModel[]>([]);
  readonly loading = signal(true);
  readonly teamLoading = signal(true);
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
    this.loadTeam(this.eventId);
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
        this.loadTeam(this.eventId!);
      },
      error: (error: unknown) => {
        this.assigning.set(false);
        this.toastr.error(
          error instanceof Object && 'error' in error
            ? String((error as { error?: { message?: string } }).error?.message ?? 'Failed to assign organizer.')
            : 'Failed to assign organizer.',
        );
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
        this.isOwner.set(roles.some((role) => role.roleName === 'Owner'));

        if (this.isOwner()) {
          return;
        }

        // Existing events created before Owner assignment was introduced can
        // safely repair their ownership when the authenticated creator opens
        // the owner dashboard. The backend verifies CreatedBy.
        this.eventService.claimOwner(eventId).subscribe({
          next: () => {
            this.loadRoles(eventId);
            this.loadTeam(eventId);
          },
          error: () => void this.router.navigate(['/organizer', eventId, 'overview']),
        });
      },
      error: () => {
        this.isOwner.set(false);
        void this.router.navigate(['/my-events']);
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
}
