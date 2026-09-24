import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../../core/services/event/event.service';
import { Event as EventModel } from '../../../../core/models/event/event.model';

@Component({
  selector: 'app-upcoming-events',
  imports: [RouterLink],
  templateUrl: './upcoming-events.html',
  styleUrl: './upcoming-events.css',
})
export class UpcomingEvents implements OnInit {
  private readonly eventService = inject(EventService);

  readonly events = signal<EventModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.eventService.getPublicEvents(3).subscribe({
      next: (response) => {
        this.events.set((response.data ?? []).slice(0, 3));
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load public events:', error);
        this.error.set('Unable to load upcoming events.');
        this.loading.set(false);
      },
    });
  }

  formatDate(date: string, timeZone?: string): string {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return date;
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...(timeZone ? { timeZone } : {}) }).format(value);
  }
}
