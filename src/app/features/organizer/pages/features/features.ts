import { Component, inject, OnInit, signal } from '@angular/core';
import { map } from 'rxjs';
import { NotificationService } from '../../../../core/services/ui/notification.service';

import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';
import { EventFeatureModel } from '../../../../core/models/event-feature';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { createAsyncAction } from 'core/state';
import { AsyncState } from '../../../../shared/components/async-state/async-state';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [AsyncState],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features implements OnInit {
  private readonly eventFeatureService = inject(EventFeatureService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(NotificationService);

  readonly features = signal<EventFeatureModel[]>([]);
  readonly error = signal<string | null>(null);
  readonly updatingFeatureId = signal<string | null>(null);

  private readonly loadAction = createAsyncAction(
    (eventId: string) => this.eventFeatureService.getFeatures(eventId),
    {
      toastErrors: true,
      errorFallback: 'Failed to load event features.',
      onError: () => this.error.set('Failed to load event features.'),
      onSuccess: (response) => this.features.set(response.data ?? []),
    },
  );

  private readonly toggleAction = createAsyncAction(
    (eventId: string, feature: EventFeatureModel, enabling: boolean) => {
      const request$ = enabling
        ? this.eventFeatureService.enableFeature(eventId, feature.featureId)
        : this.eventFeatureService.disableFeature(eventId, feature.featureId);
      return request$.pipe(map(() => ({ feature, enabling })));
    },
    {
      errorFallback: 'Failed to update feature.',
      onSettled: () => this.updatingFeatureId.set(null),
      onSuccess: ({ feature, enabling }) => {
        this.features.update((features) =>
          features.map((item) =>
            item.id === feature.id ? { ...item, isEnabled: enabling } : item,
          ),
        );

        this.toastr.success(
          enabling ? 'Feature enabled successfully.' : 'Feature disabled successfully.',
        );
      },
    },
  );

  private readonly resetAction = createAsyncAction(
    (eventId: string) => this.eventFeatureService.resetFeatures(eventId),
    {
      successMessage: 'Features reset successfully.',
      errorFallback: 'Failed to reset features.',
      onSuccess: (response) => this.features.set(response.data ?? []),
    },
  );

  loading = this.loadAction.pending;
  resetting = this.resetAction.pending;

  ngOnInit(): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    this.loadAction.run(eventId);
  }

  retry(): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.toastr.error('Event ID not found.');
      return;
    }

    this.loadAction.run(eventId);
  }

  toggleFeature(feature: EventFeatureModel): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.toastr.error('Event ID not found.');
      return;
    }

    if (this.updatingFeatureId()) {
      return;
    }

    this.updatingFeatureId.set(feature.id);

    this.toggleAction.run(eventId, feature, !feature.isEnabled);
  }

  resetFeatures(): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.toastr.error('Event ID not found.');
      return;
    }

    if (this.resetting()) {
      return;
    }

    this.resetAction.run(eventId);
  }
}
