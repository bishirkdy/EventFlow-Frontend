import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { CreateVenueRequest } from '../../../../../core/models/venue/venue.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-venue',
  imports: [FormsModule],
  templateUrl: './create-venue.html',
  styleUrl: './create-venue.css',
})
export class CreateVenue {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private venueService = inject(VenueService);

  name = '';
  description = '';
  address = '';
  capacity = 0;

  loading = signal(false);
  error = signal<string | null>(null);

  create(): void {
    const eventId =
      this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    if (!this.name.trim()) {
      this.error.set('Venue name is required.');
      return;
    }

    if (this.capacity < 0) {
      this.error.set('Capacity cannot be negative.');
      return;
    }

    const request: CreateVenueRequest = {
      name: this.name.trim(),
      description: this.description.trim() || undefined,
      address: this.address.trim() || undefined,
      capacity: this.capacity,
    };

    this.loading.set(true);
    this.error.set(null);

    this.venueService.createVenue(eventId, request).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['../../'], {
          relativeTo: this.route,
        });
      },

      error: error => {
        console.error('Failed to create venue', error);
        this.error.set('Failed to create venue.');
        this.loading.set(false);
      },
    });
  }
}
