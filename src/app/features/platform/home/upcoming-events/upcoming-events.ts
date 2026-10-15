import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { EventService } from '../../../../core/services/event/event.service';
import { Event as EventModel } from '../../../../core/models/event';
import { createRawAsyncState } from 'core/state';

@Component({
  selector: 'app-upcoming-events',
  imports: [RouterLink],
  templateUrl: './upcoming-events.html',
  styleUrl: './upcoming-events.css',
})
export class UpcomingEvents implements OnInit {
  private readonly eventService = inject(EventService);

  private readonly eventsState = createRawAsyncState<EventModel[]>(
    () =>
      this.eventService.getPublicEvents(3).pipe(
        map((response) => (response.data ?? []).slice(0, 3)),
      ),
    { initial: [], errorFallback: 'Unable to load upcoming events.' },
  );

  readonly events = this.eventsState.data;
  readonly loading = this.eventsState.loading;
  readonly error = this.eventsState.error;

  ngOnInit(): void {
    this.eventsState.load();
  }

  formatDate(date: string, timeZone?: string): string {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return date;
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...(timeZone ? { timeZone } : {}) }).format(value);
  }
}
