import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { TICKET_ENDPOINTS } from '../../api/endpoints/registration/ticket.endpoint';
import { TicketModel } from '../../models/registration/registration-index';
import { ApiResponse } from '../../models/common/api-response';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getByRegistration(
    eventId: string,
    registrationId: string,
  ): Observable<ApiResponse<TicketModel>> {
    return this.http.get<ApiResponse<TicketModel>>(
      this.api.getUrl(
        TICKET_ENDPOINTS.byRegistration(eventId, registrationId),
      ),
    );
  }

  verify(
    eventId: string,
    qrCodeValue: string,
  ): Observable<ApiResponse<TicketModel>> {
    return this.http.post<ApiResponse<TicketModel>>(
      this.api.getUrl(TICKET_ENDPOINTS.verify(eventId)),
      { qrCodeValue },
    );
  }

  revoke(
    eventId: string,
    ticketId: string,
  ): Observable<ApiResponse<TicketModel>> {
    return this.http.post<ApiResponse<TicketModel>>(
      this.api.getUrl(TICKET_ENDPOINTS.revoke(eventId, ticketId)),
      {},
    );
  }
}