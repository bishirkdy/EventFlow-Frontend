import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventSettingsService } from '../../../../core/services/event-settings/event-settings';
import {
  EventSettings as EventSettingsModel
} from '../../../../core/models/event-settings/event-settings.model';

@Component({
  selector: 'app-event-settings',
  imports: [],
  templateUrl: './event-settings.html',
  styleUrl: './event-settings.css',
})
export class EventSettings {
  private route = inject(ActivatedRoute);
  private eventSettingsService = inject(EventSettingsService);

  settings = signal<EventSettingsModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId = this.route.parent?.parent?.snapshot.paramMap.get('eventId');
    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventSettingsService.getSettings(eventId).subscribe({
      next: response => {
        this.settings.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load event settings', error);
        this.error.set('Failed to load event settings.');
        this.loading.set(false);
      },
    });
  }
}
