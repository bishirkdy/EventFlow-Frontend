import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { VenueService } from '../../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../../core/models/venue';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { createAsyncAction } from '@/core/state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-venue-details',
  standalone: true,
  imports: [CapitalizePipe, AsyncState],
  templateUrl: './venue-details.html',
  styleUrl: './venue-details.css'
})
export class VenueDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly venueService = inject(VenueService);
  private readonly toastr = inject(NotificationService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  venue = signal<VenueModel | null>(null);
  error = signal<string | null>(null);

  private eventId = '';
  private venueId = '';

  private readonly loadAction = createAsyncAction(
    () => this.venueService.getVenueById(this.eventId, this.venueId),
    {
      errorFallback: 'Failed to load venue.',
      onError: () => this.error.set('Failed to load venue.'),
      onSuccess: (response) => {
        if (!response.data) {
          this.toastr.error('Venue data was not returned.');
          return;
        }

        this.venue.set(response.data);
      }
    }
  );

  loading = this.loadAction.pending;

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const venueId = this.route.snapshot.paramMap.get('venueId');

    if (!eventId || !venueId) {
      this.error.set('Event ID or Venue ID not found.');
      return;
    }

    this.eventId = eventId;
    this.venueId = venueId;

    this.reload();
  }

  reload(): void {
    this.error.set(null);
    this.loadAction.run();
  }

  goBack(): void {
    this.router.navigate(['/organizer', this.eventId, 'venues']);
  }

  editVenue(): void {
    this.router.navigate(['/organizer', this.eventId, 'venues', this.venueId, 'edit']);
  }
}
