import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '@/core/api/api';
import { ApiResponse } from '@/core/models/common';
import { INVITATION_ENDPOINTS } from '@/core/api/endpoints/invitation/invitation.endpoints';
import {
  EventInvitationModel,
  InvitationData,
  InvitationScopeType,
} from '@/core/models/invitation';
import {
  AcceptInvitationResponse,
  CreatePhotographerAccountRequest,
} from '@/core/models/photographer';

export interface InviteAttendanceStaffRequest {
  email: string;
  scopeType: InvitationScopeType;
  scopeId: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getByToken(token: string): Observable<ApiResponse<InvitationData>> {
    return this.http.get<ApiResponse<InvitationData>>(
      this.api.getUrl(INVITATION_ENDPOINTS.getByToken(token)),
    );
  }

  acceptWithNewAccount(
    token: string,
    request: CreatePhotographerAccountRequest,
  ): Observable<ApiResponse<AcceptInvitationResponse>> {
    return this.http.post<ApiResponse<AcceptInvitationResponse>>(
      this.api.getUrl(INVITATION_ENDPOINTS.accept(token)),
      request,
    );
  }

  acceptForExistingUser(token: string): Observable<ApiResponse<AcceptInvitationResponse>> {
    return this.http.post<ApiResponse<AcceptInvitationResponse>>(
      this.api.getUrl(INVITATION_ENDPOINTS.acceptExisting(token)),
      {},
    );
  }

  getOrganizerInvitations(
    eventId: string,
  ): Observable<ApiResponse<EventInvitationModel[]>> {
    return this.http.get<ApiResponse<EventInvitationModel[]>>(
      this.api.getUrl(INVITATION_ENDPOINTS.organizerInvitations(eventId)),
    );
  }

  inviteOrganizer(
    eventId: string,
    email: string,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      this.api.getUrl(INVITATION_ENDPOINTS.inviteOrganizer(eventId)),
      { email },
    );
  }

  revokeOrganizerInvitation(
    eventId: string,
    invitationId: string,
  ): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      this.api.getUrl(INVITATION_ENDPOINTS.revokeOrganizerInvitation(eventId, invitationId)),
    );
  }

  getAttendanceStaffInvitations(
    eventId: string,
  ): Observable<ApiResponse<EventInvitationModel[]>> {
    return this.http.get<ApiResponse<EventInvitationModel[]>>(
      this.api.getUrl(INVITATION_ENDPOINTS.attendanceStaffInvitations(eventId)),
    );
  }

  inviteAttendanceStaff(
    eventId: string,
    request: InviteAttendanceStaffRequest,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      this.api.getUrl(INVITATION_ENDPOINTS.inviteAttendanceStaff(eventId)),
      request,
    );
  }

  revokeAttendanceStaffInvitation(
    eventId: string,
    invitationId: string,
  ): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      this.api.getUrl(
        INVITATION_ENDPOINTS.revokeAttendanceStaffInvitation(eventId, invitationId),
      ),
    );
  }
}
