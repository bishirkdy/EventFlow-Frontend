import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { forkJoin, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeedbackService } from '../../../core/services/feedback/feedback.service';
import { SessionService } from '../../../core/services/session/session.service';
import { SpeakerService } from '../../../core/services/speaker/speaker.service';
import { VenueService } from '../../../core/services/venue/venue.service';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { FeedbackTargetType } from '../../../core/models/feedback';
import { SessionModel } from '../../../core/models/session';
import { SpeakerModel } from '../../../core/models/speaker';
import { VenueModel } from '../../../core/models/venue';
import { LucideAngularModule, X } from 'lucide-angular';
import { createAsyncAction, createRawAsyncState } from 'core/state';

interface FeedbackTargets {
  sessions: SessionModel[];
  speakers: SpeakerModel[];
  venues: VenueModel[];
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './feedback.html',
})
export class FeedbackComponent implements OnInit {
  private readonly feedbackService = inject(FeedbackService);
  private readonly sessions = inject(SessionService);
  private readonly speakers = inject(SpeakerService);
  private readonly venues = inject(VenueService);
  private readonly notify = inject(NotificationService);

  readonly eventId = input.required<string>();
  readonly closed = output<void>();

  readonly targetType = signal<FeedbackTargetType>(FeedbackTargetType.Event);
  readonly targetId = signal<string | null>(null);
  readonly rating = signal(0);
  readonly comment = signal('');
  readonly submitted = signal(false);

  private readonly targetsState = createRawAsyncState<FeedbackTargets>(
    () => {
      const eventId = this.eventId();
      if (!eventId) {
        return of({ sessions: [], speakers: [], venues: [] });
      }
      return forkJoin({
        sessions: this.sessions.getSessions(eventId).pipe(
          map((response) => response.data ?? []),
          catchError(() => of([] as SessionModel[])),
        ),
        speakers: this.speakers.getSpeakers(eventId).pipe(
          map((response) => response.data ?? []),
          catchError(() => of([] as SpeakerModel[])),
        ),
        venues: this.venues.getVenues(eventId).pipe(
          map((response) => response.data ?? []),
          catchError(() => of([] as VenueModel[])),
        ),
      });
    },
    {
      initial: { sessions: [], speakers: [], venues: [] },
      errorFallback: 'Unable to load feedback options.',
    },
  );

  private readonly submitAction = createAsyncAction(
    (request: Parameters<FeedbackService['submit']>[1]) =>
      this.feedbackService.submit(this.eventId(), request),
    {
      onSuccess: (response) => {
        if (response.isSuccess) {
          this.submitted.set(true);
          this.notify.success('Thank you for your feedback!');
        } else {
          this.notify.error(response.message || 'Unable to submit feedback.');
        }
      },
      errorFallback: 'Unable to submit feedback.',
    },
  );

  readonly submitting = this.submitAction.pending;
  readonly loading = this.targetsState.loading;

  readonly sessionList = computed(() => this.targetsState.data().sessions);
  readonly speakerList = computed(() => this.targetsState.data().speakers);
  readonly venueList = computed(() => this.targetsState.data().venues);

  readonly X = X;

  closeFeedbackPopup(): void {
    this.closed.emit();
  }

  readonly targetTypeOptions = computed(() => {
    const options: Array<{ value: FeedbackTargetType; label: string }> = [
      { value: FeedbackTargetType.Event, label: 'The event' },
    ];
    if (this.sessionList().length > 0) {
      options.push({ value: FeedbackTargetType.Session, label: 'A session' });
    }
    if (this.speakerList().length > 0) {
      options.push({ value: FeedbackTargetType.Speaker, label: 'A speaker' });
    }
    if (this.venueList().length > 0) {
      options.push({ value: FeedbackTargetType.Venue, label: 'A venue' });
    }
    return options;
  });

  readonly currentTargets = computed(() => {
    switch (this.targetType()) {
      case FeedbackTargetType.Session:
        return this.sessionList().map((x) => ({ id: x.id, name: x.title }));
      case FeedbackTargetType.Speaker:
        return this.speakerList().map((x) => ({ id: x.id, name: x.name }));
      case FeedbackTargetType.Venue:
        return this.venueList().map((x) => ({ id: x.id, name: x.name }));
      default:
        return [];
    }
  });

  readonly needsTarget = computed(() => this.targetType() !== FeedbackTargetType.Event);
  readonly canSubmit = computed(
    () => !this.submitting() && this.rating() >= 1 && (!this.needsTarget() || !!this.targetId()),
  );

  ngOnInit(): void {
    this.targetsState.load();
  }
  selectTargetType(value: number): void {
    this.targetType.set(value as FeedbackTargetType);
    this.targetId.set(null);
  }

  setRating(value: number): void {
    this.rating.set(value);
  }

  setComment(value: string): void {
    this.comment.set(value);
  }

  setTarget(value: string): void {
    this.targetId.set(value || null);
  }

  submit(): void {
    if (!this.canSubmit()) {
      if (this.rating() < 1) {
        this.notify.error('Please choose a rating before submitting.');
      } else if (this.needsTarget() && !this.targetId()) {
        this.notify.error('Please choose what you want to give feedback on.');
      }
      return;
    }

    this.submitAction.run({
      targetType: this.targetType(),
      targetId: this.needsTarget() ? this.targetId() : this.eventId(),
      rating: this.rating(),
      comment: this.comment().trim() || null,
    });
  }

  reset(): void {
    this.submitted.set(false);
    this.targetType.set(FeedbackTargetType.Event);
    this.targetId.set(null);
    this.rating.set(0);
    this.comment.set('');
  }
}
