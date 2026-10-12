import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RegistrationStatusComponent } from '../../../components/registration-status/registration-status';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationModel } from '../../../../../../core/models/registration/registration.model';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [DatePipe, RegistrationStatusComponent , RouterLink],
  templateUrl: './my-registrations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MyRegistrationsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registrationService = inject(RegistrationService);

  protected readonly loading = signal(true);
  protected readonly registrations = signal<RegistrationModel[]>([]);
  protected readonly error = signal<string | null>(null);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';

  ngOnInit() {
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
          this.error.set(response.message || 'Unable to load your registrations.');
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
    this.router.navigate(['/events', this.eventId, 'registrations', registrationId]);
  }

  protected registerAgain(): void {
    this.router.navigate(['/events', this.eventId, 'register']);
  }
}
