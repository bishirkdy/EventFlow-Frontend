import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RegistrationFormComponent, RegistrationFormSubmit } from '../../../components/registration-form/registration-form';
import { RegistrationFormService } from '../../../../../../core/services/registration/registration-form.service';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationFormModel } from '../../../../../../core/models/registration/registration-form.model';


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
  private readonly toastr = inject(ToastrService);

  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly registrationForm = signal<RegistrationFormModel | null>(
    null,
  );

  private readonly eventId: string;

  constructor() {
    this.eventId = this.route.snapshot.paramMap.get('eventId') ?? '';

    if (!this.eventId) {
      this.loading.set(false);
      this.error.set('Event could not be identified.');
      return;
    }

    this.loadRegistrationForm();
  }

  protected loadRegistrationForm(): void {
    this.loading.set(true);
    this.error.set(null);

    this.registrationFormService.get(this.eventId).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (!response.isSuccess || !response.data) {
          this.error.set(
            response.message || 'Registration form is not available.',
          );
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

  protected submitRegistration(
    request: RegistrationFormSubmit,
  ): void {
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);

    this.registrationService.create(this.eventId, request).subscribe({
      next: (response) => {
        this.submitting.set(false);

        if (!response.isSuccess || !response.data) {
          this.toastr.error(
            response.message || 'Registration failed.',
            'Registration',
          );
          return;
        }

        this.toastr.success(
          'Your registration was submitted successfully.',
          'Registration',
        );

        this.router.navigate([
          '/events',
          this.eventId,
          'my-registrations',
        ]);
      },
      error: () => {
        this.submitting.set(false);

        this.toastr.error(
          'Unable to submit your registration.',
          'Registration',
        );
      },
    });
  }
}