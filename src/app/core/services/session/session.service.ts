import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '../api';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { CreateSessionRequest, SessionModel } from '../../models/session/session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private http = inject(HttpClient);
  private api = inject(Api);

  getSessions(eventId: string): Observable<ApiResponse<SessionModel[]>> {
    return this.http.get<ApiResponse<SessionModel[]>>(
      `${this.api.getUrl('api/v1/events/${eventId}/sessions')}`,
      { withCredentials: true }
    );
  }

  createSession(eventId: string, request: CreateSessionRequest): Observable<ApiResponse<SessionModel>> {
    return this.http.post<ApiResponse<SessionModel>>(
      `${this.api.getUrl('api/v1/session/${eventId}/sessions')}`,
      request,
      { withCredentials: true }
    );
  }

  getSessionById(eventId: string, sessionId: string): Observable<ApiResponse<SessionModel>> {
    return this.http.get<ApiResponse<SessionModel>>(
      `${this.api.getUrl('api/v1/events/${eventId}/sessions/${sessionId}')}`,
      { withCredentials: true }
    );
  }
}


