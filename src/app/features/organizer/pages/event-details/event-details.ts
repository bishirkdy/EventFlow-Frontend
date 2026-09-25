import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/services/event/event.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly eventState = inject(OrganizerEventStateService);

  event = this.eventState.event;

  ngOnInit(): void {
    const eventId = this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      return;
    }

    if (this.eventState.event()?.id === eventId) {
      return;
    }

    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        const event = response.data;
        if (!event) {
          console.error('Event data was not returned.');
          return;
        }
        this.eventState.setEventId(eventId);
        this.eventState.setEvent(event);
      },
      error: (error: unknown) => {
        console.error('Failed to load event details', error);
      },
    });
  }
}
