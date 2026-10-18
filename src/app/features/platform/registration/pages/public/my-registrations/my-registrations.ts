import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RegistrationStatusComponent } from '../../../components/registration-status/registration-status';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationModel } from '../../../../../../core/models/registration';
import { ApiResponse } from '@/core/models/common';
import { createRawAsyncState } from '@/core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [DatePipe, RegistrationStatusComponent, RouterLink, AsyncState],
  templateUrl: './my-registrations.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyRegistrationsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registrationService = inject(RegistrationService);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';

  private readonly routeError = signal<string | null>(null);
  private readonly registrationsState = createRawAsyncState<ApiResponse<RegistrationModel[]>>(
    () => this.registrationService.getMine(this.eventId),
    { autoLoad: false, errorFallback: 'Unable to load your registrations.' }
  );

  protected readonly loading = this.registrationsState.loading;
  protected readonly registrations = computed(() => this.registrationsState.data()?.data ?? []);
  protected readonly error = computed<string | null>(() => {
    const stateError = this.registrationsState.error();
    if (stateError) return stateError;
    if (this.routeError()) return this.routeError();
    const response = this.registrationsState.data();
    if (response && (!response.isSuccess || !response.data)) {
      return response.message || 'Unable to load your registrations.';
    }
    return null;
  });

  ngOnInit() {
    if (!this.eventId) {
      this.routeError.set('Event could not be identified.');
      return;
    }

    this.loadRegistrations();
  }

  protected loadRegistrations(): void {
    this.routeError.set(null);
    this.registrationsState.load();
  }

  protected openRegistration(registrationId: string): void {
    this.router.navigate(['/events', this.eventId, 'registrations', registrationId]);
  }

  protected registerAgain(): void {
    this.router.navigate(['/events', this.eventId, 'register']);
  }
}
