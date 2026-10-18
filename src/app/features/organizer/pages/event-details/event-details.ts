import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/services/event/event.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { of } from 'rxjs';
import { ParticipantStatus } from '@/core/models/registration';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { createAsyncAction } from '@/core/state';

@Component({
  selector: 'app-event-details',
  imports: [DatePipe, CapitalizePipe],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css'
})
export class EventDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly toastr = inject(NotificationService);
  private readonly eventState = inject(OrganizerEventStateService);
  protected readonly participantStatus = ParticipantStatus;

  event = this.eventState.event;
  private eventIdToLoad: string | null = null;

  private readonly loadAction = createAsyncAction(
    () => {
      const eventId = this.eventIdToLoad;
      if (!eventId) return of(null);
      return this.eventService.getEventById(eventId);
    },
    {
      toastErrors: true,
      errorFallback: 'Failed to load event details.',
      onSuccess: (response) => {
        if (!response) return;
        const event = response.data;
        if (!event || !this.eventIdToLoad) {
          this.toastr.error('Event details could not be loaded.');
          return;
        }
        this.eventState.setEventId(this.eventIdToLoad);
        this.eventState.setEvent(event);
      }
    }
  );

  private readonly publishAction = createAsyncAction(
    () => {
      const eventId = this.event()?.id;
      if (!eventId) return of(null);
      return this.eventService.publishEvent(eventId);
    },
    {
      successMessage: 'Event published successfully.',
      errorFallback: 'Failed to publish event.'
    }
  );

  readonly publishing = this.publishAction.pending;

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

    this.eventIdToLoad = eventId;
    this.loadAction.run();
  }

  publishEvent(): void {
    if (!this.event()?.id || this.publishing()) {
      return;
    }

    this.publishAction.run();
  }
}
