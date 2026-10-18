import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UpdateSessionModel } from '../../../../../core/models/session';
import { SessionService } from '../../../../../core/services/session/session.service';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../../core/models/venue';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { Event as EventModel } from '../../../../../core/models/event';
import { createAsyncAction } from '@/core/state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-update-session',
  standalone: true,
  imports: [FormsModule, CapitalizePipe, AsyncState],
  templateUrl: './update-session.html',
  styleUrl: './update-session.css'
})
export class UpdateSession implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly venueService = inject(VenueService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  eventId = '';
  sessionId = '';

  error = signal<string | null>(null);
  loadError = signal<string | null>(null);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  currentImageUrl = signal<string | null>(null);
  venues = signal<VenueModel[]>([]);
  event = signal<EventModel | null>(null);
  eventStartLocal = signal('');
  eventEndLocal = signal('');
  eventWindowLabel = signal('');

  private readonly venuesAction = createAsyncAction(
    () => this.venueService.getVenues(this.eventId),
    {
      toastErrors: true,
      errorFallback: 'Failed to load venues.',
      onSuccess: (response) => this.venues.set(response.data ?? [])
    }
  );

  private readonly sessionAction = createAsyncAction(
    () => this.sessionService.getSessionById(this.eventId, this.sessionId),
    {
      errorFallback: 'Failed to load session.',
      onError: () => this.loadError.set('Failed to load session.'),
      onSuccess: (response) => {
        const data = response.data;
        if (!data) {
          this.loadError.set('Session data was not returned.');
          return;
        }

        this.session = {
          title: data.title,
          description: data.description ?? '',
          sessionType: data.sessionType,
          capacity: data.capacity,
          startTime: data.startTime ? this.toLocalDateTime(data.startTime) : null,
          endTime: data.endTime ? this.toLocalDateTime(data.endTime) : null,
          venueId: data.venueId,
          allowRegistration: data.allowRegistration
        };
        this.currentImageUrl.set(data.imageUrl ?? null);
        this.imagePreview.set(data.imageUrl ?? null);
      }
    }
  );

  private readonly updateAction = createAsyncAction(
    (request: UpdateSessionModel) =>
      this.sessionService.updateSession(this.eventId, this.sessionId, request),
    {
      successMessage: 'Session updated successfully.',
      errorFallback: 'Failed to update session.',
      onSuccess: () =>
        this.router.navigate(['/organizer', this.eventId, 'sessions', this.sessionId])
    }
  );

  loading = this.sessionAction.pending;
  saving = this.updateAction.pending;
  loadingVenues = this.venuesAction.pending;

  session: UpdateSessionModel = {
    title: '',
    description: '',
    sessionType: '',
    capacity: null,
    startTime: null,
    endTime: null,
    venueId: null,
    allowRegistration: false
  };

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const sessionId = this.route.snapshot.paramMap.get('sessionId');

    if (!eventId) {
      this.loadError.set('Event ID not found.');
      return;
    }

    if (!sessionId) {
      this.loadError.set('Session ID not found.');
      return;
    }

    this.eventId = eventId;
    this.sessionId = sessionId;
    const currentEvent = this.organizerEventState.event();
    if (currentEvent) {
      this.event.set(currentEvent);
      this.eventStartLocal.set(
        this.toEventLocalDateTime(currentEvent.startDate, currentEvent.timeZone)
      );
      this.eventEndLocal.set(
        this.toEventLocalDateTime(currentEvent.endDate, currentEvent.timeZone)
      );
      this.eventWindowLabel.set(
        `${this.formatEventDate(currentEvent.startDate, currentEvent.timeZone)} â€” ${this.formatEventDate(currentEvent.endDate, currentEvent.timeZone)}`
      );
    }

    this.reload();
  }

  reload(): void {
    this.loadError.set(null);
    this.sessionAction.run();
    this.venuesAction.run();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImage.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : this.currentImageUrl());
  }

  updateSession(): void {
    this.error.set(null);

    if (!this.session.title.trim()) {
      this.error.set('Session title is required.');
      return;
    }

    if (!this.session.sessionType.trim()) {
      this.error.set('Session type is required.');
      return;
    }

    if (this.session.capacity != null && this.session.capacity < 1) {
      this.error.set('Capacity must be greater than 0.');
      return;
    }

    if (
      this.session.startTime &&
      this.session.endTime &&
      this.session.startTime >= this.session.endTime
    ) {
      this.error.set('Session end time must be after the start time.');
      return;
    }

    const start = this.session.startTime || '';
    const end = this.session.endTime || '';
    if (start && this.eventStartLocal() && start < this.eventStartLocal()) {
      this.error.set(`Session cannot start before the event starts (${this.eventWindowLabel()}).`);
      return;
    }
    if (end && this.eventEndLocal() && end > this.eventEndLocal()) {
      this.error.set(`Session cannot end after the event ends (${this.eventWindowLabel()}).`);
      return;
    }

    const request: UpdateSessionModel = {
      title: this.session.title.trim(),
      description: this.session.description?.trim() || undefined,
      sessionType: this.session.sessionType.trim(),
      capacity: this.session.capacity,
      startTime: this.session.startTime || null,
      endTime: this.session.endTime || null,
      venueId: this.session.venueId || null,
      allowRegistration: this.session.allowRegistration ?? false,
      image: this.selectedImage() ?? undefined
    };

    this.updateAction.run(request);
  }

  private toEventLocalDateTime(value: string, timeZone: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
  }

  private formatEventDate(value: string, timeZone: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone
    }).format(date);
  }

  private toLocalDateTime(value: string): string {
    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventId, 'sessions', this.sessionId]);
  }
}
