import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { VenueModel } from '../../../../core/models/venue/venue.model';
import { VenueService } from '../../../../core/services/venue/venue.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-venue',
  standalone: true,
  templateUrl: './venues.html',
  styleUrl: './venues.css',
})
export class Venues implements OnInit {
  private readonly venueService = inject(VenueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  venues = signal<VenueModel[]>([]);
  loading = signal(false);
  deleting = signal(false);

  private eventId = '';

  ngOnInit(): void {
    const eventId = this.getEventId();

    console.log('VENUE EVENT ID:', eventId);
    console.log('CURRENT URL:', this.router.url);

    if (!eventId) {
      this.toastr.error('Event ID not found');
      return;
    }

    this.eventId = eventId;
    this.organizerEventState.setEventId(eventId);

    this.loadVenues();
  }

  private getEventId(): string {
    for (const route of this.route.pathFromRoot) {
      const eventId = route.snapshot.paramMap.get('eventId');

      if (eventId) {
        return eventId;
      }
    }

    return '';
  }

  private loadVenues(): void {
    this.loading.set(true);

    this.venueService.getVenues(this.eventId).subscribe({
      next: (response) => {
        this.venues.set(response.data ?? []);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load venues:', error);

        this.loading.set(false);

        this.toastr.error('Failed to load venues');
      },
    });
  }

  createVenue(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route,
    });
  }

  viewVenue(venueId: string): void {
    this.router.navigate([venueId], {
      relativeTo: this.route,
    });
  }

  editVenue(venueId: string): void {
    this.router.navigate([venueId, 'edit'], {
      relativeTo: this.route,
    });
  }

  deleteVenue(venueId: string): void {
    const eventId = this.eventId;

    if (!eventId) {
      this.toastr.error('Event ID not found');
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this venue?',
    );

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    this.venueService.deleteVenue(eventId, venueId).subscribe({
      next: (response) => {
        this.deleting.set(false);

        if (response.success) {
          this.toastr.success(
            response.message || 'Venue deleted successfully',
          );

          this.loadVenues();
        } else {
          this.toastr.error(
            response.message || 'Failed to delete venue',
          );
        }
      },

      error: (error: unknown) => {
        console.error('Failed to delete venue:', error);

        this.deleting.set(false);

        this.toastr.error('Failed to delete venue');
      },
    });
  }
}