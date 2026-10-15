import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../../../core/services/ui/notification.service';

import { RegistrationFormComponent } from '../../../components/registration-form/registration-form';
import { RegistrationFormService } from '../../../../../../core/services/registration/registration-form.service';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationFormModel } from '../../../../../../core/models/registration';
import { EventService } from '../../../../../../core/services/event/event.service';
import { Event } from '../../../../../../core/models/event';
import { RegistrationFormSubmit } from '../../../../../../core/models/registration';
import { ApiResponse } from '@/core/models/common';
import { createAsyncAction, createRawAsyncState } from 'core/state';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RegistrationFormComponent],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RegisterComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registrationFormService = inject(RegistrationFormService);
  private readonly registrationService = inject(RegistrationService);
  private readonly eventService = inject(EventService);
  private readonly toastr = inject(NotificationService);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';

  private readonly routeError = signal<string | null>(null);
  private readonly formState = createRawAsyncState<ApiResponse<RegistrationFormModel>>(
    () => this.registrationFormService.get(this.eventId),
    { autoLoad: false, errorFallback: 'Unable to load the registration form.' },
  );
  private readonly eventState = createRawAsyncState<ApiResponse<Event>>(
    () => this.eventService.getEventById(this.eventId),
    { autoLoad: false },
  );

  protected readonly loading = this.formState.loading;
  protected readonly registrationForm = computed(() => this.formState.data()?.data ?? null);
  protected readonly event = computed(() => this.eventState.data()?.data ?? null);
  protected readonly error = computed<string | null>(() => {
    const stateError = this.formState.error();
    if (stateError) return stateError;
    if (this.routeError()) return this.routeError();
    const response = this.formState.data();
    if (response && (!response.isSuccess || !response.data)) {
      return response.message || 'Registration form is not available.';
    }
    return null;
  });

  private readonly submitAction = createAsyncAction(
    (request: RegistrationFormSubmit) =>
      this.registrationService.create(this.eventId, request),
    {
      onSuccess: (response) => {
        if (!response.isSuccess || !response.data) {
          this.toastr.error(response.message || 'Registration failed.');
          return;
        }

        this.toastr.success('Your registration was submitted successfully.');
        this.router.navigate(['/events', this.eventId, 'registrations', response.data.id]);
      },
      errorFallback: 'Unable to submit your registration.',
    },
  );

  protected readonly submitting = this.submitAction.pending;

  ngOnInit(): void {
    if (!this.eventId) {
      this.routeError.set('Event could not be identified.');
      return;
    }

    this.loadRegistrationForm();
    this.loadEvent();
  }

  protected loadRegistrationForm(): void {
    this.routeError.set(null);
    this.formState.load();
  }

  private loadEvent(): void {
    this.eventState.load();
  }

  protected submitRegistration(request: RegistrationFormSubmit): void {
    if (this.submitting()) {
      return;
    }

    this.submitAction.run(request);
  }
}
