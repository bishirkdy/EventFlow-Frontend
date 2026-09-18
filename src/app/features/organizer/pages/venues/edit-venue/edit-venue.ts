import { Component, inject, signal } from '@angular/core';
import {  VenueModel } from '../../../../../core/models/venue/venue.model';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { UpdateVenueRequest } from '../../../../../core/models/venue/update-venue.model';

@Component({
  selector: 'app-edit-venue',
  imports: [FormsModule],
  templateUrl: './edit-venue.html',
  styleUrl: './edit-venue.css',
})
export class EditVenue {
  private readonly venueService = inject(VenueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  loading = signal(false);
  saving = signal(false);

  eventId = '';
  venueId = '';

  venue: UpdateVenueRequest = {
    name: '',
    description: '',
    address: '',
    capacity: 0,
  };

  ngOnInit(): void {
    this.eventId = this.getEventId();
    this.venueId = this.route.snapshot.paramMap.get('venueId') ?? '';

    if (!this.eventId) {
      this.toastr.error('Event ID not found');
      return;
    }

    if (!this.venueId) {
      this.toastr.error('Venue ID not found');
      return;
    }

    this.loadVenue();
  }

  private getEventId(): string {
    let route: ActivatedRoute | null = this.route;

    while (route) {
      const eventId = route.snapshot.paramMap.get('eventId');

      if (eventId) {
        return eventId;
      }

      route = route.parent;
    }

    return '';
  }

  loadVenue(): void {
    this.loading.set(true);
    this.venueService.getVenueById(this.eventId, this.venueId).subscribe({
      next: (response) => {
        const data: VenueModel = response.data;

        this.venue = {
          name: data.name,
          description: data.description ?? '',
          address: data.address ?? '',
          capacity: data.capacity,
        };

        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load venue:', error);

        this.loading.set(false);
        this.toastr.error('Failed to load venue');
      },
    });
  }

  updateVenue(): void {
    if (!this.venue.name.trim()) {
      this.toastr.error('Venue name is required');
      return;
    }

    if (this.venue.capacity <= 0) {
      this.toastr.error('Capacity must be greater than 0');
      return;
    }

    this.saving.set(true);

    this.venueService.updateVenue(this.eventId, this.venueId, this.venue).subscribe({
      next: () => {
        this.saving.set(false);

        this.toastr.success('Venue updated successfully');

        this.router.navigate(['..'], {
          relativeTo: this.route,
        });
      },

      error: (error: unknown) => {
        console.error('Failed to update venue:', error);

        this.saving.set(false);
        this.toastr.error('Failed to update venue');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
    });
  }
}
