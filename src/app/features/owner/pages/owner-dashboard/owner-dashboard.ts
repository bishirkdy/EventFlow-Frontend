import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { Event as EventModel } from '../../../../core/models/event';
import { EventTeamMemberModel } from '../../../../core/models/event-role';
import { EventFeatureModel } from '../../../../core/models/event-feature';

import { EventService } from '../../../../core/services/event/event.service';
import { EventRoleService } from '../../../../core/services/event-role/event-role.service';
import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';
import { RegistrationService } from '../../../../core/services/registration/registration.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';

import {
  ContentAnalyticsModel,
  EventOverviewAnalyticsModel,
  ProgrammeAnalyticsModel,
} from '../../../../core/models/event';
import {
  CertificateAnalyticsModel,
  RegistrationAnalyticsModel,
} from '../../../../core/models/registration';
import { AttendanceAnalyticsModel } from '../../../../core/models/operations';
import { TeamAnalyticsModel } from '../../../../core/models/event-role';
import { createAsyncAction, createRawAsyncState } from 'core/state';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css',
})
export class OwnerDashboard implements OnInit {
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
  readonly teamLoading = signal(true);
  readonly organizerEmail = signal('');
  readonly isOwner = signal(false);
  readonly rolesChecked = signal(false);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId');

  private readonly eventAction = createAsyncAction(
    (eventId: string) => this.eventService.getEventById(eventId),
    {
      errorFallback: 'Failed to load event.',
      onError: () => this.toastr.error('Failed to load event.'),
      onSuccess: (response) => this.event.set(response.data),
    },
  );

  private readonly rolesAction = createAsyncAction(
    (eventId: string) =>
      this.roleService.getMyRoles(eventId).pipe(
        map((response) => ({ eventId, response })),
      ),
    {
      errorFallback: 'Unable to verify your event role.',
      onError: () => {
        this.isOwner.set(false);
        this.rolesChecked.set(true);
        this.teamLoading.set(false);
        this.team.set([]);

        this.toastr.error('Unable to verify your event role.');
      },
      onSuccess: ({ eventId, response }) => {
        const roles = response.data ?? [];

        const owner = roles.some((role) => role.roleName === 'Owner');

        this.isOwner.set(owner);
        this.rolesChecked.set(true);

        if (owner) {
          this.loadTeam(eventId);
          return;
        }

        this.teamLoading.set(false);
        this.team.set([]);
      },
    },
  );

  private readonly featuresAction = createAsyncAction(
    (eventId: string) => this.featureService.getFeatures(eventId),
    {
      errorFallback: 'Failed to load event features.',
      onError: () => {
        this.features.set([]);

        this.toastr.error('Failed to load event features.');
      },
      onSuccess: (response) => {
        const enabledFeatures = (response.data ?? []).filter((feature) => feature.isEnabled);

        this.features.set(enabledFeatures);
      },
    },
  );

  private readonly assignAction = createAsyncAction(
    (email: string) => this.roleService.assignOrganizer(this.eventId!, email),
    {
      errorFallback: 'Failed to assign organizer.',
      onSuccess: () => {
        this.organizerEmail.set('');

        this.toastr.success('Organizer assigned successfully');

        // Stay on Owner Dashboard.
        if (this.eventId) {
          this.loadTeam(this.eventId);
        }
      },
    },
  );

  private readonly removeAction = createAsyncAction(
    (userId: string) => this.roleService.removeOrganizer(this.eventId!, userId),
    {
      errorFallback: 'Failed to remove organizer.',
      onSettled: () => this.removingUserId.set(null),
      onSuccess: (response) => {
        this.toastr.success(response.message || 'Organizer removed successfully.');
        this.loadTeam(this.eventId!);
      },
    },
  );

  private readonly claimAction = createAsyncAction(
    () => this.eventService.claimOwner(this.eventId!),
    {
      errorFallback: 'Failed to claim event ownership.',
      onSuccess: () => {
        this.toastr.success('You now own this event.');
        if (this.eventId) {
          this.loadRoles(this.eventId);
        }
      },
    },
  );

  private readonly teamAction = createAsyncAction(
    (eventId: string) => this.roleService.getTeam(eventId),
    {
      onError: () => this.team.set([]),
      onSuccess: (response) => this.team.set(response.data ?? []),
      onSettled: () => this.teamLoading.set(false),
    },
  );

  private readonly analyticsState = createRawAsyncState(() =>
    forkJoin({
      overview: this.eventService.getOverviewAnalytics(this.eventId!).pipe(catchError(() => of(null))),
      programme: this.eventService.getProgrammeAnalytics(this.eventId!).pipe(catchError(() => of(null))),
      content: this.eventService.getContentAnalytics(this.eventId!).pipe(catchError(() => of(null))),
      registrations: this.registrationService.getRegistrationAnalytics(this.eventId!, 30).pipe(catchError(() => of(null))),
      certificates: this.registrationService.getCertificateAnalytics(this.eventId!).pipe(catchError(() => of(null))),
      attendance: this.operationsService.attendanceAnalytics(this.eventId!, 30).pipe(catchError(() => of(null))),
      team: this.roleService.getTeamAnalytics(this.eventId!).pipe(catchError(() => of(null))),
    }),
    { autoLoad: false },
  );

  readonly loading = this.eventAction.pending;
  readonly featuresLoading = this.featuresAction.pending;
  readonly assigning = this.assignAction.pending;
  readonly claiming = this.claimAction.pending;
  readonly removingUserId = signal<string | null>(null);
  readonly analyticsLoading = this.analyticsState.loading;

  readonly overviewAnalytics = computed(() => this.analyticsState.data()?.overview?.data ?? null);
  readonly programmeAnalytics = computed(() => this.analyticsState.data()?.programme?.data ?? null);
  readonly contentAnalytics = computed(() => this.analyticsState.data()?.content?.data ?? null);
  readonly registrationAnalytics = computed(() => this.analyticsState.data()?.registrations?.data ?? null);
  readonly certificateAnalytics = computed(() => this.analyticsState.data()?.certificates?.data ?? null);
  readonly attendanceAnalytics = computed(() => this.analyticsState.data()?.attendance?.data ?? null);
  readonly teamAnalytics = computed(() => this.analyticsState.data()?.team?.data ?? null);

  ngOnInit(): void {
    if (!this.eventId) {
      void this.router.navigate(['/my-events']);
      return;
    }

    this.loadEvent(this.eventId);
    this.loadRoles(this.eventId);
    this.loadFeatures(this.eventId);
    this.loadAnalytics();
  }

  assignOrganizer(): void {
    const email = this.organizerEmail().trim();

    if (!this.eventId || !email || this.assigning()) {
      return;
    }

    this.assignAction.run(email);
  }

  removeOrganizer(userId: string): void {
    if (!this.eventId || this.removingUserId()) {
      return;
    }

    if (!window.confirm('Remove this organizer from the event?')) {
      return;
    }

    this.removingUserId.set(userId);

    this.removeAction.run(userId);
  }

  isOrganizer(member: EventTeamMemberModel): boolean {
    return member.roles.some((role) => role.roleName === 'Organizer');
  }

  private loadAnalytics(): void {
    this.analyticsState.load();
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
    this.eventAction.run(eventId);
  }

  private loadRoles(eventId: string): void {
    this.rolesAction.run(eventId);
  }

  claimOwnership(): void {
    if (!this.eventId || this.claiming()) return;

    this.claimAction.run();
  }

  private loadFeatures(eventId: string): void {
    this.featuresAction.run(eventId);
  }

  private loadTeam(eventId: string): void {
    this.teamLoading.set(true);

    this.teamAction.run(eventId);
  }
}
