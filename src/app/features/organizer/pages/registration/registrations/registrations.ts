import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

import { RegistrationService } from '../../../../../core/services/registration/registration.service';

import {
  RegistrationModel,
  RegistrationStatsModel,
  RegistrationStatus,
} from '../../../../../core/models/registration/registration-index';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './registrations.html',
})

export class RegistrationsComponent {
  protected readonly eventState = inject(OrganizerEventStateService);

  private readonly service = inject(RegistrationService);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly eventId = this.eventState.eventId;

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly registrations = signal<RegistrationModel[]>([]);
  protected readonly stats = signal<RegistrationStatsModel | null>(null);

  protected readonly pageNumber = signal(1);
  protected readonly pageSize = 20;
  protected readonly totalPages = signal(1);

  protected readonly search = signal('');
  protected readonly statusFilter = signal<RegistrationStatus | null>(null);

  readonly RegistrationStatus = RegistrationStatus;
  
  protected readonly statuses = [
    {
      value: RegistrationStatus.Pending,
      label: 'Pending',
    },
    {
      value: RegistrationStatus.Approved,
      label: 'Approved',
    },
    {
      value: RegistrationStatus.Rejected,
      label: 'Rejected',
    },
    {
      value: RegistrationStatus.Cancelled,
      label: 'Cancelled',
    },
    {
      value: RegistrationStatus.Waitlisted,
      label: 'Waitlisted',
    },
  ];

  constructor() {
    this.load();
  }

  protected filteredRegistrations(): RegistrationModel[] {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.registrations().filter((item) => {
      const participant = item.participant;

      const text = [
        item.registrationNumber,
        participant?.firstName,
        participant?.lastName,
        participant?.email,
        participant?.organization,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !query || text.includes(query);
      const matchesStatus = status === null || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }

  protected statusLabel(status: RegistrationStatus): string {
    return RegistrationStatus[status] ?? 'Unknown';
  }

  protected open(registrationId: string): void {
    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.router.navigate(['/organizer', eventId, 'registration', 'registrations', registrationId]);
  }

  protected configure(): void {
    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.router.navigate(['/organizer', eventId, 'registration', 'form']);
  }

  protected approve(item: RegistrationModel, event: Event): void {
    event.stopPropagation();

    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.service
      .approve(eventId, item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.toastr.error(response.message || 'Approval failed.');
            return;
          }

          this.toastr.success(response.message || 'Registration approved.');

          this.load();
        },
        error: () => {
          this.toastr.error('Approval failed.');
        },
      });
  }

  protected reject(item: RegistrationModel, event: Event): void {
    event.stopPropagation();

    const reason = window.prompt('Reason for rejection:');

    if (reason === null) {
      return;
    }

    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.service
      .reject(eventId, item.id, {
        reason: reason.trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.toastr.error(response.message || 'Rejection failed.');
            return;
          }

          this.toastr.success(response.message || 'Registration rejected.');

          this.load();
        },
        error: () => {
          this.toastr.error('Rejection failed.');
        },
      });
  }

  protected cancel(item: RegistrationModel, event: Event): void {
    event.stopPropagation();

    if (!window.confirm('Cancel this registration?')) {
      return;
    }

    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.service
      .cancel(eventId, item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.toastr.error(response.message || 'Cancellation failed.');
            return;
          }

          this.toastr.success(response.message || 'Registration cancelled.');

          this.load();
        },
        error: () => {
          this.toastr.error('Cancellation failed.');
        },
      });
  }

  protected nextPage(): void {
    if (this.pageNumber() >= this.totalPages()) {
      return;
    }

    this.pageNumber.update((page) => page + 1);

    this.load();
  }

  protected previousPage(): void {
    if (this.pageNumber() <= 1) {
      return;
    }

    this.pageNumber.update((page) => page - 1);

    this.load();
  }

  private load(): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.error.set('No event is selected.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.service
      .list(eventId, this.pageNumber(), this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.error.set(response.message || 'Unable to load registrations.');
            this.loading.set(false);
            return;
          }

          const data = response.data;

          if (!data) {
            this.registrations.set([]);
            this.totalPages.set(1);
            this.loading.set(false);
            return;
          }

          this.registrations.set(data.items ?? []);
          this.totalPages.set(data.totalPages || 1);
          this.loading.set(false);
        },

        error: (err: {
          error?: {
            message?: string;
          };
          message?: string;
        }) => {
          this.error.set(err.error?.message ?? err.message ?? 'Unable to load registrations.');

          this.loading.set(false);
        },
      });

    this.service
      .getStats(eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.stats.set(response.data);
          }
        },
      });
  }
}
