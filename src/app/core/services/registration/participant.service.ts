import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { PARTICIPANT_ENDPOINTS } from '../../api/endpoints/registration/participant.endpoint';

import {
  PaginatedResponseModel,
  ParticipantModel,
} from '../../models/registration/registration-index';

import { ApiResponse } from '../../models/common/api-response';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  list(
    eventId: string,
    pageNumber = 1,
    pageSize = 20,
    search?: string,
    status?: number | null,
  ): Observable<ApiResponse<PaginatedResponseModel<ParticipantModel>>> {
    const params = new URLSearchParams({
      page: String(pageNumber),
      pageSize: String(pageSize),
    });

    if (search?.trim()) params.set('search', search.trim());
    if (status !== undefined && status !== null) params.set('status', String(status));

    return this.http.get<ApiResponse<PaginatedResponseModel<ParticipantModel>>>(
      this.api.getUrl(`${PARTICIPANT_ENDPOINTS.collection(eventId)}?${params.toString()}`),
    );
  }

  get(eventId: string, participantId: string): Observable<ApiResponse<ParticipantModel>> {
    return this.http.get<ApiResponse<ParticipantModel>>(
      this.api.getUrl(
        PARTICIPANT_ENDPOINTS.byId(eventId, participantId),
      ),
    );
  }
}