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

  private platformId = inject(PLATFORM_ID);

  constructor(
    private eventService: EventService
  ) { }

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadEvents();
  }

  private loadEvents(): void {
    this.eventService.getMyEvents().subscribe({
      next: (response) => {
        console.log('My events:from func', this.events);
        this.events.set(response.data);
        console.log('My events:', this.events);
      },
      error: (error: unknown) => {
        console.error('Failed to load events', error);
      },
    });
  }
}