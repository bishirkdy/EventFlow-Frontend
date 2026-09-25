import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { SessionModel } from '../../../../../core/models/session/session.model';
import { SessionService } from '../../../../../core/services/session/session.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../../core/models/venue/venue.model';

@Component({
  selector: 'app-session-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './session-details.html',
  styleUrl: './session-details.css',
})
export class SessionDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly toastr = inject(ToastrService);
  private readonly venueService = inject(VenueService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  session = signal<SessionModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  deleting = signal(false);
  venues = signal<VenueModel[]>([]);

  private eventId = '';
  private sessionId = '';

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const sessionId =
      this.route.snapshot.paramMap.get('sessionId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    if (!sessionId) {
      this.error.set('Session ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventId = eventId;
    this.sessionId = sessionId;

    this.loadSession();
    this.loadVenues();
  }

  private loadVenues(): void {
    this.venueService.getVenues(this.eventId).subscribe({
      next: (response) => this.venues.set(response.data ?? []),
      error: () => undefined,
    });
  }

  venueName(venueId: string | null): string {
    if (!venueId) return 'No venue assigned';
    return this.venues().find(venue => venue.id === venueId)?.name ?? 'Venue unavailable';
  }

  private loadSession(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sessionService
      .getSessionById(
        this.eventId,
        this.sessionId,
      )
      .subscribe({
        next: (response) => {
          if (!response.data) {
            this.toastr.error('Session data was not returned.');
            this.loading.set(false);
            return;
          }

          this.session.set(response.data);
          this.loading.set(false);
        },

        error: (error: unknown) => {
          console.error(
            'Failed to load session:',
            error,
          );

          this.error.set('Failed to load session.');
          this.loading.set(false);
        },
      });
  }

  editSession(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sessions',
      this.sessionId,
      'edit',
    ]);
  }

  goBack(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sessions',
    ]);
  }

  deleteSession(): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this session?',
    );

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    this.sessionService
      .deleteSession(
        this.eventId,
        this.sessionId,
      )
      .subscribe({
        next: () => {
          this.deleting.set(false);

          this.toastr.success(
            'Session deleted successfully.',
          );

          this.goBack();
        },

        error: (error: unknown) => {
          console.error(
            'Failed to delete session:',
            error,
          );

          this.deleting.set(false);

          this.toastr.error(
            'Failed to delete session.',
          );
        },
      });
  }
}