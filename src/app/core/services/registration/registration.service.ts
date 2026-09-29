import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { REGISTRATION_ENDPOINTS } from '../../api/endpoints/registration/registration.endpoint';
import {
  CancelRegistrationRequest,
  CreateRegistrationRequest,
  PaginatedResponseModel,
  RegistrationModel,
  RegistrationStatsModel,
  RejectRegistrationRequest,
  UpdateRegistrationRequest,
} from '../../models/registration/registration-index';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  create(
    eventId: string,
    request: CreateRegistrationRequest,
  ): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.collection(eventId)),
      request,
    );
  }

  update(
    eventId: string,
    registrationId: string,
    request: UpdateRegistrationRequest,
  ): Observable<RegistrationModel> {
    return this.http.put<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.byId(eventId, registrationId)),
      request,
    );
  }

  get(
    eventId: string,
    registrationId: string,
  ): Observable<RegistrationModel> {
    return this.http.get<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.byId(eventId, registrationId)),
    );
  }

  getForManagement(
    eventId: string,
    registrationId: string,
  ): Observable<RegistrationModel> {
    return this.http.get<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.manage(eventId, registrationId)),
    );
  }

  getMine(eventId: string): Observable<RegistrationModel[]> {
    return this.http.get<RegistrationModel[]>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.mine(eventId)),
    );
  }

  list(
    eventId: string,
    pageNumber = 1,
    pageSize = 20,
  ): Observable<PaginatedResponseModel<RegistrationModel>> {
    return this.http.get<PaginatedResponseModel<RegistrationModel>>(
      this.api.getUrl(
        `${REGISTRATION_ENDPOINTS.collection(eventId)}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      ),
    );
  }

  getStats(eventId: string): Observable<RegistrationStatsModel> {
    return this.http.get<RegistrationStatsModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.stats(eventId)),
    );
  }

  approve(
    eventId: string,
    registrationId: string,
  ): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.approve(eventId, registrationId)),
      {},
    );
  }

  reject(
    eventId: string,
    registrationId: string,
    request: RejectRegistrationRequest,
  ): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.reject(eventId, registrationId)),
      request,
    );
  }

  cancel(
    eventId: string,
    registrationId: string,
    request: CancelRegistrationRequest = {},
  ): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.cancel(eventId, registrationId)),
      request,
    );
  }

  waitlist(
    eventId: string,
    registrationId: string,
  ): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.waitlist(eventId, registrationId)),
      {},
    );
  }

  promote(
    eventId: string,
    registrationId: string,
  ): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.promote(eventId, registrationId)),
      {},
    );
  }
}
