import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { REGISTRATION_FORM_ENDPOINTS } from '../../api/endpoints/registration/registration-form.endpoint';

import {
  RegistrationFormModel,
  UpsertRegistrationFormRequest,
} from '../../models/registration/registration-index';

import { ApiResponse } from '../../models/common/api-response';

@Injectable({
  providedIn: 'root',
})

export class RegistrationFormService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  get(eventId: string): Observable<ApiResponse<RegistrationFormModel>> {
    return this.http.get<ApiResponse<RegistrationFormModel>>(
      this.api.getUrl(REGISTRATION_FORM_ENDPOINTS.byEvent(eventId),),
    );
  }

  upsert(eventId: string, request: UpsertRegistrationFormRequest): Observable<ApiResponse<RegistrationFormModel>> {
    return this.http.put<ApiResponse<RegistrationFormModel>>(
      this.api.getUrl(REGISTRATION_FORM_ENDPOINTS.byEvent(eventId)), request,
    );
  }
}