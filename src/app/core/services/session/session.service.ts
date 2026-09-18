import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../models/api-response';
import { CreateSessionRequest, SessionModel, UpdateSessionRequest } from '../../models/session/session.model';
import { Api } from '../api';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  private readonly endpoint = '/v1/session';

  getSessions(eventId: string): Observable<ApiResponse<SessionModel[]>> {
    return this.http.get<ApiResponse<SessionModel[]>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sessions`),
      {
        withCredentials: true,
      },
    );
  }

  createSession(
    eventId: string,
    request: CreateSessionRequest,
  ): Observable<ApiResponse<SessionModel>> {
    return this.http.post<ApiResponse<SessionModel>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sessions`),
      request,
      {
        withCredentials: true,
      },
    );
  }

  getSessionById(eventId: string, sessionId: string): Observable<ApiResponse<SessionModel>> {
    return this.http.get<ApiResponse<SessionModel>>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sessions/${sessionId}`),
      {
        withCredentials: true,
      },
    );
  }

  updateSession(
    eventId: string,
    sessionId: string,
    request: UpdateSessionRequest,
  ): Observable<void> {
    return this.http.put<void>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sessions/${sessionId}`),
      request,
      { withCredentials: true },
    );
  }

  deleteSession(eventId: string, sessionId: string): Observable<void> {
    return this.http.delete<void>(
      this.api.getUrl(`${this.endpoint}/${eventId}/sessions/${sessionId}`),
      { withCredentials: true },
    );
  }
}
