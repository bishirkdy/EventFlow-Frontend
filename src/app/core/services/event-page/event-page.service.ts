import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../api/api';
import { EVENT_PAGE_ENDPOINTS } from '../../api/endpoints/event-page.endpoint';
import { ApiResponse } from '../../models/common/api-response';
import { EventPageModel } from '../../models/event-page/event-page.model';
import { CreateEventPageModel } from '../../models/event-page/create-event-page.model';
import { UpdateEventPageModel } from '../../models/event-page/update-event-page.model';

@Injectable({
  providedIn: 'root',
})
export class EventPageService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getPages(eventId: string): Observable<ApiResponse<EventPageModel[]>> {
    return this.http.get<ApiResponse<EventPageModel[]>>(
      this.api.getUrl(EVENT_PAGE_ENDPOINTS.getPages(eventId)),
    );
  }

  createPage(eventId: string, request: CreateEventPageModel): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      this.api.getUrl(EVENT_PAGE_ENDPOINTS.createPage(eventId)),
      request,
    );
  }

  updatePage(
    eventId: string,
    pageId: string,
    request: UpdateEventPageModel,
  ): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(EVENT_PAGE_ENDPOINTS.updatePage(eventId, pageId)),
      request,
    );
  }

  publishPage(eventId: string, pageId: string): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(EVENT_PAGE_ENDPOINTS.publishPage(eventId, pageId)),
      null,
    );
  }

  unpublishPage(eventId: string, pageId: string): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(EVENT_PAGE_ENDPOINTS.unpublishPage(eventId, pageId)),
      null,
    );
  }

  deletePage(eventId: string, pageId: string): Observable<ApiResponse<object | null>> {
    return this.http.delete<ApiResponse<object | null>>(
      this.api.getUrl(EVENT_PAGE_ENDPOINTS.deletePage(eventId, pageId)),
    );
  }

  getPageById(eventId: string, pageId: string): Observable<ApiResponse<EventPageModel>> {
    return this.http.get<ApiResponse<EventPageModel>>(
      this.api.getUrl(EVENT_PAGE_ENDPOINTS.getPageById(eventId, pageId)),
    );
  }
}
