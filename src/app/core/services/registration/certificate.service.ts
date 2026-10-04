import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { CERTIFICATE_ENDPOINTS } from '../../api/endpoints/registration/certificate.endpoint';
import { ApiResponse } from '../../models/common/api-response';
import {
  CertificateEligibilityModel,
  CertificateGenerationResultModel,
  CertificateModel,
  CertificateSettingsModel,
  CertificateSettingsRequest,
  CertificateVerifyModel,
  GenerateCertificatesRequest,
} from '../../models/registration/certificate.model';

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getSettings(eventId: string): Observable<ApiResponse<CertificateSettingsModel>> {
    return this.http.get<ApiResponse<CertificateSettingsModel>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.settings(eventId)),
    );
  }

  updateSettings(
    eventId: string,
    request: CertificateSettingsRequest,
  ): Observable<ApiResponse<CertificateSettingsModel>> {
    return this.http.put<ApiResponse<CertificateSettingsModel>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.settings(eventId)),
      request,
    );
  }

  getEligibility(eventId: string): Observable<ApiResponse<CertificateEligibilityModel>> {
    return this.http.get<ApiResponse<CertificateEligibilityModel>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.eligibility(eventId)),
    );
  }

  generate(
    eventId: string,
    request: GenerateCertificatesRequest = { registrationIds: null },
  ): Observable<ApiResponse<CertificateGenerationResultModel>> {
    return this.http.post<ApiResponse<CertificateGenerationResultModel>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.generate(eventId)),
      request,
    );
  }

  list(eventId: string): Observable<ApiResponse<CertificateModel[]>> {
    return this.http.get<ApiResponse<CertificateModel[]>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.collection(eventId)),
    );
  }

  getMine(eventId: string): Observable<ApiResponse<CertificateModel[]>> {
    return this.http.get<ApiResponse<CertificateModel[]>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.mine(eventId)),
    );
  }

  getAllMine(): Observable<ApiResponse<CertificateModel[]>> {
    return this.http.get<ApiResponse<CertificateModel[]>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.myAcrossEvents),
    );
  }

  revoke(
    eventId: string,
    certificateId: string,
  ): Observable<ApiResponse<CertificateModel>> {
    return this.http.post<ApiResponse<CertificateModel>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.revoke(eventId, certificateId)),
      {},
    );
  }

  download(eventId: string, certificateId: string): Observable<Blob> {
    return this.http.get(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.download(eventId, certificateId)),
      { responseType: 'blob' },
    );
  }

  verify(certificateNumber: string): Observable<ApiResponse<CertificateVerifyModel>> {
    return this.http.get<ApiResponse<CertificateVerifyModel>>(
      this.api.getUrl(CERTIFICATE_ENDPOINTS.verify(certificateNumber)),
    );
  }
}
