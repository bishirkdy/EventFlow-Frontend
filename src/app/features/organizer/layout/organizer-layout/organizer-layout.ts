import { Component, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import {
  LucideAngularModule,
  Menu,
  X,
} from 'lucide-angular';

import {
  ORGANIZER_NAVIGATION,
  OrganizerNavItem,
} from '../../config/organizer-navigation';

import { EventService } from '../../../../core/services/event/event.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { Event as EventModel } from '../../../../core/models/event/event.model';

@Component({
  selector: 'app-organizer-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
  ],
  templateUrl: './organizer-layout.html',
  styleUrl: './organizer-layout.css',
})
export class OrganizerLayout {
  private readonly organizerEventState = inject(OrganizerEventStateService);

  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  navItems = signal<OrganizerNavItem[]>([]);

  event = signal<EventModel | null>(null);
  loading = signal(true);

  mobileMenuOpen = signal(false);

  // Expose Lucide icons to the template
  readonly menuIcon = Menu;
  readonly closeIcon = X;

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.loading.set(false);
      return;
    }

    this.organizerEventState.setEventId(eventId);
    this.eventService.getEventById(eventId).subscribe({
      next: (response) => {
        this.event.set(response.data);
        this.organizerEventState.setEvent(response.data);

        this.navItems.set(ORGANIZER_NAVIGATION);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load event:', error);
        this.loading.set(false);
      },
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}