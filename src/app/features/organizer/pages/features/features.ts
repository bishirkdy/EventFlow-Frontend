import { Component, inject, OnInit, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';
import { EventFeatureModel } from '../../../../core/models/event-feature/event-feature.model';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-features',
  standalone: true,
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features implements OnInit {
  private readonly eventFeatureService = inject(EventFeatureService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  readonly features = signal<EventFeatureModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly updatingFeatureId = signal<string | null>(null);
  readonly resetting = signal(false);

  ngOnInit(): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.loadFeatures(eventId);
  }

  private loadFeatures(eventId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventFeatureService.getFeatures(eventId).subscribe({
      next: (response) => {
        this.features.set(response.data ?? []);
        this.loading.set(false);
      },

      error: (error) => {
        console.error('Failed to load event features:', error);

        this.error.set('Failed to load event features.');
        this.loading.set(false);

        this.toastr.error(error?.error?.message || 'Failed to load event features.');
      },
    });
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

    const request$ = feature.isEnabled
      ? this.eventFeatureService.disableFeature(eventId, feature.featureId)
      : this.eventFeatureService.enableFeature(eventId, feature.featureId);

    request$.subscribe({
      next: () => {
        this.features.update((features) =>
          features.map((item) =>
            item.id === feature.id ? { ...item, isEnabled: !item.isEnabled } : item,
          ),
        );

        this.updatingFeatureId.set(null);

        this.toastr.success(
          feature.isEnabled ? 'Feature disabled successfully.' : 'Feature enabled successfully.',
        );
      },

      error: (error) => {
        console.error('Failed to update feature:', error);
        this.updatingFeatureId.set(null);
        this.toastr.error(error?.error?.message || 'Failed to update feature.');
      },
    });
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

    this.resetting.set(true);

    this.eventFeatureService.resetFeatures(eventId).subscribe({
      next: (response) => {
        this.features.set(response.data ?? []);
        this.resetting.set(false);

        this.toastr.success('Features reset successfully.');
      },

      error: (error) => {
        console.error('Failed to reset features:', error);
        this.resetting.set(false);
        this.toastr.error(error?.error?.message || 'Failed to reset features.');
      },
    });
  }
}
