import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { RegistrationFormComponent } from '../../../components/registration-form/registration-form';
import { RegistrationFormService } from '../../../../../../core/services/registration/registration-form.service';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationFormModel } from '../../../../../../core/models/registration/registration-form.model';
import { EventService } from '../../../../../../core/services/event/event.service';
import { Event } from '../../../../../../core/models/event/event.model';
import { RegistrationFormSubmit } from '../../../../../../core/models/registration/registration-form-submit.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RegistrationFormComponent],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registrationFormService = inject(RegistrationFormService);
  private readonly registrationService = inject(RegistrationService);
  private readonly eventService = inject(EventService);
  private readonly toastr = inject(ToastrService);

  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly registrationForm = signal<RegistrationFormModel | null>(null);
  protected readonly event = signal<Event | null>(null);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';

  constructor() {
    if (!this.eventId) {
      this.loading.set(false);
      this.error.set('Event could not be identified.');
      return;
    }

    this.loadRegistrationForm();
    this.loadEvent();
  }

  protected loadRegistrationForm(): void {
    this.loading.set(true);
    this.error.set(null);

    this.registrationFormService.get(this.eventId).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (!response.isSuccess || !response.data) {
          this.error.set(response.message || 'Registration form is not available.');
          return;
        }

        this.registrationForm.set(response.data);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load the registration form.');
      },
    });
  }

  private loadEvent(): void {
    this.eventService.getEventById(this.eventId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.event.set(response.data);
        }
      },
    });
  }

  protected submitRegistration(request: RegistrationFormSubmit): void {
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);

    this.registrationService.create(this.eventId, request).subscribe({
      next: (response) => {
        this.submitting.set(false);

        if (!response.isSuccess || !response.data) {
          this.toastr.error(response.message || 'Registration failed.');
          return;
        }

        this.toastr.success('Your registration was submitted successfully.');

        this.router.navigate(['/events', this.eventId, 'my-registrations']);
      },
      error: () => {
        this.submitting.set(false);
        this.toastr.error('Unable to submit your registration.');
      },
    });
  }
}
