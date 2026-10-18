import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';

import { RegistrationDialogService } from '../../../core/services/ui/registration-dialog.service';
import { RegistrationFormComponent } from '../../../features/platform/registration/components/registration-form/registration-form';
import { RegistrationFormService } from '../../../core/services/registration/registration-form.service';
import { RegistrationService } from '../../../core/services/registration/registration.service';
import { EventService } from '../../../core/services/event/event.service';
import { NotificationService } from '../../../core/services/ui/notification.service';
import {
  RegistrationFormModel,
  RegistrationFormSubmit,
  RegistrationScope
} from '../../../core/models/registration';
import { Event } from '../../../core/models/event';
import { ApiResponse } from '../../../core/models/common';
import { createAsyncAction, createRawAsyncState } from '@/core/state';

@Component({
  selector: 'app-registration-dialog',
  standalone: true,
  imports: [RegistrationFormComponent],
  templateUrl: './registration-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationDialog {
  protected readonly service = inject(RegistrationDialogService);
  private readonly registrationFormService = inject(RegistrationFormService);
  private readonly registrationService = inject(RegistrationService);
  private readonly eventService = inject(EventService);
  private readonly toastr = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly eventId = computed(() => this.service.config()?.eventId ?? '');
  protected readonly contextTitle = computed(() => this.service.config()?.contextTitle ?? null);

  private readonly formState = createRawAsyncState<ApiResponse<RegistrationFormModel>>(
    () => this.registrationFormService.get(this.eventId()),
    { autoLoad: false, errorFallback: 'Unable to load the registration form.' }
  );
  private readonly eventState = createRawAsyncState<ApiResponse<Event>>(
    () => this.eventService.getEventById(this.eventId()),
    { autoLoad: false }
  );

  protected readonly loading = this.formState.loading;
  protected readonly registrationForm = computed(() => this.formState.data()?.data ?? null);
  protected readonly event = computed(() => this.eventState.data()?.data ?? null);
  protected readonly error = computed<string | null>(() => {
    const stateError = this.formState.error();
    if (stateError) return stateError;

    const response = this.formState.data();
    if (response && (!response.isSuccess || !response.data)) {
      return response.message || 'Registration form is not available.';
    }

    return null;
  });

  private readonly submitAction = createAsyncAction(
    (request: RegistrationFormSubmit) => {
      const config = this.service.config();

      return this.registrationService.create(this.eventId(), {
        ...request,
        scopeType: config?.scopeType ?? RegistrationScope.Event,
        scopeId: config?.scopeId ?? null
      });
    },
    {
      onSuccess: (response) => {
        if (!response.isSuccess || !response.data) {
          this.toastr.error(response.message || 'Registration failed.');
          return;
        }

        this.toastr.success('Your registration was submitted successfully.');
        const eventId = this.eventId();
        const registrationId = response.data.id;
        this.service.close();
        void this.router.navigate(['/events', eventId, 'registrations', registrationId]);
      },
      errorFallback: 'Unable to submit your registration.'
    }
  );

  protected readonly submitting = this.submitAction.pending;

  constructor() {
    effect(() => {
      if (this.service.isOpen() && this.service.config()) {
        this.formState.load();
        this.eventState.load();
      }
    });
  }

  protected submitRegistration(request: RegistrationFormSubmit): void {
    if (this.submitting()) {
      return;
    }

    this.submitAction.run(request);
  }

  protected close(): void {
    this.service.close();
  }
}
