import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '@/core/api/api';
import { ApiResponse } from '@/core/models/common/api-response';
import { InvitationData } from '@/core/models/photographer/photograher-invitation.model';
import { AcceptInvitationResponse } from '@/core/models/photographer/accept-invitation.model';
import { PHOTOGRAPHER_INVITATION_ENDPOINTS } from '@/core/api/endpoints/photograher-invitation/photographer-invitation.endpoints';
import { CreatePhotographerAccountRequest } from '@/core/models/photographer/create-photograher-request.model';

@Injectable({
  providedIn: 'root',
})
export class PhotographerInvitationService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getByToken(token: string): Observable<ApiResponse<InvitationData>> {
    return this.http.get<ApiResponse<InvitationData>>(
      this.api.getUrl(PHOTOGRAPHER_INVITATION_ENDPOINTS.getByToken(token)),
    );
  }

  acceptWithNewAccount(
    token: string,
    request: CreatePhotographerAccountRequest,
  ): Observable<ApiResponse<AcceptInvitationResponse>> {
    return this.http.post<ApiResponse<AcceptInvitationResponse>>(
      this.api.getUrl(PHOTOGRAPHER_INVITATION_ENDPOINTS.accept(token)),
      request,
    );
  }

  acceptForExistingUser(token: string): Observable<ApiResponse<AcceptInvitationResponse>> {
    return this.http.post<ApiResponse<AcceptInvitationResponse>>(
      this.api.getUrl(PHOTOGRAPHER_INVITATION_ENDPOINTS.acceptExisting(token)),
      {},
    );
  }
}
