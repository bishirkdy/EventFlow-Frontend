import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
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
  private readonly changedSubject = new Subject<string>();

  readonly changed$ = this.changedSubject.asObservable();

  getFeatures(eventId: string): Observable<ApiResponse<EventFeatureModel[]>> {
    return this.http.get<ApiResponse<EventFeatureModel[]>>(
      this.api.getUrl(EVENT_FEATURE_ENDPOINTS.getFeatures(eventId)),
    );
  }

  enableFeature(eventId: string, featureId: string): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      this.api.getUrl(EVENT_FEATURE_ENDPOINTS.enable(eventId, featureId)),
      {},
    ).pipe(tap(() => this.changedSubject.next(eventId)));
  }

  disableFeature(eventId: string, featureId: string): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      this.api.getUrl(EVENT_FEATURE_ENDPOINTS.disable(eventId, featureId)),
      {},
    ).pipe(tap(() => this.changedSubject.next(eventId)));
  }

  resetFeatures(eventId: string): Observable<ApiResponse<EventFeatureModel[]>> {
    return this.http.post<ApiResponse<EventFeatureModel[]>>(
      this.api.getUrl(EVENT_FEATURE_ENDPOINTS.reset(eventId)),
      {},
    ).pipe(tap(() => this.changedSubject.next(eventId)));
  }
}
