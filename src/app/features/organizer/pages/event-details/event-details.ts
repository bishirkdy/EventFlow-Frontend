import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/services/event/event.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { finalize } from 'rxjs';
import { ParticipantStatus } from '@/core/models/registration/registration.enums';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly toastr = inject(NotificationService);
  private readonly eventState = inject(OrganizerEventStateService);
  protected readonly participantStatus = ParticipantStatus;

  publishing = false;
  event = this.eventState.event;

  ngOnInit(): void {
    const eventId =
      this.route.snapshot.paramMap.get('eventId') ||
      this.route.pathFromRoot
        .map((route) => route.snapshot.paramMap.get('eventId'))
        .filter(Boolean)[0];

    if (!eventId) {
      this.toastr.error('Event information is missing.');
      return;
    }

    if (this.eventState.event()?.id === eventId) {
      return;
    }

    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        const event = response.data;
        if (!event) {
          this.toastr.error('Event details could not be loaded.');
          return;
        }
        this.eventState.setEventId(eventId);
        this.eventState.setEvent(event);
      },
      error: () => {
        this.toastr.error('Failed to load event details.');
      },
    });
  }

  publishEvent(): void {
    const eventId = this.event()?.id;

    if (!eventId || this.publishing) {
      return;
    }

    this.publishing = true;

    this.eventService
      .publishEvent(eventId)
      .pipe(
        finalize(() => {
          this.publishing = false;
        }),
      )
      .subscribe({
        next: () => {
          this.toastr.success('Event published successfully.');
        },
        error: () => {
          this.toastr.error('Failed to publish event.');
          this.publishing = false;
        },
        complete: () => {
          this.publishing = false;
        },
      });
  }
}
