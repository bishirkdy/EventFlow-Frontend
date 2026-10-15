import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

import { RegistrationService } from '../../../../../core/services/registration/registration.service';

import {
  RegistrationModel,
  RegistrationStatsModel,
  RegistrationStatus,
} from '../../../../../core/models/registration';
import { getApiErrorMessage } from 'core/api/api-error';
import { createAsyncAction } from 'core/state';

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
  private readonly filterChanged = new Subject<void>();

  protected readonly eventId = this.eventState.eventId;

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

  private readonly listAction = createAsyncAction(
    (eventId: string) => this.service.list(eventId, this.pageNumber(), this.pageSize),
    {
      errorFallback: 'Unable to load registrations.',
      onError: (err) =>
        this.error.set(
          getApiErrorMessage(err, 'Unable to load registrations.'),
        ),
      onSuccess: (response) => {
        if (!response.isSuccess) {
          this.error.set(response.message || 'Unable to load registrations.');
          return;
        }

        const data = response.data;

        if (!data) {
          this.registrations.set([]);
          this.totalPages.set(1);
          return;
        }

        this.registrations.set(data.items ?? []);
        this.totalPages.set(data.totalPages || 1);
      },
    },
  );

  private readonly statsAction = createAsyncAction(
    (eventId: string) => this.service.getStats(eventId),
    {
      onSuccess: (response) => {
        if (response.isSuccess && response.data) {
          this.stats.set(response.data);
        }
      },
    },
  );

  private readonly approveAction = createAsyncAction(
    (eventId: string, registrationId: string) => this.service.approve(eventId, registrationId),
    {
      errorFallback: 'Approval failed.',
      onSuccess: (response) => {
        if (!response.isSuccess) {
          this.toastr.error(response.message || 'Approval failed.');
          return;
        }

        this.toastr.success(response.message || 'Registration approved.');

        this.load();
      },
    },
  );

  private readonly rejectAction = createAsyncAction(
    (eventId: string, registrationId: string, reason: string) =>
      this.service.reject(eventId, registrationId, { reason }),
    {
      errorFallback: 'Rejection failed.',
      onSuccess: (response) => {
        if (!response.isSuccess) {
          this.toastr.error(response.message || 'Rejection failed.');
          return;
        }

        this.toastr.success(response.message || 'Registration rejected.');

        this.load();
      },
    },
  );

  private readonly cancelAction = createAsyncAction(
    (eventId: string, registrationId: string) => this.service.cancel(eventId, registrationId),
    {
      errorFallback: 'Cancellation failed.',
      onSuccess: (response) => {
        if (!response.isSuccess) {
          this.toastr.error(response.message || 'Cancellation failed.');
          return;
        }

        this.toastr.success(response.message || 'Registration cancelled.');

        this.load();
      },
    },
  );

  protected readonly loading = this.listAction.pending;

  constructor() {
    this.filterChanged
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pageNumber.set(1);
        this.load();
      });

    this.load();
  }

  protected filteredRegistrations(): RegistrationModel[] {
    const search = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.registrations().filter((item) => {
      const matchesSearch =
        !search ||
        `${item.participant?.firstName ?? ''} ${item.participant?.lastName ?? ''}`
          .toLowerCase()
          .includes(search) ||
        (item.participant?.email ?? '').toLowerCase().includes(search) ||
        item.registrationNumber.toLowerCase().includes(search);

      const matchesStatus = status === null || item.status === status;

      return matchesSearch && matchesStatus;
    });
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    this.filterChanged.next();
  }

  protected onStatus(value: string): void {
    this.statusFilter.set(value === '' ? null : Number(value));
    this.pageNumber.set(1);
    this.load();
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

    this.approveAction.run(eventId, item.id);
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

    this.rejectAction.run(eventId, item.id, reason.trim());
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

    this.cancelAction.run(eventId, item.id);
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

    this.error.set(null);

    this.listAction.run(eventId);
    this.statsAction.run(eventId);
  }
}
