import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { EventService } from '../../../core/services/event/event.service';
import { Event } from '../../../core/models/event/event.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-events',
  imports: [DatePipe, RouterLink],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css',
})
export class MyEvents {

  events = signal<Event[]>([]);
  private eventService = inject(EventService)
  private platformId = inject(PLATFORM_ID);
  publishing = signal<string | null>(null);


  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadEvents();
  }

  publishEvent(event: Event): void {
    if (event.status !== 'Draft' || this.publishing()) return;
    this.publishing.set(event.id);
    this.eventService.publishEvent(event.id).subscribe({
      next: () => {
        this.publishing.set(null);
        this.events.update(items => items.map(item => item.id === event.id ? { ...item, status: 'Published' } : item));
      },
      error: (error: unknown) => {
        console.error('Failed to publish event', error);
        this.publishing.set(null);
      },
    });
  }

  private loadEvents(): void {
    this.eventService.getMyEvents().subscribe({
      next: (response) => {
        const events = response.data;
        this.events.set(events ?? []);
      },
      error: (error: unknown) => {
        console.error('Failed to load events', error);
      },
    });
  }
}