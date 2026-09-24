import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { SESSION_ENDPOINTS } from '../../api/endpoints/session.endpoint';
import { ApiResponse } from '../../models/common/api-response';

import { SessionModel } from '../../models/session/session.model';
import { CreateSessionModel } from '../../models/session/create-session.model';
import { UpdateSessionModel } from '../../models/session/update-session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getSessions(eventId: string): Observable<ApiResponse<SessionModel[]>> {
    return this.http.get<ApiResponse<SessionModel[]>>(
      this.api.getUrl(SESSION_ENDPOINTS.getSessions(eventId)),
    );
  }

  getSessionById(eventId: string, sessionId: string): Observable<ApiResponse<SessionModel>> {
    return this.http.get<ApiResponse<SessionModel>>(
      this.api.getUrl(SESSION_ENDPOINTS.getSessionById(eventId, sessionId)),
    );
  }

  createSession(eventId: string, request: CreateSessionModel): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      this.api.getUrl(SESSION_ENDPOINTS.createSession(eventId)),
      this.toFormData(request),
    );
  }

  updateSession(
    eventId: string,
    sessionId: string,
    request: UpdateSessionModel,
  ): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(SESSION_ENDPOINTS.updateSession(eventId, sessionId)),
      this.toFormData(request),
    );
  }

  private toFormData(request: CreateSessionModel | UpdateSessionModel): FormData {
    const formData = new FormData();
    if ('sectionId' in request) formData.append('SectionId', request.sectionId);
    formData.append('Title', request.title);
    formData.append('Description', request.description ?? '');
    formData.append('SessionType', request.sessionType);
    if (request.capacity !== null && request.capacity !== undefined) formData.append('Capacity', String(request.capacity));
    if (request.startTime) formData.append('StartTime', request.startTime);
    if (request.endTime) formData.append('EndTime', request.endTime);
    if (request.venueId) formData.append('VenueId', request.venueId);
    if (request.image) formData.append('Image', request.image, request.image.name);
    return formData;
  }

  deleteSession(eventId: string, sessionId: string): Observable<ApiResponse<object | null>> {
    return this.http.delete<ApiResponse<object | null>>(
      this.api.getUrl(SESSION_ENDPOINTS.deleteSession(eventId, sessionId)),
    );
  }
}
