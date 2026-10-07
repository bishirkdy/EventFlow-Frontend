import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { EventService } from '../../../../core/services/event/event.service';
import { RegistrationService } from '../../../../core/services/registration/registration.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { EventRoleService } from '../../../../core/services/event-role/event-role.service';

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
import { TruncateWordsPipe } from '@/shared/components/pipes/truncate-words.pipe';

@Component({
  selector: 'app-overview',
  imports: [DatePipe, DecimalPipe, RouterLink , TruncateWordsPipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  organizerEventState = inject(OrganizerEventStateService);
  event = this.organizerEventState.event;

  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly registrationService = inject(RegistrationService);
  private readonly operationsService = inject(OperationsService);
  private readonly roleService = inject(EventRoleService);

  readonly analyticsLoading = signal(true);

  readonly overviewAnalytics = signal<EventOverviewAnalyticsModel | null>(null);
  readonly programmeAnalytics = signal<ProgrammeAnalyticsModel | null>(null);
  readonly contentAnalytics = signal<ContentAnalyticsModel | null>(null);
  readonly registrationAnalytics = signal<RegistrationAnalyticsModel | null>(null);
  readonly certificateAnalytics = signal<CertificateAnalyticsModel | null>(null);
  readonly attendanceAnalytics = signal<AttendanceAnalyticsModel | null>(null);
  readonly teamAnalytics = signal<TeamAnalyticsModel | null>(null);

  ngOnInit(): void {
    const eventId =
      this.organizerEventState.eventId() ??
      this.route.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.analyticsLoading.set(false);
      return;
    }

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
