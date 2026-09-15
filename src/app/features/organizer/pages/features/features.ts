import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventFeatureService } from '../../../../core/services/event-feature/event-feature.service';
import { EventFeatureModel } from '../../../../core/models/event-feature/event-feature.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-features',
  imports: [],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {
  private route = inject(ActivatedRoute);
  private eventFeatureService = inject(EventFeatureService);
  private toaster = inject(ToastrService);

  features = signal<EventFeatureModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventFeatureService.getFeatures(eventId).subscribe({
      next: response => {
        this.features.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load event features', error);
        this.error.set('Failed to load event features.');
        this.loading.set(false);
      },
    });
  }

  toggleFeature(feature: EventFeatureModel): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.toaster.error('Event ID not found.');
      return;
    }

    const request$ = feature.isEnabled
      ? this.eventFeatureService.disableFeature(
        eventId,
        feature.featureId
      )
      : this.eventFeatureService.enableFeature(
        eventId,
        feature.featureId
      );

    request$.subscribe({
      next: response => {
        this.features.update(features =>
          features.map(item =>
            item.id === feature.id ? response.data : item
          )
        );

        this.toaster.success(
          feature.isEnabled
            ? 'Feature disabled successfully.'
            : 'Feature enabled successfully.'
        );
      },

      error: error => {
        console.error('Failed to update feature', error);
        this.toaster.error('Failed to update feature.');
      },
    });
  }

  resetFeatures(): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.toaster.error('Event ID not found.');
      return;
    }

    this.eventFeatureService.resetFeatures(eventId).subscribe({
      next: response => {
        this.features.set(response.data);
        this.toaster.success('Features reset successfully.');
      },
      error: error => {
        console.error('Failed to reset features', error);
        this.toaster.error('Failed to reset features.');
      },
    });
  }
}
