import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { RegistrationService } from '../../../../../core/services/registration/registration.service';
import { RegistrationModel, RegistrationStatus } from '../../../../../core/models/registration';
import { getApiErrorMessage } from '@/core/api/api-error';
import { createAsyncAction } from '@/core/state';

@Component({
  selector: 'app-registration-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './registration-details.html'
})
export class RegistrationDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly service = inject(RegistrationService);
  private readonly toastr = inject(NotificationService);

  protected readonly error = signal<string | null>(null);
  protected readonly registration = signal<RegistrationModel | null>(null);

  protected readonly status = RegistrationStatus;

  private readonly loadAction = createAsyncAction(
    (eventId: string, registrationId: string) =>
      this.service.getByIdForOrganizer(eventId, registrationId),
    {
      errorFallback: 'Unable to load registration.',
      onError: (err) => {
        this.error.set(getApiErrorMessage(err, 'Unable to load registration.'));
      },
      onSuccess: (response) => {
        if (!response.isSuccess || !response.data) {
          this.error.set(response.message || 'Unable to load registration.');
          return;
        }

        this.registration.set(response.data);
      }
    }
  );

  private readonly statusAction = createAsyncAction(
    (request$: ReturnType<RegistrationService['approve']>, successMessage: string) =>
      request$.pipe(map((response) => ({ successMessage, response }))),
    {
      errorFallback: 'Action failed.',
      onSuccess: ({ successMessage, response }) => {
        if (!response.isSuccess) {
          this.toastr.error(response.message || 'Action failed.');
          return;
        }
        this.toastr.success(successMessage);
        this.registration.set(response.data);
      }
    }
  );

  private readonly rejectAction = createAsyncAction(
    (request$: ReturnType<RegistrationService['reject']>) => request$,
    {
      errorFallback: 'Rejection failed.',
      onSuccess: (response) => {
        if (!response.isSuccess) {
          this.toastr.error(response.message || 'Rejection failed.');
          return;
        }
        this.toastr.success('Registration rejected.');
        this.registration.set(response.data);
      }
    }
  );

  protected readonly loading = this.loadAction.pending;

  ngOnInit(): void {
    this.load();
  }

  protected back(): void {
    const eventId = this.eventState.eventId();
    if (eventId) {
      this.router.navigate(['/organizer', eventId, 'registration', 'registrations']);
    }
  }

  protected approve(): void {
    this.action((eventId, id) => this.service.approve(eventId, id), 'Registration approved.');
  }

  protected reject(): void {
    const reason = window.prompt('Reason for rejection:');
    if (reason === null) return;
    const eventId = this.eventState.eventId();
    const item = this.registration();
    if (!eventId || !item) return;

    this.rejectAction.run(this.service.reject(eventId, item.id, { reason: reason.trim() }));
  }

  protected waitlist(): void {
    this.action(
      (eventId, id) => this.service.waitlist(eventId, id),
      'Registration moved to waitlist.'
    );
  }

  protected promote(): void {
    this.action((eventId, id) => this.service.promote(eventId, id), 'Registration promoted.');
  }

  protected cancel(): void {
    if (!window.confirm('Cancel this registration?')) return;
    this.action((eventId, id) => this.service.cancel(eventId, id), 'Registration cancelled.');
  }

  protected statusLabel(value: RegistrationStatus): string {
    return RegistrationStatus[value] ?? 'Unknown';
  }

  private action(
    request: (
      eventId: string,
      registrationId: string
    ) => ReturnType<RegistrationService['approve']>,
    successMessage: string
  ): void {
    const eventId = this.eventState.eventId();
    const item = this.registration();

    if (!eventId || !item) return;

    this.statusAction.run(request(eventId, item.id), successMessage);
  }

  private load(): void {
    const eventId = this.eventState.eventId() ?? this.route.snapshot.paramMap.get('eventId');
    const registrationId =
      this.route.parent?.snapshot?.paramMap?.get('registrationId') ||
      this.route.pathFromRoot
        .map((route) => route.snapshot.paramMap.get('registrationId'))
        .filter(Boolean)[0];

    if (!eventId || !registrationId) {
      this.error.set('Registration could not be identified.');
      return;
    }

    this.loadAction.run(eventId, registrationId);
  }
}
