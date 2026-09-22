import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/common/api-response';
import { EventTypeModel } from '../../models/event-type/event-type.model';
import { EVENT_TYPE_ENDPOINTS } from '../../api/endpoints/event-type-endpoints';
import { Api } from '../../api/api';

@Injectable({
  providedIn: 'root',
})
export class EventTypeService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getEventTypes() {
    return this.http.get<ApiResponse<EventTypeModel[]>>(
      this.api.getUrl(EVENT_TYPE_ENDPOINTS.getEventTypes),
    );
  }
}
