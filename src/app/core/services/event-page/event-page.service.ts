import { inject, Injectable } from '@angular/core';
import { Api } from '../api';
import { HttpClient } from '@angular/common/http';
import { CreateEventPageRequest, EventPageModel } from '../../models/event-page/event-page.model';
import { ApiResponse } from '../../models/api-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventPageService {
  private http = inject(HttpClient);
  private api = inject(Api);

  getPages(eventId: string): Observable<ApiResponse<EventPageModel[]>> {
    return this.http.get<ApiResponse<EventPageModel[]>>(
      this.api.getUrl('api/v1/events/${eventId}/pages'),
      { withCredentials: true }
    );
  }

  createPage(eventId: string, request: CreateEventPageRequest): Observable<ApiResponse<EventPageModel>> {
    return this.http.post<ApiResponse<EventPageModel>>(
      this.api.getUrl('api/v1/events/${eventId}/pages'),
      request,
      { withCredentials: true }
    );
  }

  publishPage(eventId: string, pageId: string): Observable<ApiResponse<EventPageModel>> {
    return this.http.put<ApiResponse<EventPageModel>>(
      `${this.api.getUrl}`,
      {},
      { withCredentials: true }
    );
  }

  unpublishPage(eventId: string, pageId: string): Observable<ApiResponse<EventPageModel>> {
    return this.http.put<ApiResponse<EventPageModel>>(
      this.api.getUrl(`api/v1/event-page/${eventId}/pages/${pageId}/unpublish`),
      {},
      { withCredentials: true }
    );
  }

  deletePage(eventId: string, pageId: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      this.api.getUrl(`api/v1/event-page/${eventId}/pages/${pageId}`),
      { withCredentials: true }
    );
  }

}
