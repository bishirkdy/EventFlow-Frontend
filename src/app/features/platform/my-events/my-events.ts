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


  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadEvents();
  }

  private loadEvents(): void {
    this.eventService.getMyEvents().subscribe({
      next: (response) => {
        console.log( response.data);
        this.events.set(response.data);
      },
      error: (error: unknown) => {
        console.error('Failed to load events', error);
      },
    });
  }
}