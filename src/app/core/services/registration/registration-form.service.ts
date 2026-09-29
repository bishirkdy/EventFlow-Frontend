import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Api } from '../../api/api';
import { REGISTRATION_FORM_ENDPOINTS } from '../../api/endpoints/registration/registration-form.endpoint';
import {
  RegistrationFormModel,
  UpsertRegistrationFormRequest,
} from '../../models/registration/registration-index';

@Injectable({
  providedIn: 'root',
})
export class RegistrationFormService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  get(eventId: string): Observable<RegistrationFormModel> {
    return this.http.get<RegistrationFormModel>(
      this.api.getUrl(REGISTRATION_FORM_ENDPOINTS.byEvent(eventId)),
    );
  }

  upsert(
    eventId: string,
    request: UpsertRegistrationFormRequest,
  ): Observable<RegistrationFormModel> {
    return this.http.put<RegistrationFormModel>(
      this.api.getUrl(REGISTRATION_FORM_ENDPOINTS.byEvent(eventId)),
      request,
    );
  }
}
