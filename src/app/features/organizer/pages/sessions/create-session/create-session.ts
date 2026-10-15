import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CreateSessionModel } from '../../../../../core/models/session';
import { SectionModel } from '../../../../../core/models/section';
import { SectionService } from '../../../../../core/services/section/section.service';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../../core/models/venue';
import { SessionService } from '../../../../../core/services/session/session.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { Event as EventModel } from '../../../../../core/models/event';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-session.html',
  styleUrl: './create-session.css',
})
export class CreateSession implements OnInit {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly sectionService = inject(SectionService);
  private readonly venueService = inject(VenueService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  eventId = '';

  sections = signal<SectionModel[]>([]);
  venues = signal<VenueModel[]>([]);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  error = signal<string | null>(null);
  event = signal<EventModel | null>(null);
  eventStartLocal = signal('');
  eventEndLocal = signal('');
  eventWindowLabel = signal('');

  private readonly venuesAction = createAsyncAction(
    () => this.venueService.getVenues(this.eventId),
    {
      toastErrors: true,
      errorFallback: 'Failed to load venues.',
      onSuccess: (response) => this.venues.set(response.data ?? []),
    },
  );

  private readonly sectionsAction = createAsyncAction(
    () => this.sectionService.getSections(this.eventId),
    {
      errorFallback: 'Failed to load sections.',
      onError: () => this.error.set('Failed to load sections.'),
      onSuccess: (response) => this.sections.set(response.data ?? []),
    },
  );

  private readonly createAction = createAsyncAction(
    (request: CreateSessionModel) => this.sessionService.createSession(this.eventId, request),
    {
      successMessage: 'Session created successfully.',
      errorFallback: 'Failed to create session.',
      onSuccess: () =>
        this.router.navigate(['/organizer', this.eventId, 'sessions']),
    },
  );

  loadingVenues = this.venuesAction.pending;
  loadingSections = this.sectionsAction.pending;
  saving = this.createAction.pending;

  session: CreateSessionModel = {
    sectionId: '',
    title: '',
    description: '',
    sessionType: '',
    capacity: null,
    startTime: null,
    endTime: null,
    venueId: null,
  };

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    this.eventId = eventId;
    const currentEvent = this.organizerEventState.event();
    if (currentEvent) {
      this.event.set(currentEvent);
      this.eventStartLocal.set(this.toEventLocalDateTime(currentEvent.startDate, currentEvent.timeZone));
      this.eventEndLocal.set(this.toEventLocalDateTime(currentEvent.endDate, currentEvent.timeZone));
      this.eventWindowLabel.set(`${this.formatEventDate(currentEvent.startDate, currentEvent.timeZone)} — ${this.formatEventDate(currentEvent.endDate, currentEvent.timeZone)}`);
    }
    this.sectionsAction.run();
    this.venuesAction.run();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImage.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : null);
  }

  createSession(): void {
    this.error.set(null);

    if (!this.session.sectionId) {
      this.error.set('Section is required.');
      return;
    }

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

    if (this.session.startTime && this.session.endTime && this.session.startTime >= this.session.endTime) {
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

    const request: CreateSessionModel = {
      sectionId: this.session.sectionId,
      title: this.session.title.trim(),
      description: this.session.description?.trim() || undefined,
      sessionType: this.session.sessionType.trim(),
      capacity: this.session.capacity,
      startTime: this.session.startTime || null,
      endTime: this.session.endTime || null,
      venueId: this.session.venueId || null,
      image: this.selectedImage() ?? undefined,
    };

    this.createAction.run(request);
  }

  private toEventLocalDateTime(value: string, timeZone: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
  }

  private formatEventDate(value: string, timeZone: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium', timeStyle: 'short', timeZone,
    }).format(date);
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventId, 'sessions']);
  }
}
