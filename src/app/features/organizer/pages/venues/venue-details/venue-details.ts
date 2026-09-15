import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../../core/models/venue/venue.model';

@Component({
  selector: 'app-venue-details',
  imports: [],
  templateUrl: './venue-details.html',
  styleUrl: './venue-details.css',
})
export class VenueDetails {
  private route = inject(ActivatedRoute);
  private venueService = inject(VenueService);

  venue = signal<VenueModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId =
      this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId');

    const venueId = this.route.snapshot.paramMap.get('venueId');

    if (!eventId || !venueId) {
      this.error.set('Event ID or Venue ID not found.');
      this.loading.set(false);
      return;
    }

    this.venueService.getVenueById(eventId, venueId).subscribe({
      next: response => {
        this.venue.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load venue', error);
        this.error.set('Failed to load venue.');
        this.loading.set(false);
      },
    });
  }
}
