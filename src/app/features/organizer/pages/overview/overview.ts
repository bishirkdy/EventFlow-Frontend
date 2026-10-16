import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';

import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { EventService } from '../../../../core/services/event/event.service';
import { RegistrationService } from '../../../../core/services/registration/registration.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { EventRoleService } from '../../../../core/services/event-role/event-role.service';

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
import { TruncateWordsPipe } from '@/shared/components/pipes/truncate-words.pipe';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { createRawAsyncState } from 'core/state';

interface AnalyticsBundle {
  overview: EventOverviewAnalyticsModel | null;
  programme: ProgrammeAnalyticsModel | null;
  content: ContentAnalyticsModel | null;
  registrations: RegistrationAnalyticsModel | null;
  certificates: CertificateAnalyticsModel | null;
  attendance: AttendanceAnalyticsModel | null;
  team: TeamAnalyticsModel | null;
}

const EMPTY_ANALYTICS: AnalyticsBundle = {
  overview: null,
  programme: null,
  content: null,
  registrations: null,
  certificates: null,
  attendance: null,
  team: null,
};

@Component({
  selector: 'app-overview',
  imports: [DatePipe, DecimalPipe, RouterLink , TruncateWordsPipe, CapitalizePipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  organizerEventState = inject(OrganizerEventStateService);
  event = this.organizerEventState.event;

  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly registrationService = inject(RegistrationService);
  private readonly operationsService = inject(OperationsService);
  private readonly roleService = inject(EventRoleService);

  private readonly analyticsState = createRawAsyncState<AnalyticsBundle>(
    () => {
      const eventId =
        this.organizerEventState.eventId() ??
        this.route.snapshot.paramMap.get('eventId');

      if (!eventId) return of(EMPTY_ANALYTICS);

      return forkJoin({
        overview: this.eventService.getOverviewAnalytics(eventId).pipe(
          map((r) => r.data ?? null),
          catchError(() => of(null)),
        ),
        programme: this.eventService.getProgrammeAnalytics(eventId).pipe(
          map((r) => r.data ?? null),
          catchError(() => of(null)),
        ),
        content: this.eventService.getContentAnalytics(eventId).pipe(
          map((r) => r.data ?? null),
          catchError(() => of(null)),
        ),
        registrations: this.registrationService.getRegistrationAnalytics(eventId, 30).pipe(
          map((r) => r.data ?? null),
          catchError(() => of(null)),
        ),
        certificates: this.registrationService.getCertificateAnalytics(eventId).pipe(
          map((r) => r.data ?? null),
          catchError(() => of(null)),
        ),
        attendance: this.operationsService.attendanceAnalytics(eventId, 30).pipe(
          map((r) => r.data ?? null),
          catchError(() => of(null)),
        ),
        team: this.roleService.getTeamAnalytics(eventId).pipe(
          map((r) => r.data ?? null),
          catchError(() => of(null)),
        ),
      });
    },
    { initial: EMPTY_ANALYTICS },
  );

  readonly analyticsLoading = this.analyticsState.loading;

  readonly overviewAnalytics = computed(() => this.analyticsState.data().overview);
  readonly programmeAnalytics = computed(() => this.analyticsState.data().programme);
  readonly contentAnalytics = computed(() => this.analyticsState.data().content);
  readonly registrationAnalytics = computed(() => this.analyticsState.data().registrations);
  readonly certificateAnalytics = computed(() => this.analyticsState.data().certificates);
  readonly attendanceAnalytics = computed(() => this.analyticsState.data().attendance);
  readonly teamAnalytics = computed(() => this.analyticsState.data().team);

  ngOnInit(): void {
    this.analyticsState.load();
  }

  get registrationTrend(): RegistrationAnalyticsModel['trend'] {
    return (this.registrationAnalytics()?.trend ?? []).slice(-14);
  }

  get trendMax(): number {
    const trend = this.registrationTrend;
    return Math.max(1, ...trend.map((point) => point.total));
  }

  get hourlyMax(): number {
    const hours = this.attendanceAnalytics()?.checkInsByHour ?? [];
    return Math.max(1, ...hours.map((bucket) => bucket.count));
  }

  hasAnalytics(): boolean {
    return (
      this.overviewAnalytics() !== null ||
      this.programmeAnalytics() !== null ||
      this.registrationAnalytics() !== null ||
      this.attendanceAnalytics() !== null
    );
  }
}
