import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event/event.service';
import { Event } from '../../../core/models/event';
import { createAsyncState } from 'core/state';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit {
  private readonly eventService = inject(EventService);

  private readonly eventsState = createAsyncState<Event[]>(
    () => this.eventService.getPublicEvents(12),
    { initial: [], errorFallback: 'Unable to load public events.' },
  );

  readonly events = this.eventsState.data;
  readonly loading = this.eventsState.loading;
  readonly error = this.eventsState.error;

  ngOnInit(): void {
    this.loadEvents();
  }

  retry(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.eventsState.load();
  }
}
