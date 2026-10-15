import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventSettingsService } from '../../../../core/services/event-settings/event-settings';
import { EventSettings as EventSettingsModel } from '../../../../core/models/event-settings';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { createAsyncAction, createAsyncState } from 'core/state';

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

  private readonly messageError = signal<string | null>(null);

  private readonly settingsState = createAsyncState<EventSettingsModel>(
    () => this.eventSettingsService.getSettings(this.organizerEventState.eventId() ?? ''),
    { autoLoad: false, errorFallback: 'Failed to load event settings.' },
  );

  settings = this.settingsState.data;
  loading = this.settingsState.loading;

  error = computed(() => this.settingsState.error() ?? this.messageError());
  success = signal<string | null>(null);

  private readonly saveAction = createAsyncAction(
    (request: Parameters<EventSettingsService['updateSettings']>[1]) =>
      this.eventSettingsService.updateSettings(this.organizerEventState.eventId() ?? '', request),
    {
      onSuccess: () => {
        this.success.set('Event settings updated successfully.');
        this.settingsState.load();
      },
      errorFallback: 'Failed to update event settings.',
    },
  );

  saving = this.saveAction.pending;

  private readonly resetAction = createAsyncAction(
    () => this.eventSettingsService.resetSettings(this.organizerEventState.eventId() ?? ''),
    {
      onSuccess: () => {
        this.success.set('Event settings reset successfully.');
        this.settingsState.load();
      },
      errorFallback: 'Failed to reset event settings.',
    },
  );

  resetting = this.resetAction.pending;

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.messageError.set('Event ID not found.');
      return;
    }

    this.settingsState.load();
  }

  updateSettings(): void {
    const eventId = this.organizerEventState.eventId();
    const currentSettings = this.settings();

    if (!eventId || !currentSettings) {
      return;
    }

    this.messageError.set(null);
    this.success.set(null);

    const request = {
      registrationEnabled: currentSettings.registrationEnabled,
      attendanceEnabled: currentSettings.attendanceEnabled,
      feedbackEnabled: currentSettings.feedbackEnabled,
      certificateEnabled: currentSettings.certificateEnabled,
      galleryEnabled: currentSettings.galleryEnabled,
      defaultLanguage: currentSettings.defaultLanguage,
    };

    this.saveAction.run(request);
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

    this.messageError.set(null);
    this.success.set(null);

    this.resetAction.run();
  }
}
