import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { SessionModel } from '../../../../../core/models/session';
import { SessionService } from '../../../../../core/services/session/session.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { VenueModel } from '../../../../../core/models/venue';
import { SectionService } from '../../../../../core/services/section/section.service';
import { SectionModel } from '../../../../../core/models/section';
import { SpeakerModel } from '../../../../../core/models/speaker';
import { SpeakerService } from '../../../../../core/services/speaker/speaker.service';
import { SessionSpeakerService } from '../../../../../core/services/session-speaker/session-speaker.service';
import { EventFeatureService } from '../../../../../core/services/event-feature/event-feature.service';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-session-details',
  standalone: true,
  imports: [DatePipe, CapitalizePipe],
  templateUrl: './session-details.html',
  styleUrl: './session-details.css',
})
export class SessionDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly toastr = inject(NotificationService);
  private readonly venueService = inject(VenueService);
  private readonly sectionService = inject(SectionService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);
  private readonly speakerService = inject(SpeakerService);
  private readonly sessionSpeakerService = inject(SessionSpeakerService);
  private readonly eventFeatureService = inject(EventFeatureService);

  session = signal<SessionModel | null>(null);
  error = signal<string | null>(null);
  deleting = signal(false);
  venues = signal<VenueModel[]>([]);
  sections = signal<SectionModel[]>([]);
  speakers = signal<SpeakerModel[]>([]);
  assignedSpeakerIds = signal<Set<string>>(new Set());
  speakerFeatureEnabled = signal(false);
  speakerUpdating = signal<string | null>(null);

  private eventId = '';
  private sessionId = '';

  private readonly sessionAction = createAsyncAction(
    () => this.sessionService.getSessionById(this.eventId, this.sessionId),
    {
      errorFallback: 'Failed to load session.',
      onError: () => this.error.set('Failed to load session.'),
      onSuccess: (response) => {
        if (!response.data) {
          this.toastr.error('Session data was not returned.');
          return;
        }

        this.session.set(response.data);
      },
    },
  );

  private readonly venuesAction = createAsyncAction(
    () => this.venueService.getVenues(this.eventId),
    {
      onSuccess: (response) => this.venues.set(response.data ?? []),
    },
  );

  private readonly sectionsAction = createAsyncAction(
    () => this.sectionService.getSections(this.eventId),
    {
      onSuccess: (response) => this.sections.set(response.data ?? []),
    },
  );

  private readonly assignAction = createAsyncAction(
    (speakerId: string) =>
      this.sessionSpeakerService.assign(this.eventId, this.sessionId, speakerId).pipe(
        map((response) => ({ speakerId, response })),
      ),
    {
      errorFallback: 'Failed to update speaker assignment.',
      onSettled: () => this.speakerUpdating.set(null),
      onSuccess: ({ speakerId, response }) => {
        if (!response.isSuccess) {
          this.toastr.error(response.message || 'Unable to update speaker assignment.');
          return;
        }

        this.assignedSpeakerIds.update((current) => {
          const next = new Set(current);
          next.add(speakerId);
          return next;
        });
      },
    },
  );

  private readonly removeAction = createAsyncAction(
    (speakerId: string) =>
      this.sessionSpeakerService.remove(this.eventId, this.sessionId, speakerId).pipe(
        map((response) => ({ speakerId, response })),
      ),
    {
      errorFallback: 'Failed to update speaker assignment.',
      onSettled: () => this.speakerUpdating.set(null),
      onSuccess: ({ speakerId, response }) => {
        if (!response.isSuccess) {
          this.toastr.error(response.message || 'Unable to update speaker assignment.');
          return;
        }

        this.assignedSpeakerIds.update((current) => {
          const next = new Set(current);
          next.delete(speakerId);
          return next;
        });
      },
    },
  );

  private readonly deleteAction = createAsyncAction(
    () => this.sessionService.deleteSession(this.eventId, this.sessionId),
    {
      successMessage: 'Session deleted successfully.',
      errorFallback: 'Failed to delete session.',
      onSettled: () => this.deleting.set(false),
      onSuccess: () => this.goBack(),
    },
  );

  loading = this.sessionAction.pending;

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const sessionId =
      this.route.snapshot.paramMap.get('sessionId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    if (!sessionId) {
      this.error.set('Session ID not found.');
      return;
    }

    this.eventId = eventId;
    this.sessionId = sessionId;

    this.sessionAction.run();
    this.venuesAction.run();
    this.sectionsAction.run();
    this.loadSpeakerFeature();
  }


  private loadSpeakerFeature(): void {
    this.eventFeatureService.getFeatures(this.eventId).subscribe({
      next: (response) => {
        const enabled = (response.data ?? []).some(feature => feature.isEnabled && feature.featureCode.toLowerCase() === 'speakers');
        this.speakerFeatureEnabled.set(enabled);
        if (enabled) {
          this.speakerService.getSpeakers(this.eventId).subscribe({
            next: (result) => this.speakers.set((result.data ?? []).filter(speaker => speaker.isActive)),
            error: () => undefined,
          });
          this.sessionSpeakerService.get(this.eventId, this.sessionId).subscribe({
            next: (result) => this.assignedSpeakerIds.set(new Set((result.data ?? []).map(speaker => speaker.speakerId))),
            error: () => undefined,
          });
        }
      },
      error: () => this.speakerFeatureEnabled.set(false),
    });
  }

  isSpeakerAssigned(id: string): boolean { return this.assignedSpeakerIds().has(id); }

  toggleSpeaker(speaker: SpeakerModel): void {
    const assigned = this.isSpeakerAssigned(speaker.id);
    this.speakerUpdating.set(speaker.id);
    if (assigned) {
      this.removeAction.run(speaker.id);
    } else {
      this.assignAction.run(speaker.id);
    }
  }

  venueName(venueId: string | null): string {
    if (!venueId) return 'No venue assigned';
    return this.venues().find(venue => venue.id === venueId)?.name ?? 'Venue unavailable';
  }

  sectionName(sectionId: string | null): string {
    if (!sectionId) return 'No section assigned';
    return this.sections().find(section => section.id === sectionId)?.name ?? 'Section unavailable';
  }

  editSession(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sessions',
      this.sessionId,
      'edit',
    ]);
  }

  goBack(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sessions',
    ]);
  }

  deleteSession(): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this session?',
    );

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    this.deleteAction.run();
  }
}
