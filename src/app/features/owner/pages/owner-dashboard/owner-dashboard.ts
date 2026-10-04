import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { NotificationService } from '../../../../core/services/ui/notification.service';

import { Event as EventModel } from '../../../../core/models/event/event.model';
import { EventTeamMemberModel } from '../../../../core/models/event-role/event-role.model';
import { EventFeatureModel } from '../../../../core/models/event-feature/event-feature.model';

import { EventService } from '../../../../core/services/event/event.service';
import { EventRoleService } from '../../../../core/services/event-role/event-role.service';
import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';
import { RegistrationService } from '../../../../core/services/registration/registration.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';

import {
  ContentAnalyticsModel,
  EventOverviewAnalyticsModel,
  ProgrammeAnalyticsModel,
} from '../../../../core/models/event/event-analytics.model';
import {
  CertificateAnalyticsModel,
  RegistrationAnalyticsModel,
} from '../../../../core/models/registration/registration-stats.model';
import { AttendanceAnalyticsModel } from '../../../../core/models/operations/operations.model';
import { TeamAnalyticsModel } from '../../../../core/models/event-role/event-role.model';

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
  private readonly registrationService = inject(RegistrationService);
  private readonly operationsService = inject(OperationsService);
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

  readonly rolesChecked = signal(false);

  readonly claiming = signal(false);

  readonly analyticsLoading = signal(true);

  readonly overviewAnalytics = signal<EventOverviewAnalyticsModel | null>(null);
  readonly programmeAnalytics = signal<ProgrammeAnalyticsModel | null>(null);
  readonly contentAnalytics = signal<ContentAnalyticsModel | null>(null);
  readonly registrationAnalytics = signal<RegistrationAnalyticsModel | null>(null);
  readonly certificateAnalytics = signal<CertificateAnalyticsModel | null>(null);
  readonly attendanceAnalytics = signal<AttendanceAnalyticsModel | null>(null);
  readonly teamAnalytics = signal<TeamAnalyticsModel | null>(null);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId');

  ngOnInit(): void {
    if (!this.eventId) {
      void this.router.navigate(['/my-events']);
      return;
    }

    this.loadEvent(this.eventId);
    this.loadRoles(this.eventId);
    this.loadFeatures(this.eventId);
    this.loadAnalytics(this.eventId);
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

  private loadAnalytics(eventId: string): void {
    this.analyticsLoading.set(true);

    forkJoin({
      overview: this.eventService
        .getOverviewAnalytics(eventId)
        .pipe(catchError(() => of(null))),
      programme: this.eventService
        .getProgrammeAnalytics(eventId)
        .pipe(catchError(() => of(null))),
      content: this.eventService
        .getContentAnalytics(eventId)
        .pipe(catchError(() => of(null))),
      registrations: this.registrationService
        .getRegistrationAnalytics(eventId, 30)
        .pipe(catchError(() => of(null))),
      certificates: this.registrationService
        .getCertificateAnalytics(eventId)
        .pipe(catchError(() => of(null))),
      attendance: this.operationsService
        .attendanceAnalytics(eventId, 30)
        .pipe(catchError(() => of(null))),
      team: this.roleService
        .getTeamAnalytics(eventId)
        .pipe(catchError(() => of(null))),
    }).subscribe((results) => {
      this.overviewAnalytics.set(results.overview?.data ?? null);
      this.programmeAnalytics.set(results.programme?.data ?? null);
      this.contentAnalytics.set(results.content?.data ?? null);
      this.registrationAnalytics.set(results.registrations?.data ?? null);
      this.certificateAnalytics.set(results.certificates?.data ?? null);
      this.attendanceAnalytics.set(results.attendance?.data ?? null);
      this.teamAnalytics.set(results.team?.data ?? null);
      this.analyticsLoading.set(false);
    });
  }

  get registrationTrend(): RegistrationAnalyticsModel['trend'] {
    return (this.registrationAnalytics()?.trend ?? []).slice(-14);
  }

  get trendMax(): number {
    return Math.max(1, ...this.registrationTrend.map((point) => point.total));
  }

  hasAnalytics(): boolean {
    return (
      this.overviewAnalytics() !== null ||
      this.registrationAnalytics() !== null ||
      this.attendanceAnalytics() !== null
    );
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
        this.rolesChecked.set(true);

        if (owner) {
          this.loadTeam(eventId);
          return;
        }

        // Creators receive the Owner role when the event is created; a missing
        // role here is an edge case, so ownership is claimed only through the
        // explicit button below - never silently in the background.
        this.teamLoading.set(false);
        this.team.set([]);
      },

      error: () => {
        this.isOwner.set(false);
        this.rolesChecked.set(true);
        this.teamLoading.set(false);
        this.team.set([]);

        this.toastr.error('Unable to verify your event role.');
      },
    });
  }

  claimOwnership(): void {
    if (!this.eventId || this.claiming()) return;

    this.claiming.set(true);

    this.eventService.claimOwner(this.eventId).subscribe({
      next: () => {
        this.claiming.set(false);
        this.toastr.success('You now own this event.');
        this.loadRoles(this.eventId!);
      },

      error: (error: unknown) => {
        this.claiming.set(false);
        this.toastr.error(this.getErrorMessage(error, 'Failed to claim event ownership.'));
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
