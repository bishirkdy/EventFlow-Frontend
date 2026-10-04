import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { FeedbackService } from './feedback.service';
import { FeedbackTargetType } from '../../models/feedback/feedback.model';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FeedbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('submit posts the payload to the feedback endpoint', () => {
    let response: any;

    service
      .submit('event-1', {
        targetType: FeedbackTargetType.Event,
        targetId: null,
        rating: 4,
        comment: 'Nice event',
      })
      .subscribe(r => (response = r));

    const req = httpMock.expectOne(
      r => r.url.includes('/v1/events/event-1/feedback') && r.method === 'POST',
    );
    expect(req.request.body).toEqual({
      targetType: FeedbackTargetType.Event,
      targetId: null,
      rating: 4,
      comment: 'Nice event',
    });

    req.flush({
      isSuccess: true,
      statusCode: 200,
      message: 'ok',
      data: { feedbackId: 'f-1', rating: 4, submittedAtUtc: '2026-10-04T00:00:00Z' },
    });

    expect(response.data.feedbackId).toBe('f-1');
  });

  it('results fetches the results endpoint', () => {
    let response: any;

    service.results('event-1').subscribe(r => (response = r));

    const req = httpMock.expectOne(
      r => r.url.includes('/v1/events/event-1/feedback/results') && r.method === 'GET',
    );
    req.flush({
      isSuccess: true,
      statusCode: 200,
      message: 'ok',
      data: { totalCount: 2, averageRating: 4.5 },
    });

    expect(response.data.totalCount).toBe(2);
    expect(response.data.averageRating).toBe(4.5);
  });
});
