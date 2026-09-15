import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';

import {
  ORGANIZER_NAVIGATION,
  OrganizerNavItem,
} from '../../config/organizer-navigation';
import { EventService } from '../../../../core/services/event/event.service';

@Component({
  selector: 'app-organizer-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './organizer-layout.html',
  styleUrl: './organizer-layout.css',
})
export class OrganizerLayout {

  navItems = signal<OrganizerNavItem[]>([]);

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');

    if (!eventId) {
      return;
    }

    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        const eventType = response.data.eventType;

        console.log('Event type:', eventType);

        this.navItems.set(
          ORGANIZER_NAVIGATION[eventType] ?? []
        );

        console.log('Navigation:', this.navItems);
      },

      error: (error: unknown) => {
        console.error('Failed to load event:', error);
      },
    });
  }
}