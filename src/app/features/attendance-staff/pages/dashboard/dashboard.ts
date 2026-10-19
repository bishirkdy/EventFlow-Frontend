import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { SessionService } from '../../../../core/services/session/session.service';
import { EventService } from '../../../../core/services/event/event.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { AttendanceDashboardModel, AttendanceScopeType } from '../../../../core/models/operations';
import { NotificationService } from '../../../../core/services/ui/notification.service';

@Component({
  selector: 'app-attendance-staff-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.html'
})
export class AttendanceStaffDashboard {
  private readonly route = inject(ActivatedRoute);
  private readonly operations = inject(OperationsService);
  private readonly sessionService = inject(SessionService);
  private readonly eventService = inject(EventService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  readonly eventId =
    this.route.parent?.snapshot.paramMap.get('eventId') ??
    this.route.snapshot.paramMap.get('eventId');
  readonly dashboard = signal<AttendanceDashboardModel | null>(null);
  readonly eventName = signal<string | null>(null);
  readonly scopeLabels = signal<string[]>([]);
  readonly loading = signal(true);

  constructor() {
    if (this.eventId) {
      this.load();
      this.loadContext();
    } else {
      this.loading.set(false);
      this.notify.error(null, 'Event context is missing.');
    }
  }

  private load(): void {
    this.operations.dashboard(this.eventId!).subscribe({
      next: (response) => {
        this.dashboard.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.notify.error(error, 'Unable to load attendance dashboard.');
      }
    });
  }

  private loadContext(): void {
    this.eventService
      .getEventById(this.eventId!)
      .pipe(catchError(() => of(null)))
      .subscribe((response) => this.eventName.set(response?.data?.name ?? null));

    const existing = this.auth.currentUser();
    if (existing?.id) {
      this.loadScopes(existing.id);
    } else {
      this.auth.loadCurrentUser().subscribe((user) => {
        if (user?.id) this.loadScopes(user.id);
      });
    }
  }

  private loadScopes(me: string): void {
    forkJoin({
      staff: this.operations.getStaff(this.eventId!).pipe(catchError(() => of(null))),
      sessions: this.sessionService.getSessions(this.eventId!).pipe(catchError(() => of(null)))
    }).subscribe(({ staff, sessions }) => {
      const mine = (staff?.data ?? []).filter((x) => x.isActive && x.userId === me);
      const sessionNames = new Map((sessions?.data ?? []).map((s) => [s.id, s.title]));
      const labels: string[] = [];

      for (const assignment of mine) {
        if (assignment.scopeType === AttendanceScopeType.Event) {
          labels.push('Event-wide');
        } else if (assignment.scopeType === AttendanceScopeType.Session && assignment.scopeId) {
          labels.push(sessionNames.get(assignment.scopeId) ?? 'Session');
        }
      }

      const unique = labels.filter((label, index) => labels.indexOf(label) === index);
      this.scopeLabels.set(unique.length > 0 ? unique : ['Event-wide']);
    });
  }
}
