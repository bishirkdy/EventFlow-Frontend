import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { RegistrationService } from '../../../../../core/services/registration/registration.service';
import { RegistrationModel } from '../../../../../core/models/registration/registration.model';
import { RegistrationStatus } from '../../../../../core/models/registration/registration.enums';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-registration-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './registration-details.html',
})
export class RegistrationDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly service = inject(RegistrationService);
  private readonly toastr = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly registration = signal<RegistrationModel | null>(null);

  protected readonly status = RegistrationStatus;

  constructor() {
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

    this.service
      .reject(eventId, item.id, { reason: reason.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.toastr.error(response.message || 'Rejection failed.');
            return;
          }
          this.toastr.success('Registration rejected.');
          this.registration.set(response.data);
        },
        error: () => this.toastr.error('Rejection failed.'),
      });
  }

  protected waitlist(): void {
    this.action(
      (eventId, id) => this.service.waitlist(eventId, id),
      'Registration moved to waitlist.',
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
      registrationId: string,
    ) => ReturnType<RegistrationService['approve']>,
    successMessage: string,
  ): void {
    const eventId = this.eventState.eventId();
    const item = this.registration();

    if (!eventId || !item) return;

    request(eventId, item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.toastr.error(response.message || 'Action failed.');
            return;
          }
          this.toastr.success(successMessage);
          this.registration.set(response.data);
        },
        error: () => this.toastr.error('Action failed.'),
      });
  }

  private load(): void {
    const eventId = this.eventState.eventId() ?? this.route.snapshot.paramMap.get('eventId');
    const registrationId = this.route.parent?.snapshot?.paramMap?.get('registrationId') ||
      this.route.pathFromRoot
        .map((route) => route.snapshot.paramMap.get('registrationId'))
        .filter(Boolean)[0];

    console.log('eventId:', eventId);
    console.log('registrationId:', registrationId);

    if (!eventId || !registrationId) {
      this.error.set('Registration could not be identified.');
      return;
    }

    this.loading.set(true);

    this.service
      .getById(eventId, registrationId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          console.log('DETAIL RESPONSE:', response);

          if (!response.isSuccess || !response.data) {
            this.error.set(response.message || 'Unable to load registration.');
            return;
          }

          this.registration.set(response.data);

          console.log('REGISTRATION:', this.registration());
        },

        error: (err: { error?: { message?: string }; message?: string }) => {
          console.error('DETAIL ERROR:', err);

          this.error.set(err.error?.message ?? err.message ?? 'Unable to load registration.');
        },
      });
  }
}
