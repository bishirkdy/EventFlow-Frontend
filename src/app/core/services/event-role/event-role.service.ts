import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';

import { Api } from '../../api/api';
import { ApiResponse } from '../../models/common/api-response';
import {
  EventRoleModel,
  EventTeamMemberModel,
  TeamAnalyticsModel,
} from '../../models/event-role/event-role.model';
import { AuthService } from '../auth/auth.service';
import { EVENT_ROLE_ENDPOINTS } from '../../api/endpoints/event-role/event-role.endpoints';

@Injectable({
  providedIn: 'root',
})

export class EventRoleService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);
  private readonly authService = inject(AuthService);

  getMyRoles(eventId: string): Observable<ApiResponse<EventRoleModel[]>> {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      return this.http.get<ApiResponse<EventRoleModel[]>>(
        this.api.getUrl(EVENT_ROLE_ENDPOINTS.myRoles(eventId, currentUser.id)),
      );
    }

    return this.authService.loadCurrentUser().pipe(
      switchMap((user) => {
        if (!user) {
          // A real 401 lets the auth interceptor refresh the session (or send
          // the user to login) instead of the guard treating it as "no roles".
          return throwError(
            () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }),
          );
        }

        return this.http.get<ApiResponse<EventRoleModel[]>>(
          this.api.getUrl(EVENT_ROLE_ENDPOINTS.myRoles(eventId, user.id)),
        );
      }),
    );
  }

  getTeam(eventId: string): Observable<ApiResponse<EventTeamMemberModel[]>> {
    return this.http.get<ApiResponse<EventTeamMemberModel[]>>(
      this.api.getUrl(EVENT_ROLE_ENDPOINTS.team(eventId)),
    );
  }

  getTeamAnalytics(eventId: string): Observable<ApiResponse<TeamAnalyticsModel>> {
    return this.http.get<ApiResponse<TeamAnalyticsModel>>(
      this.api.getUrl(EVENT_ROLE_ENDPOINTS.teamAnalytics(eventId)),
    );
  }

  assignOrganizer(eventId: string, email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      this.api.getUrl(EVENT_ROLE_ENDPOINTS.organizers(eventId)),
      { email },
    );
  }

  removeOrganizer(eventId: string, userId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      this.api.getUrl(EVENT_ROLE_ENDPOINTS.removeOrganizer(eventId, userId)),
    );
  }
}
