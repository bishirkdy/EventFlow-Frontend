import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '../api';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { EventSettings } from '../../models/event/event-settings.model';

@Injectable({
  providedIn: 'root',
})
export class EventSettingsService {
  private http = inject(HttpClient);
  private api = inject(Api);

  private readonly endpoint = '/v1/events-settings';

  getSettings(eventId: string): Observable<ApiResponse<EventSettings>> {
    return this.http.get<ApiResponse<EventSettings>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/settings`),
      {
        withCredentials: true,
      },
    );
  }
}
