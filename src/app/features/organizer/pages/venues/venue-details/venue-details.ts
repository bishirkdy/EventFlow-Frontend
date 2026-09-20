import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { VenueService } from '../../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../../core/models/venue/venue.model';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-venue-details',
  standalone: true,
  imports: [],
  templateUrl: './venue-details.html',
  styleUrl: './venue-details.css',
})
export class VenueDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly venueService = inject(VenueService);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState = inject(
    OrganizerEventStateService
  );

  venue = signal<VenueModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private eventId = '';
  private venueId = '';

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const venueId = this.route.snapshot.paramMap.get('venueId');

    if (!eventId || !venueId) {
      this.error.set('Event ID or Venue ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventId = eventId;
    this.venueId = venueId;

    this.loadVenue();
  }

  private loadVenue(): void {
    this.loading.set(true);
    this.error.set(null);

    this.venueService
      .getVenueById(this.eventId, this.venueId)
      .subscribe({
        next: (response) => {
          this.venue.set(response.data);
          this.loading.set(false);
        },

        error: (error: unknown) => {
          console.error('Failed to load venue:', error);

          this.error.set('Failed to load venue.');
          this.loading.set(false);

          this.toastr.error('Failed to load venue');
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'venues',
    ]);
  }

  editVenue(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'venues',
      this.venueId,
      'edit',
    ]);
  }
}