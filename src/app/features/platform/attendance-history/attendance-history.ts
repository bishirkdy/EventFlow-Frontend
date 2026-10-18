import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, map } from 'rxjs';
import { OperationsService } from '../../../core/services/operations/operations.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { createRawAsyncState } from '@/core/state';

interface History {
  eventId: string;
  eventAttendanceCount: number;
  sessionAttendanceCount: number;
  totalSessions: number;
  attendancePercentage: number;
}

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './attendance-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceHistoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ops = inject(OperationsService);
  private readonly auth = inject(AuthService);

  readonly eventId = this.route.snapshot.paramMap.get('eventId');
  private userId: string | null = null;
  private readonly awaitingAuth = signal(true);

  private readonly historyState = createRawAsyncState<History | null>(
    () => {
      if (!this.eventId || !this.userId) return EMPTY;
      return this.ops
        .history(this.eventId, this.userId)
        .pipe(map((response) => (response.data as History | null) ?? null));
    },
    { autoLoad: false, initial: null }
  );

  readonly data = this.historyState.data;
  readonly loading = computed(() => this.historyState.loading() || this.awaitingAuth());

  ngOnInit(): void {
    const existing = this.auth.currentUser();
    if (existing?.id) {
      this.fetch(existing.id);
      return;
    }

    // On a hard reload the session is restored asynchronously (app initializer
    // plus possible token refresh), so the signal can still be empty here.
    // Wait for the restore instead of giving up with an empty page.
    this.auth.loadCurrentUser().subscribe((user) => {
      if (user?.id) {
        this.fetch(user.id);
      } else {
        this.awaitingAuth.set(false);
      }
    });
  }

  private fetch(userId: string): void {
    this.userId = userId;
    this.awaitingAuth.set(false);
    if (!this.eventId) {
      return;
    }
    this.historyState.load();
  }
}
