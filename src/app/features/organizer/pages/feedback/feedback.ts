import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { FeedbackService } from '../../../../core/services/feedback/feedback.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { FeedbackResults, FeedbackTargetType } from '../../../../core/models/feedback';
import { createAsyncAction } from 'core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-organizer-feedback',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, AsyncState],
  templateUrl: './feedback.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerFeedbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly feedbackService = inject(FeedbackService);
  private readonly notify = inject(NotificationService);

  readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';
  readonly results = signal<FeedbackResults | null>(null);

  private readonly loadAction = createAsyncAction(
    () => {
      if (!this.eventId) return of(null);
      return this.feedbackService.results(this.eventId);
    },
    {
      errorFallback: 'Unable to load feedback results.',
      onSuccess: (response) => {
        if (response) {
          this.results.set(response.data ?? null);
        }
      },
    },
  );

  readonly loading = this.loadAction.pending;
  readonly error = this.loadAction.error;

  readonly targetLabels: Record<number, string> = {
    [FeedbackTargetType.Event]: 'Event',
    [FeedbackTargetType.Session]: 'Session',
    [FeedbackTargetType.Speaker]: 'Speaker',
    [FeedbackTargetType.Venue]: 'Venue',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loadAction.run();
  }

  distributionPercent(count: number): number {
    const total = this.results()?.totalCount ?? 0;
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }
}
