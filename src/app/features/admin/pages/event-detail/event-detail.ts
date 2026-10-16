import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { createAsyncState } from 'core/state';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { Event } from '../../../../core/models/event';
import { AsyncState } from '../../../../shared/components/async-state/async-state';

@Component({
  selector: 'app-admin-event-detail',
  imports: [RouterLink, DatePipe, AsyncState],
  templateUrl: './event-detail.html',
})
export class AdminEventDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly adminService = inject(AdminService);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';

  private readonly state = createAsyncState<Event>(
    () => this.adminService.getEventById(this.eventId),
    { autoLoad: true, errorFallback: 'Event could not be loaded.' },
  );

  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly event = this.state.data;

  reload(): void {
    this.state.load();
  }
}
