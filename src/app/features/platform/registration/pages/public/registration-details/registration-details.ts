import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, of } from 'rxjs';

import { RegistrationStatusComponent } from '../../../components/registration-status/registration-status';
import { TicketComponent } from '../../../components/ticket/ticket';
import { RegistrationService } from '../../../../../../core/services/registration/registration.service';
import { RegistrationModel, RegistrationScope } from '../../../../../../core/models/registration';
import { EventService } from '@/core/services/event/event.service';
import { SessionService } from '@/core/services/session/session.service';
import { Event } from '@/core/models/event';
import { SessionModel } from '@/core/models/session';
import { FeedbackComponent } from '@/features/platform/feedback/feedback';
import { ApiResponse } from '@/core/models/common';
import { createAsyncState, createRawAsyncState } from '@/core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-public-registration-details',
  standalone: true,
  imports: [DatePipe, RegistrationStatusComponent, TicketComponent, FeedbackComponent, AsyncState],
  templateUrl: './registration-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicRegistrationDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registrationService = inject(RegistrationService);
  private readonly eventService = inject(EventService);
  private readonly sessionService = inject(SessionService);

  private readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';
  private readonly registrationId = this.route.snapshot.paramMap.get('registrationId') ?? '';

  private readonly routeError = signal<string | null>(null);
  private readonly registrationState = createRawAsyncState<ApiResponse<RegistrationModel>>(
    () => this.registrationService.getById(this.eventId, this.registrationId),
    { autoLoad: false, errorFallback: 'Unable to load the registration.' }
  );
  private readonly eventState = createAsyncState<Event>(
    () => this.eventService.getEventById(this.eventId),
    { autoLoad: false, errorFallback: 'Unable to load the event details.' }
  );

  protected readonly sessionScopeId = computed(() => {
    const registration = this.registration();
    return registration && registration.scopeType === RegistrationScope.Session
      ? registration.scopeId
      : null;
  });

  private readonly sessionState = createRawAsyncState<SessionModel | null>(
    () => {
      const scopeId = this.sessionScopeId();
      return scopeId
        ? this.sessionService.getSessionById(this.eventId, scopeId).pipe(map((r) => r.data))
        : of<SessionModel | null>(null);
    },
    { initial: null, autoLoad: false }
  );

  protected readonly loading = this.registrationState.loading;
  protected readonly registration = computed(() => this.registrationState.data()?.data ?? null);
  protected readonly event = computed(() => this.eventState.data());
  protected readonly session = computed(() => this.sessionState.data());
  protected readonly error = computed<string | null>(() => {
    const stateError = this.registrationState.error();
    if (stateError) return stateError;
    if (this.routeError()) return this.routeError();
    const response = this.registrationState.data();
    if (response && (!response.isSuccess || !response.data)) {
      return response.message || 'Registration could not be found.';
    }
    return null;
  });

  protected readonly showFeedbackPopup = signal(false);
  protected readonly feedbackEventId = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.sessionScopeId()) {
        this.sessionState.load();
      }
    });
  }

  ngOnInit() {
    if (!this.eventId || !this.registrationId) {
      this.routeError.set('Registration could not be identified.');
      return;
    }

    this.loadRegistration();
  }

  protected loadRegistration(): void {
    this.routeError.set(null);
    this.eventState.load();
    this.registrationState.load();
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
