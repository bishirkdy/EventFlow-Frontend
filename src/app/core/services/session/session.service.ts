import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/common/api-response';
import { Api } from '../../api/api';
import { SessionModel } from '../../models/session/session.model';
import { CreateSessionRequest } from '../../models/session/create-session.model';
import { UpdateSessionRequest } from '../../models/session/update-session.model';
import { SESSION_ENDPOINTS } from '../../api/endpoints/session.endpoint';

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

  createSession(
    eventId: string,
    request: CreateSessionRequest,
  ): Observable<ApiResponse<SessionModel>> {
    return this.http.post<ApiResponse<SessionModel>>(
      this.api.getUrl(SESSION_ENDPOINTS.createSession(eventId)),
      request,
    );
  }

  getSessionById(eventId: string, sessionId: string): Observable<ApiResponse<SessionModel>> {
    return this.http.get<ApiResponse<SessionModel>>(
      this.api.getUrl(SESSION_ENDPOINTS.getSessionById(eventId, sessionId)),
    );
  }

  updateSession(
    eventId: string,
    sessionId: string,
    request: UpdateSessionRequest,
  ): Observable<void> {
    return this.http.put<void>(
      this.api.getUrl(SESSION_ENDPOINTS.updateSession(eventId, sessionId)),
      request,
    );
  }

  deleteSession(eventId: string, sessionId: string): Observable<void> {
    return this.http.delete<void>(
      this.api.getUrl(SESSION_ENDPOINTS.deleteSession(eventId, sessionId)),
    );
  }
}
