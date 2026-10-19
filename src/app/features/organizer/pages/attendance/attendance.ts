import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { of, map } from 'rxjs';

import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { SessionService } from '../../../../core/services/session/session.service';
import { AttendanceDashboardModel } from '../../../../core/models/operations';
import { SessionModel } from '../../../../core/models/session';
import { createAsyncAction } from '@/core/state';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './attendance.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceComponent {
  private readonly state = inject(OrganizerEventStateService);
  private readonly ops = inject(OperationsService);
  private readonly sessionService = inject(SessionService);

  readonly dashboard = signal<AttendanceDashboardModel | null>(null);
  readonly sessions = signal<SessionModel[]>([]);

  private readonly dashboardAction = createAsyncAction(
    () => {
      const id = this.state.eventId();
      if (!id) return of(null);
      return this.ops.dashboard(id).pipe(map((r) => r.data ?? null));
    },
    {
      toastErrors: true,
      errorFallback: 'Unable to load attendance dashboard.',
      onSuccess: (data) => {
        if (data) this.dashboard.set(data);
      }
    }
  );

  private readonly sessionsAction = createAsyncAction(
    () => {
      const id = this.state.eventId();
      if (!id) return of(null);
      return this.sessionService.getSessions(id);
    },
    {
      onError: () => this.sessions.set([]),
      onSuccess: (response) => this.sessions.set(response?.data ?? [])
    }
  );

  constructor() {
    this.dashboardAction.run();
    this.sessionsAction.run();
  }

  sessionTitle(sessionId: string): string {
    return this.sessions().find((session) => session.id === sessionId)?.title ?? 'Session';
  }
}
