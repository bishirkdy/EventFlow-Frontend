import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Api } from '../api';
import { ApiResponse } from '../../models/api-response';
import { EventFeatureModel } from '../../models/event-feature/event-feature.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventFeatureService {
  private http = inject(HttpClient);
  private api = inject(Api);

  getFeatures(eventId: string): Observable<ApiResponse<EventFeatureModel[]>> {
    return this.http.get<ApiResponse<EventFeatureModel[]>>(
      this.api.getUrl('api/v1/events/${eventId}/features'),
      { withCredentials: true }
    );
  }


  enableFeature(eventId: string, featureId: string
  ): Observable<ApiResponse<EventFeatureModel>> {
    return this.http.post<ApiResponse<EventFeatureModel>>(
      this.api.getUrl('api/v1/events/${eventId}/features/${featureId}/enable'),
      {},
      { withCredentials: true }
    );
  }

  disableFeature(eventId: string, featureId: string
  ): Observable<ApiResponse<EventFeatureModel>> {
    return this.http.post<ApiResponse<EventFeatureModel>>(
      this.api.getUrl('api/v1/events/${eventId}/features/${featureId}/disable'),
      {},
      { withCredentials: true }
    );
  }

  resetFeatures(eventId: string): Observable<ApiResponse<EventFeatureModel[]>> {
    return this.http.post<ApiResponse<EventFeatureModel[]>>(
      this.api.getUrl('api/v1/events/${eventId}/features/reset'),
      {},
      { withCredentials: true }
    );
  }
}
