import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { SessionModel } from '../../../../core/models/session/session.model';
import { SessionService } from '../../../../core/services/session/session.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [],
  templateUrl: './sessions.html',
  styleUrl: './sessions.css',
})
export class Sessions implements OnInit {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  sessions = signal<SessionModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  deleting = signal<string | null>(null);

  private eventId = '';

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventId = eventId;
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sessionService.getSessions(this.eventId).subscribe({
      next: (response) => {
        this.sessions.set(response.data ?? []);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error(
          'Failed to load sessions:',
          error,
        );

        this.error.set('Failed to load sessions.');
        this.loading.set(false);
      },
    });
  }

  createSession(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sessions',
      'create',
    ]);
  }

  viewSession(sessionId: string): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sessions',
      sessionId,
    ]);
  }

  editSession(sessionId: string): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sessions',
      sessionId,
      'edit',
    ]);
  }

  deleteSession(sessionId: string): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this session?',
    );

    if (!confirmed) {
      return;
    }

    this.deleting.set(sessionId);

    this.sessionService
      .deleteSession(
        this.eventId,
        sessionId,
      )
      .subscribe({
        next: () => {
          this.deleting.set(null);

          this.toastr.success(
            'Session deleted successfully.',
          );

          this.loadSessions();
        },

        error: (error: unknown) => {
          console.error(
            'Failed to delete session:',
            error,
          );

          this.deleting.set(null);

          this.toastr.error(
            'Failed to delete session.',
          );
        },
      });
  }
}