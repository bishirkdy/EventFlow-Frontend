import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { EVENT_SETTINGS_ENDPOINTS } from '../../api/endpoints/event-settings.endpoint';
import { ApiResponse } from '../../models/common/api-response';
import { EventSettings } from '../../models/event-settings/event-settings.model';
import { UpdateEventSettings } from '../../models/event-settings/event-settings-update.model';

@Injectable({
  providedIn: 'root',
})
export class EventSettingsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getSettings(eventId: string): Observable<ApiResponse<EventSettings>> {
    return this.http.get<ApiResponse<EventSettings>>(
      this.api.getUrl(EVENT_SETTINGS_ENDPOINTS.getSettings(eventId)),
    );
  }

  updateSettings(eventId: string, settings: UpdateEventSettings): Observable<void> {
    return this.http.put<void>(
      this.api.getUrl(EVENT_SETTINGS_ENDPOINTS.updateSettings(eventId)),
      settings,
    );
  }
  resetSettings(eventId: string): Observable<void> {
    return this.http.post<void>(
      this.api.getUrl(EVENT_SETTINGS_ENDPOINTS.resetSettings(eventId)),
      {},
    );
  }
}
