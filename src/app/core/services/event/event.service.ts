import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../api/api';
import { ApiResponse } from '../../models/common/api-response';
import { Event } from '../../models/event/event.model';
import { EVENT_ENDPOINTS } from '../../api/endpoints/event-endpoints';
import { CreateEventRequest } from '../../models/event/create-event/CreateEventRequest';
import { CreateEventResponse } from '../../models/event/create-event/CreateEventResponse';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  createEvent(request: CreateEventRequest): Observable<ApiResponse<CreateEventResponse>> {
    return this.http.post<ApiResponse<CreateEventResponse>>(
      this.api.getUrl(EVENT_ENDPOINTS.create),
      request,
    );
  }

  getMyEvents(): Observable<ApiResponse<Event[]>> {
    return this.http.get<ApiResponse<Event[]>>(this.api.getUrl(EVENT_ENDPOINTS.myEvents));
  }

  getEventById(eventId: string): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(this.api.getUrl(EVENT_ENDPOINTS.byId(eventId)));
  }
}
