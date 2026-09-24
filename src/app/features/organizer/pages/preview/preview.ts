import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { EventWebsiteService } from '../../../../core/services/website/event-website.service';
import { EventWebsiteData } from '../../../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-preview',
  standalone: true,
  templateUrl: './preview.html',
  styleUrl: './preview.css',
})
export class Preview implements OnInit {
  private readonly eventState = inject(
    OrganizerEventStateService,
  );

  private readonly websiteService = inject(
    EventWebsiteService,
  );

  readonly websiteData =
    signal<EventWebsiteData | null>(null);

  readonly loading = signal(true);

  readonly error =
    signal<string | null>(null);

  ngOnInit(): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.loadWebsite(eventId);
  }

  private loadWebsite(eventId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.websiteService.load(eventId).subscribe({
      next: (data) => {
        this.websiteData.set(data);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error(
          'Failed to load event website:',
          error,
        );

        this.websiteData.set(null);
        this.loading.set(false);
        this.error.set(
          'Failed to load event website.',
        );
      },
    });
  }
}