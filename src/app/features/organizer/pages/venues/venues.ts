import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VenueService } from '../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../core/models/venue/venue.model';

@Component({
  selector: 'app-venues',
  imports: [],
  templateUrl: './venues.html',
  styleUrl: './venues.css',
})
export class Venues {
   private route = inject(ActivatedRoute);
  private venueService = inject(VenueService);

  venues = signal<VenueModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.venueService.getVenues(eventId).subscribe({
      next: response => {
        this.venues.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load venues', error);
        this.error.set('Failed to load venues.');
        this.loading.set(false);
      },
    });
  }
}
