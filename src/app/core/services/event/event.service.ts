import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '../api';
import { ApiResponse } from '../../models/api-response';
import { Observable } from 'rxjs';
import { Event } from '../../models/event/event.model';


export interface CreateEventRequest {
  name: string;
  eventType: string;
  startDate: string;
  endDate: string;
  description: string;
  timeZone: string;
}

export interface CreateEventResponse {
  id: string;
  name: string;
  eventType: string;
  startDate: string;
  endDate: string;
  description: string;
  timeZone: string;
}



@Injectable({
  providedIn: 'root',
})
export class EventService {
  private http = inject(HttpClient);
  private api = inject(Api);

  events: Event[] = [];

  createEvent(request: CreateEventRequest): Observable<ApiResponse<CreateEventResponse>> {
    return this.http.post<ApiResponse<CreateEventResponse>>(
      this.api.getUrl('/v1/events/create'),
      request,
      {
        withCredentials: true,
      }
    );
  }

  getMyEvents(): Observable<ApiResponse<Event[]>> {
    return this.http.get<ApiResponse<Event[]>>(`${this.api.getUrl('/v1/events/my-events')}`, {
      withCredentials: true,
    });
  }

  getEventById(eventId: string): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(
      `${this.api.getUrl(`/v1/events/${eventId}`)}`,
      {
        withCredentials: true,
      }
    );
  }
}