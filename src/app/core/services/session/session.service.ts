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
      request,
    );
  }

  updateSession(
    eventId: string,
    sessionId: string,
    request: UpdateSessionModel,
  ): Observable<ApiResponse<object | null>> {
    return this.http.put<ApiResponse<object | null>>(
      this.api.getUrl(SESSION_ENDPOINTS.updateSession(eventId, sessionId)),
      request,
    );
  }

  deleteSession(eventId: string, sessionId: string): Observable<ApiResponse<object | null>> {
    return this.http.delete<ApiResponse<object | null>>(
      this.api.getUrl(SESSION_ENDPOINTS.deleteSession(eventId, sessionId)),
    );
  }
}
