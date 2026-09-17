import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ORGANIZER_NAVIGATION, OrganizerNavItem } from '../../config/organizer-navigation';
import { EventService } from '../../../../core/services/event/event.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { Event as EventModel } from '../../../../core/models/event/event.model';

@Component({
  selector: 'app-organizer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './organizer-layout.html',
  styleUrl: './organizer-layout.css',
})
export class OrganizerLayout {
  private organizerEventState = inject(OrganizerEventStateService);

  navItems = signal<OrganizerNavItem[]>([]);

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  event = signal<EventModel | null>(null);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');

    if (!eventId) {
      return;
    }

    this.organizerEventState.setEventId(eventId);

    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        this.organizerEventState.setEvent(response.data);

        this.navItems.set(ORGANIZER_NAVIGATION);
      },

      error: (error: unknown) => {
        console.error('Failed to load event:', error);
      },
    });
  }
}
