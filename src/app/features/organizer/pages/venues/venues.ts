import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';

import { VenueModel } from '../../../../core/models/venue';
import { VenueService } from '../../../../core/services/venue/venue.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { createAsyncAction } from '@/core/state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-venue',
  standalone: true,
  imports: [CapitalizePipe, AsyncState],
  templateUrl: './venues.html',
  styleUrl: './venues.css'
})
export class Venues implements OnInit {
  private readonly venueService = inject(VenueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  venues = signal<VenueModel[]>([]);
  deleting = signal(false);

  private eventId = '';

  private readonly loadAction = createAsyncAction(() => this.venueService.getVenues(this.eventId), {
    errorFallback: 'Failed to load venues.',
    onSuccess: (response) => this.venues.set(response.data ?? [])
  });

  private readonly deleteAction = createAsyncAction(
    (venueId: string) => this.venueService.deleteVenue(this.eventId, venueId),
    {
      onSettled: () => this.deleting.set(false),
      onSuccess: (response) => {
        if (response.isSuccess) {
          this.toastr.success(response.message || 'Venue deleted successfully');
          this.loadVenues();
        } else {
          this.toastr.error(response.message || 'Failed to delete venue');
        }
      }
    }
  );

  loading = this.loadAction.pending;
  error = this.loadAction.error;

  ngOnInit(): void {
    const eventId = this.getEventId();

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

  loadVenues(): void {
    this.loadAction.run();
  }

  createVenue(): void {
    this.router.navigate(['create'], {
      relativeTo: this.route
    });
  }

  viewVenue(venueId: string): void {
    this.router.navigate([venueId], {
      relativeTo: this.route
    });
  }

  editVenue(venueId: string): void {
    this.router.navigate([venueId, 'edit'], {
      relativeTo: this.route
    });
  }

  deleteVenue(venueId: string): void {
    const eventId = this.eventId;

    if (!eventId) {
      this.toastr.error('Event ID not found');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this venue?');

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);
    this.deleteAction.run(venueId);
  }
}
