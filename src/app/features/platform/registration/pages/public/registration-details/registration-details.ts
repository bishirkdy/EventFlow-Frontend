import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RegistrationStatusComponent } from '../../../components/registration-status/registration-status';
import { TicketComponent } from '../../../components/ticket/ticket';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationModel } from '../../../../../../core/models/registration/registration.model';
import { FeedbackComponent } from '@/features/platform/feedback/feedback';

@Component({
  selector: 'app-public-registration-details',
  standalone: true,
  imports: [DatePipe, RegistrationStatusComponent, TicketComponent, FeedbackComponent],
  templateUrl: './registration-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicRegistrationDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registrationService = inject(RegistrationService);

  protected readonly loading = signal(true);
  protected readonly registration = signal<RegistrationModel | null>(null);
  protected readonly error = signal<string | null>(null);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';
  private readonly registrationId = this.route.snapshot.paramMap.get('registrationId') ?? '';

  protected readonly showFeedbackPopup = signal(false);
  protected readonly feedbackEventId = signal<string | null>(null);

  ngOnInit() {
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
    this.feedbackEventId.set(this.eventId);
    this.showFeedbackPopup.set(true);
  }

  protected closeFeedbackPopup(): void {
    this.showFeedbackPopup.set(false);
    this.feedbackEventId.set(null);
  }
}
