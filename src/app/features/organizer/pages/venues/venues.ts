import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VenueModel } from '../../../../core/models/venue/venue.model';
import { VenueService } from '../../../../core/services/venue/venue.service';

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

  venues = signal<VenueModel[]>([]);
  loading = signal(false);

  private eventId = '';

  ngOnInit(): void {
    this.eventId = this.getEventId();

    if (!this.eventId) {
      this.toastr.error('Event ID not found');
      return;
    }

    this.loadVenues();
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

  loadVenues(): void {
    this.loading.set(true);

    this.venueService.getVenues(this.eventId).subscribe({
      next: (response) => {
        this.venues.set(response.data);
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
}
