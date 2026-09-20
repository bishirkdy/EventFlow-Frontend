import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { SessionModel } from '../../../../../core/models/session/session.model';
import { SessionService } from '../../../../../core/services/session/session.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-session-details',
  standalone: true,
  imports: [],
  templateUrl: './session-details.html',
  styleUrl: './session-details.css',
})
export class SessionDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  session = signal<SessionModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  deleting = signal(false);

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