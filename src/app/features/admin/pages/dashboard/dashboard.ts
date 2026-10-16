import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { createRawAsyncState } from 'core/state';
import { AdminService } from '../../../../core/services/admin/admin.service';
import {
  AdminEventListItem,
  AdminEventStats,
  AdminUserStats,
} from '../../../../core/models/admin';
import { AsyncState } from '../../../../shared/components/async-state/async-state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';

interface DashboardData {
  events: AdminEventStats;
  users: AdminUserStats;
  recentEvents: AdminEventListItem[];
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, AsyncState, CapitalizePipe],
  templateUrl: './dashboard.html',
})
export class AdminDashboard {
  private readonly admin = inject(AdminService);

  private readonly state = createRawAsyncState<DashboardData>(
    () =>
      forkJoin({
        events: this.admin.getEventStats(),
        users: this.admin.getUserStats(),
        recentEvents: this.admin.getEvents({ page: 1, pageSize: 5 }),
      }).pipe(
        map(({ events, users, recentEvents }) => {
          if (!events.data || !users.data) {
            throw new Error('Statistics unavailable.');
          }

          return {
            events: events.data,
            users: users.data,
            recentEvents: recentEvents.data?.items ?? [],
          };
        }),
      ),
    { autoLoad: true, errorFallback: 'Failed to load platform statistics.' },
  );

  readonly data = this.state.data;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  reload(): void {
    this.state.load();
  }
}
