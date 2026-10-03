import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { ParticipantService } from '../../../../../core/services/registration/participant.service';
import { ParticipantModel } from '../../../../../core/models/registration/participant.model';
import { ParticipantStatus } from '../../../../../core/models/registration/registration.enums';

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './participants.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantsComponent {
  protected readonly state = inject(OrganizerEventStateService);

  private readonly service = inject(ParticipantService);
  private readonly router = inject(Router);
  private readonly searchChanged = new Subject<void>();

  readonly participants = signal<ParticipantModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly status = signal<number | null>(null);
  readonly page = signal(1);
  readonly totalPages = signal(1);

  protected readonly statuses = [
    {
      value: ParticipantStatus.Active,
      label: 'Active',
    },
    {
      value: ParticipantStatus.Cancelled,
      label: 'Cancelled',
    },
  ];

  constructor() {
    this.searchChanged
      .pipe(
        debounceTime(300),
        switchMap(() => {
          this.page.set(1);
          return this.loadRequest();
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (response) => {
          const data = response.data;

          this.participants.set(data?.items ?? []);
          this.totalPages.set(data?.totalPages ?? 1);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Unable to load participants.');
        },
      });

    this.load();
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
    this.loading.set(true);
    this.error.set(null);

    this.loadRequest().subscribe({
      next: (response) => {
        const data = response.data;

        this.participants.set(data?.items ?? []);
        this.totalPages.set(data?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load participants.');
      },
    });
  }

  private loadRequest() {
    const eventId = this.state.eventId();

    if (!eventId) {
      throw new Error('Event ID is not available.');
    }

    return this.service.list(
      eventId,
      this.page(),
      20,
      this.search(),
      this.status(),
    );
  }

  openParticipant(participant: ParticipantModel): void {
    this.router.navigate([
      '/organizer',
      this.state.eventId(),
      'registration',
      'registrations',
      participant.registrationId,
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
