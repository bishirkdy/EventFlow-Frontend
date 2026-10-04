import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OperationsService } from '../../../core/services/operations/operations.service';
import { AuthService } from '../../../core/services/auth/auth.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceHistoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ops = inject(OperationsService);
  private readonly auth = inject(AuthService);

  readonly data = signal<History | null>(null);
  readonly loading = signal(true);
  readonly eventId = this.route.snapshot.paramMap.get('eventId');

  ngOnInit(): void {
    const existing = this.auth.currentUser();
    if (existing?.id) {
      this.fetch(existing.id);
      return;
    }

    // On a hard reload the session is restored asynchronously (app initializer
    // plus possible token refresh), so the signal can still be empty here.
    // Wait for the restore instead of giving up with an empty page.
    this.auth.loadCurrentUser().subscribe(user => {
      if (user?.id) {
        this.fetch(user.id);
      } else {
        this.loading.set(false);
      }
    });
  }

  private fetch(userId: string): void {
    if (!this.eventId) {
      this.loading.set(false);
      return;
    }
    this.ops.history(this.eventId, userId).subscribe({
      next: r => {
        this.data.set(r.data as History | null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
