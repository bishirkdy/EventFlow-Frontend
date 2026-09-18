import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { EVENT_SETTINGS_ENDPOINTS } from '../../api/endpoints/event-settings.endpoint';
import { ApiResponse } from '../../models/common/api-response';
import { EventSettings } from '../../models/event-settings/event-settings.model';

@Injectable({
  providedIn: 'root',
})

export class EventSettingsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getSettings(eventId: string): Observable<ApiResponse<EventSettings>> {
    return this.http.get<ApiResponse<EventSettings>>(
      this.api.getUrl(
        EVENT_SETTINGS_ENDPOINTS.getSettings(eventId)
      )
    );
  }
}