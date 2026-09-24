import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { CreateSessionModel } from '../../../../../core/models/session/create-session.model';
import { SectionModel } from '../../../../../core/models/section/section.model';
import { SectionService } from '../../../../../core/services/section/section.service';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../../core/models/venue/venue.model';
import { SessionService } from '../../../../../core/services/session/session.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { Event as EventModel } from '../../../../../core/models/event/event.model';

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
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  eventId = '';

  sections = signal<SectionModel[]>([]);
  venues = signal<VenueModel[]>([]);
  loadingVenues = signal(true);
  loadingSections = signal(true);
  saving = signal(false);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  error = signal<string | null>(null);
  event = signal<EventModel | null>(null);
  eventStartLocal = signal('');
  eventEndLocal = signal('');
  eventWindowLabel = signal('');

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
      this.loadingSections.set(false);
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
    this.loadSections();
    this.loadVenues();
  }

  private loadVenues(): void {
    this.loadingVenues.set(true);
    this.venueService.getVenues(this.eventId).subscribe({
      next: (response) => { this.venues.set(response.data ?? []); this.loadingVenues.set(false); },
      error: () => { this.loadingVenues.set(false); this.toastr.error('Failed to load venues.'); },
    });
  }

  private loadSections(): void {
    this.loadingSections.set(true);

    this.sectionService.getSections(this.eventId).subscribe({
      next: (response) => {
        this.sections.set(response.data ?? []);
        this.loadingSections.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load sections:', error);

        this.error.set('Failed to load sections.');

        this.loadingSections.set(false);
      },
    });
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

    this.saving.set(true);

    this.sessionService.createSession(this.eventId, request).subscribe({
      next: () => {
        this.saving.set(false);

        this.toastr.success('Session created successfully.');

        this.router.navigate(['/organizer', this.eventId, 'sessions']);
      },

      error: (error: unknown) => {
        console.error('Failed to create session:', error);

        this.saving.set(false);
        this.error.set((error as any)?.error?.message || 'Failed to create session.');
      },
    });
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
