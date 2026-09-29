import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { PARTICIPANT_ENDPOINTS } from '../../api/endpoints/registration/participant.endpoint';
import {
  PaginatedResponseModel,
  ParticipantModel,
} from '../../models/registration/registration-index';

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
  ): Observable<PaginatedResponseModel<ParticipantModel>> {
    return this.http.get<PaginatedResponseModel<ParticipantModel>>(
      this.api.getUrl(
        `${PARTICIPANT_ENDPOINTS.collection(eventId)}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      ),
    );
  }

  get(
    eventId: string,
    participantId: string,
  ): Observable<ParticipantModel> {
    return this.http.get<ParticipantModel>(
      this.api.getUrl(PARTICIPANT_ENDPOINTS.byId(eventId, participantId)),
    );
  }
}
