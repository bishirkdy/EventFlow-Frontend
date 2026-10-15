import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { SessionModel } from '../../../../core/models/session';
import { SessionService } from '../../../../core/services/session/session.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { createAsyncAction, createAsyncState } from 'core/state';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './sessions.html',
  styleUrl: './sessions.css',
})
export class Sessions implements OnInit {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  private eventId = '';
  private readonly routeError = signal<string | null>(null);

  private readonly sessionsState = createAsyncState<SessionModel[]>(
    () => this.sessionService.getSessions(this.eventId),
    { initial: [], autoLoad: false, errorFallback: 'Failed to load sessions.' },
  );

  private readonly deleteAction = createAsyncAction(
    (sessionId: string) => this.sessionService.deleteSession(this.eventId, sessionId),
    {
      successMessage: 'Session deleted successfully.',
      errorFallback: 'Failed to delete session.',
      onSuccess: () => this.loadSessions(),
      onSettled: () => this.deleting.set(null),
    },
  );

  sessions = this.sessionsState.data;
  loading = this.sessionsState.loading;
  error = computed(() => this.sessionsState.error() ?? this.routeError());
  deleting = signal<string | null>(null);

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.routeError.set('Event ID not found.');
      return;
    }

    this.eventId = eventId;
    this.loadSessions();
  }

  loadSessions(): void {
    this.routeError.set(null);
    this.sessionsState.load();
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

    this.deleteAction.run(sessionId);
  }
}
