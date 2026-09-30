import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RegistrationStatusComponent } from '../../../components/registration-status/registration-status';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationModel } from '../../../../../../core/models/registration/registration.model';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [RegistrationStatusComponent , DatePipe],
  templateUrl: './my-registrations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MyRegistrationsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registrationService = inject(RegistrationService);
  private readonly toastr = inject(ToastrService);

  protected readonly loading = signal(true);
  protected readonly registrations = signal<RegistrationModel[]>([]);
  protected readonly error = signal<string | null>(null);

  private readonly eventId =
    this.route.snapshot.paramMap.get('eventId') ?? '';

  constructor() {
    if (!this.eventId) {
      this.loading.set(false);
      this.error.set('Event could not be identified.');
      return;
    }

    this.loadRegistrations();
  }

  protected loadRegistrations(): void {
    this.loading.set(true);
    this.error.set(null);

    this.registrationService.getMine(this.eventId).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (!response.isSuccess || !response.data) {
          this.error.set(
            response.message || 'Unable to load your registrations.',
          );
          return;
        }

        this.registrations.set(response.data);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load your registrations.');
      },
    });
  }

  protected openRegistration(registrationId: string): void {
    this.router.navigate([
      '/events',
      this.eventId,
      'registrations',
      registrationId,
    ]);
  }

  protected registerAgain(): void {
    this.router.navigate([
      '/events',
      this.eventId,
      'register',
    ]);
  }
}