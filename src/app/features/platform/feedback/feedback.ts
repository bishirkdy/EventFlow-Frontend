import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeedbackService } from '../../../core/services/feedback/feedback.service';
import { SessionService } from '../../../core/services/session/session.service';
import { SpeakerService } from '../../../core/services/speaker/speaker.service';
import { VenueService } from '../../../core/services/venue/venue.service';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { FeedbackTargetType } from '../../../core/models/feedback/feedback.model';
import { SessionModel } from '../../../core/models/session/session.model';
import { SpeakerModel } from '../../../core/models/speaker/speaker.model';
import { VenueModel } from '../../../core/models/venue/venue.model';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feedback.html',
})
export class FeedbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly feedbackService = inject(FeedbackService);
  private readonly sessions = inject(SessionService);
  private readonly speakers = inject(SpeakerService);
  private readonly venues = inject(VenueService);
  private readonly notify = inject(NotificationService);

  readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';

  readonly targetType = signal<FeedbackTargetType>(FeedbackTargetType.Event);
  readonly targetId = signal<string | null>(null);
  readonly rating = signal(0);
  readonly comment = signal('');
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly loading = signal(true);

  readonly sessionList = signal<SessionModel[]>([]);
  readonly speakerList = signal<SpeakerModel[]>([]);
  readonly venueList = signal<VenueModel[]>([]);

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
        return this.sessionList().map(x => ({ id: x.id, name: x.title }));
      case FeedbackTargetType.Speaker:
        return this.speakerList().map(x => ({ id: x.id, name: x.name }));
      case FeedbackTargetType.Venue:
        return this.venueList().map(x => ({ id: x.id, name: x.name }));
      default:
        return [];
    }
  });

  readonly needsTarget = computed(() => this.targetType() !== FeedbackTargetType.Event);
  readonly canSubmit = computed(
    () =>
      !this.submitting() &&
      this.rating() >= 1 &&
      (!this.needsTarget() || !!this.targetId()),
  );

  ngOnInit(): void {
    if (!this.eventId) {
      this.loading.set(false);
      return;
    }

    forkJoin({
      sessions: this.sessions.getSessions(this.eventId).pipe(catchError(() => of(null))),
      speakers: this.speakers.getSpeakers(this.eventId).pipe(catchError(() => of(null))),
      venues: this.venues.getVenues(this.eventId).pipe(catchError(() => of(null))),
    }).subscribe(({ sessions, speakers, venues }) => {
      this.sessionList.set(sessions?.data ?? []);
      this.speakerList.set(speakers?.data ?? []);
      this.venueList.set(venues?.data ?? []);
      this.loading.set(false);
    });
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

    this.submitting.set(true);
    this.feedbackService
      .submit(this.eventId, {
        targetType: this.targetType(),
        targetId: this.needsTarget() ? this.targetId() : this.eventId,
        rating: this.rating(),
        comment: this.comment().trim() || null,
      })
      .subscribe({
        next: response => {
          this.submitting.set(false);
          if (response.isSuccess) {
            this.submitted.set(true);
            this.notify.success('Thank you for your feedback!');
          } else {
            this.notify.error(response.message || 'Unable to submit feedback.');
          }
        },
        error: error => {
          this.submitting.set(false);
          const message =
            error?.error?.message ||
            (typeof error?.error === 'string' ? error.error : null) ||
            'Unable to submit feedback.';
          this.notify.error(message);
        },
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
