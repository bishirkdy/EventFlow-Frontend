import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { Api } from '../../api/api';
import { ApiResponse } from '../../models/common/api-response';
import {
  EventRoleModel,
  EventTeamMemberModel,
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
          return of({
            isSuccess: false,
            statusCode: 401,
            message: 'Authentication is required.',
            data: null,
            errors: ['Authentication is required.'],
          } satisfies ApiResponse<EventRoleModel[]>);
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
