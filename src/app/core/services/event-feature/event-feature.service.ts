import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../api/api';
import { EVENT_FEATURE_ENDPOINTS } from '../../api/endpoints/event-feature.endpoint';
import { ApiResponse } from '../../models/common/api-response';
import { EventFeatureModel } from '../../models/event-feature/event-feature.model';

@Injectable({
  providedIn: 'root',
})
export class EventFeatureService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  getFeatures(eventId: string): Observable<ApiResponse<EventFeatureModel[]>> {
    return this.http.get<ApiResponse<EventFeatureModel[]>>(
      this.api.getUrl(EVENT_FEATURE_ENDPOINTS.getFeatures(eventId)),
    );
  }

  enableFeature(eventId: string, featureId: string): Observable<ApiResponse<EventFeatureModel>> {
    return this.http.post<ApiResponse<EventFeatureModel>>(
      this.api.getUrl(EVENT_FEATURE_ENDPOINTS.enable(eventId, featureId)),
      {},
    );
  }

  disableFeature(eventId: string, featureId: string): Observable<ApiResponse<EventFeatureModel>> {
    return this.http.post<ApiResponse<EventFeatureModel>>(
      this.api.getUrl(EVENT_FEATURE_ENDPOINTS.disable(eventId, featureId)),
      {},
    );
  }

  resetFeatures(eventId: string): Observable<ApiResponse<EventFeatureModel[]>> {
    return this.http.post<ApiResponse<EventFeatureModel[]>>(
      this.api.getUrl(EVENT_FEATURE_ENDPOINTS.reset(eventId)),
      {},
    );
  }
}
