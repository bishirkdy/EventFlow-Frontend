import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../api/api';
import { FEEDBACK_ENDPOINTS } from '../../api/endpoints/feedback/feedback.endpoint';
import { ApiResponse } from '../../models/common/api-response';
import {
  FeedbackResults,
  SubmitFeedbackPayload,
  SubmitFeedbackResult,
} from '../../models/feedback/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  submit(eventId: string, payload: SubmitFeedbackPayload): Observable<ApiResponse<SubmitFeedbackResult>> {
    return this.http.post<ApiResponse<SubmitFeedbackResult>>(
      this.api.getUrl(FEEDBACK_ENDPOINTS.submit(eventId)),
      payload,
    );
  }

  results(eventId: string): Observable<ApiResponse<FeedbackResults>> {
    return this.http.get<ApiResponse<FeedbackResults>>(
      this.api.getUrl(FEEDBACK_ENDPOINTS.results(eventId)),
    );
  }
}
