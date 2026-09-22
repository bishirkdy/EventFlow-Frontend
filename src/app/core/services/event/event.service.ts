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
    const formData = new FormData();
    formData.append('Name', request.name);
    formData.append('Description', request.description ?? '');
    formData.append('EventTypeId', request.eventTypeId);
    formData.append('SubType', request.subType ?? '');
    formData.append('StartDate', request.startDate);
    formData.append('EndDate', request.endDate);
    formData.append('TimeZone', request.timeZone);

    request.images.forEach((image) => {
      formData.append('Images', image, image.name);
    });

    return this.http.post<ApiResponse<CreateEventResponse>>(
      this.api.getUrl(EVENT_ENDPOINTS.create),
      formData,
    );
  }

  getMyEvents(): Observable<ApiResponse<Event[]>> {
    return this.http.get<ApiResponse<Event[]>>(this.api.getUrl(EVENT_ENDPOINTS.myEvents));
  }

  getEventById(eventId: string): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(this.api.getUrl(EVENT_ENDPOINTS.byId(eventId)));
  }
}
