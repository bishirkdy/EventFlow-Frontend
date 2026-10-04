import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { REGISTRATION_ENDPOINTS } from '../../api/endpoints/registration/registration.endpoint';

import {
  PaginatedResponseModel,
  RegistrationModel,
  RegistrationStatsModel,
} from '../../models/registration/registration-index';
import {
  CertificateAnalyticsModel,
  RegistrationAnalyticsModel,
} from '../../models/registration/registration-stats.model';
import { RegistrationStatus } from '../../models/registration/registration.enums';

import { ApiResponse } from '../../models/common/api-response';
import {
  CancelRegistrationRequest,
  CreateRegistrationRequest,
  RejectRegistrationRequest,
  UpdateRegistrationRequest,
} from '../../models/registration/registration-request.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  create(
    eventId: string,
    request: CreateRegistrationRequest,
  ): Observable<ApiResponse<RegistrationModel>> {
    return this.http.post<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.collection(eventId)),
      request,
    );
  }

  update(
    eventId: string,
    registrationId: string,
    request: UpdateRegistrationRequest,
  ): Observable<ApiResponse<RegistrationModel>> {
    return this.http.put<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.byId(eventId, registrationId)),
      request,
    );
  }

  get(eventId: string, registrationId: string): Observable<ApiResponse<RegistrationModel>> {
    return this.http.get<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.byId(eventId, registrationId)),
    );
  }

  getById(eventId: string, registrationId: string): Observable<ApiResponse<RegistrationModel>> {
    return this.http.get<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.byId(eventId, registrationId)),
    );
  }

  getForManagement(
    eventId: string,
    registrationId: string,
  ): Observable<ApiResponse<RegistrationModel>> {
    return this.http.get<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.manage(eventId, registrationId)),
    );
  }

  getMine(eventId: string): Observable<ApiResponse<RegistrationModel[]>> {
    return this.http.get<ApiResponse<RegistrationModel[]>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.mine(eventId)),
    );
  }

  list(
    eventId: string,
    pageNumber = 1,
    pageSize = 20,
    status?: RegistrationStatus | null,
    search?: string,
  ): Observable<ApiResponse<PaginatedResponseModel<RegistrationModel>>> {
    const params = new URLSearchParams({
      page: String(pageNumber),
      pageSize: String(pageSize),
    });

    if (status !== undefined && status !== null) params.set('status', String(status));
    if (search?.trim()) params.set('search', search.trim());

    return this.http.get<ApiResponse<PaginatedResponseModel<RegistrationModel>>>(
      this.api.getUrl(`${REGISTRATION_ENDPOINTS.collection(eventId)}?${params.toString()}`),
    );
  }

  getStats(eventId: string): Observable<ApiResponse<RegistrationStatsModel>> {
    return this.http.get<ApiResponse<RegistrationStatsModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.stats(eventId)),
    );
  }

  getRegistrationAnalytics(
    eventId: string,
    days = 30,
  ): Observable<ApiResponse<RegistrationAnalyticsModel>> {
    return this.http.get<ApiResponse<RegistrationAnalyticsModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.analytics(eventId, days)),
    );
  }

  getCertificateAnalytics(
    eventId: string,
  ): Observable<ApiResponse<CertificateAnalyticsModel>> {
    return this.http.get<ApiResponse<CertificateAnalyticsModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.certificateAnalytics(eventId)),
    );
  }

  approve(eventId: string, registrationId: string): Observable<ApiResponse<RegistrationModel>> {
    return this.http.post<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.approve(eventId, registrationId)),
      {},
    );
  }

  reject(
    eventId: string,
    registrationId: string,
    request: RejectRegistrationRequest,
  ): Observable<ApiResponse<RegistrationModel>> {
    return this.http.post<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.reject(eventId, registrationId)),
      request,
    );
  }

  cancel(
    eventId: string,
    registrationId: string,
    request: CancelRegistrationRequest = {},
  ): Observable<ApiResponse<RegistrationModel>> {
    return this.http.post<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.cancel(eventId, registrationId)),
      request,
    );
  }

  waitlist(eventId: string, registrationId: string): Observable<ApiResponse<RegistrationModel>> {
    return this.http.post<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.waitlist(eventId, registrationId)),
      {},
    );
  }

  promote(eventId: string, registrationId: string): Observable<ApiResponse<RegistrationModel>> {
    return this.http.post<ApiResponse<RegistrationModel>>(
      this.api.getUrl(REGISTRATION_ENDPOINTS.promote(eventId, registrationId)),
      {},
    );
  }
}
