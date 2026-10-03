import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event/event.service';
import { Event } from '../../../core/models/event/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit {
  private readonly eventService = inject(EventService);

  readonly events = signal<Event[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadEvents();
  }

  retry(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventService.getPublicEvents(12).subscribe({
      next: (response) => {
        this.events.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load public events.');
        this.loading.set(false);
      },
    });
  }
}
