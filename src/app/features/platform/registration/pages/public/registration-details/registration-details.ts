import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RegistrationStatusComponent } from '../../../components/registration-status/registration-status';
import { TicketComponent } from '../../../components/ticket/ticket';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationModel } from '../../../../../../core/models/registration/registration.model';

@Component({
  selector: 'app-public-registration-details',
  standalone: true,
  imports: [DatePipe, RegistrationStatusComponent, TicketComponent],
  templateUrl: './registration-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicRegistrationDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registrationService = inject(RegistrationService);

  protected readonly loading = signal(true);
  protected readonly registration = signal<RegistrationModel | null>(null);
  protected readonly error = signal<string | null>(null);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';
  private readonly registrationId = this.route.snapshot.paramMap.get('registrationId') ?? '';

  constructor() {
    if (!this.eventId || !this.registrationId) {
      this.loading.set(false);
      this.error.set('Registration could not be identified.');
      return;
    }

    this.loadRegistration();
  }

  protected loadRegistration(): void {
    this.loading.set(true);
    this.error.set(null);

    this.registrationService.getById(this.eventId, this.registrationId).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (!response.isSuccess || !response.data) {
          this.error.set(response.message || 'Registration could not be found.');
          return;
        }

        this.registration.set(response.data);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load the registration.');
      },
    });
  }

  protected goToRegistrations(): void {
    this.router.navigate(['/events', this.eventId, 'my-registrations']);
  }

  protected registerAgain(): void {
    this.router.navigate(['/events', this.eventId, 'register']);
  }

  protected goToFeedback(): void {
    this.router.navigate(['/events', this.eventId, 'feedback']);
  }
}
