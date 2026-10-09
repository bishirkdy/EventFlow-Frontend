import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PhotographerInvitationModel } from '../../models/photographer/photographer.model';
import { ApiResponse } from '@/core/models/common/api-response';
import { Api } from '@/core/api/api';
import { PHOTOGRAPHER_ENDPOINTS } from '@/core/api/endpoints/photographer/photographer.endpoints';


@Injectable({
  providedIn: 'root',
})
export class PhotographerService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getInvitations(
    eventId: string,
  ): Observable<ApiResponse<PhotographerInvitationModel[]>> {
    return this.http.get<ApiResponse<PhotographerInvitationModel[]>>(
      this.api.getUrl(
        PHOTOGRAPHER_ENDPOINTS.getInvitations(eventId),
      ),
    );
  }

  invite(
    eventId: string,
    email: string,
  ): Observable<ApiResponse<PhotographerInvitationModel>> {
    return this.http.post<ApiResponse<PhotographerInvitationModel>>(
      this.api.getUrl(
        PHOTOGRAPHER_ENDPOINTS.invite(eventId),
      ),
      { email },
    );
  }

  revoke(
    eventId: string,
    invitationId: string,
  ): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      this.api.getUrl(
        PHOTOGRAPHER_ENDPOINTS.revoke(eventId, invitationId),
      ),
    );
  }

  resend(
    eventId: string,
    invitationId: string,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      this.api.getUrl(
        PHOTOGRAPHER_ENDPOINTS.resend(eventId, invitationId),
      ),
      {},
    );
  }
}