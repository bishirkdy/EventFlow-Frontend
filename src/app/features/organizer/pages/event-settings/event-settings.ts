import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventSettingsService } from '../../../../core/services/event-settings/event-settings';
import { EventSettings as EventSettingsModel } from '../../../../core/models/event-settings/event-settings.model';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-event-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './event-settings.html',
  styleUrl: './event-settings.css',
})
export class EventSettings implements OnInit {
  private readonly eventSettingsService = inject(EventSettingsService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  settings = signal<EventSettingsModel | null>(null);

  loading = signal(true);
  saving = signal(false);
  resetting = signal(false);

  error = signal<string | null>(null);
  success = signal<string | null>(null);

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.loadSettings(eventId);
  }

  private loadSettings(eventId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventSettingsService.getSettings(eventId).subscribe({
      next: (response) => {
        this.settings.set(response.data);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load event settings:', error);

        this.error.set('Failed to load event settings.');
        this.loading.set(false);
      },
    });
  }

  updateSettings(): void {
    const eventId = this.organizerEventState.eventId();
    const currentSettings = this.settings();

    if (!eventId || !currentSettings) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const request = {
      registrationEnabled: currentSettings.registrationEnabled,
      attendanceEnabled: currentSettings.attendanceEnabled,
      feedbackEnabled: currentSettings.feedbackEnabled,
      certificateEnabled: currentSettings.certificateEnabled,
      galleryEnabled: currentSettings.galleryEnabled,
      defaultLanguage: currentSettings.defaultLanguage,
    };

    this.eventSettingsService.updateSettings(eventId, request).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Event settings updated successfully.');

        this.loadSettings(eventId);
      },

      error: (error: unknown) => {
        console.error('Failed to update event settings:', error);

        this.saving.set(false);
        this.error.set('Failed to update event settings.');
      },
    });
  }

  resetSettings(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to reset all event settings to their default values?',
    );

    if (!confirmed) {
      return;
    }

    this.resetting.set(true);
    this.error.set(null);
    this.success.set(null);

    this.eventSettingsService.resetSettings(eventId).subscribe({
      next: () => {
        this.resetting.set(false);
        this.success.set('Event settings reset successfully.');

        this.loadSettings(eventId);
      },

      error: (error: unknown) => {
        console.error('Failed to reset event settings:', error);

        this.resetting.set(false);
        this.error.set('Failed to reset event settings.');
      },
    });
  }
}
