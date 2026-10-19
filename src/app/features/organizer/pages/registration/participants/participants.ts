import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { ParticipantService } from '../../../../../core/services/registration/participant.service';
import { SessionService } from '../../../../../core/services/session/session.service';
import { SessionModel } from '../../../../../core/models/session';
import {
  ParticipantModel,
  ParticipantStatus,
  RegistrationScope
} from '../../../../../core/models/registration';
import { createAsyncAction } from '@/core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [FormsModule, RouterLink, AsyncState],
  templateUrl: './participants.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantsComponent {
  protected readonly state = inject(OrganizerEventStateService);

  private readonly service = inject(ParticipantService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly searchChanged = new Subject<void>();

  readonly participants = signal<ParticipantModel[]>([]);
  readonly sessions = signal<SessionModel[]>([]);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly status = signal<number | null>(null);
  readonly page = signal(1);
  readonly totalPages = signal(1);

  readonly participantStatus = ParticipantStatus;

  private readonly listAction = createAsyncAction(() => this.loadRequest(), {
    errorFallback: 'Unable to load participants.',
    onError: () => this.error.set('Unable to load participants.'),
    onSuccess: (response) => this.applyList(response)
  });

  private readonly sessionsAction = createAsyncAction(
    (eventId: string) => this.sessionService.getSessions(eventId),
    {
      onError: () => this.sessions.set([]),
      onSuccess: (response) => this.sessions.set(response.data ?? [])
    }
  );

  readonly loading = this.listAction.pending;

  protected readonly statuses = [
    {
      value: ParticipantStatus.Active,
      label: 'Active'
    },
    {
      value: ParticipantStatus.Cancelled,
      label: 'Cancelled'
    }
  ];

  constructor() {
    this.searchChanged
      .pipe(
        debounceTime(300),
        switchMap(() => {
          this.page.set(1);
          return this.loadRequest();
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (response) => this.applyList(response),
        error: () => this.error.set('Unable to load participants.')
      });

    this.load();
  }

  private applyList(response: {
    data?: { items?: ParticipantModel[]; totalPages?: number } | null;
  }): void {
    const data = response.data;

    this.participants.set(data?.items ?? []);
    this.totalPages.set(data?.totalPages ?? 1);
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.searchChanged.next();
  }

  onStatus(value: string): void {
    this.status.set(value === '' ? null : Number(value));
    this.page.set(1);
    this.load();
  }

  load(): void {
    this.error.set(null);

    this.listAction.run();
    this.loadSessions();
  }

  private loadSessions(): void {
    const eventId = this.state.eventId();

    if (eventId) {
      this.sessionsAction.run(eventId);
    }
  }

  sessionTitle(participant: ParticipantModel): string {
    if (participant.scopeType !== RegistrationScope.Session || !participant.scopeId) {
      return '—';
    }

    return (
      this.sessions().find((session) => session.id === participant.scopeId)?.title ?? 'Session'
    );
  }

  private loadRequest() {
    const eventId = this.state.eventId();

    if (!eventId) {
      throw new Error('Event ID is not available.');
    }

    return this.service.list(eventId, this.page(), 20, this.search(), this.status());
  }

  openParticipant(participant: ParticipantModel): void {
    this.router.navigate([
      '/organizer',
      this.state.eventId(),
      'registration',
      'registrations',
      participant.registrationId
    ]);
  }

  previousPage(): void {
    if (this.page() <= 1) {
      return;
    }

    this.page.update((value) => value - 1);
    this.load();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) {
      return;
    }

    this.page.update((value) => value + 1);
    this.load();
  }
}
