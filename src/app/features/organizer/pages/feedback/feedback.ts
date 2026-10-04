import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FeedbackService } from '../../../../core/services/feedback/feedback.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { FeedbackResults, FeedbackTargetType } from '../../../../core/models/feedback/feedback.model';

@Component({
  selector: 'app-organizer-feedback',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './feedback.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerFeedbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly feedbackService = inject(FeedbackService);
  private readonly notify = inject(NotificationService);

  readonly eventId = this.route.snapshot.paramMap.get('eventId') ?? '';
  readonly results = signal<FeedbackResults | null>(null);
  readonly loading = signal(true);

  readonly targetLabels: Record<number, string> = {
    [FeedbackTargetType.Event]: 'Event',
    [FeedbackTargetType.Session]: 'Session',
    [FeedbackTargetType.Speaker]: 'Speaker',
    [FeedbackTargetType.Venue]: 'Venue',
  };

  ngOnInit(): void {
    if (!this.eventId) {
      this.loading.set(false);
      return;
    }

    this.feedbackService.results(this.eventId).subscribe({
      next: response => {
        this.results.set(response.data ?? null);
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.notify.error(error, 'Unable to load feedback results.');
      },
    });
  }

  distributionPercent(count: number): number {
    const total = this.results()?.totalCount ?? 0;
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }
}
