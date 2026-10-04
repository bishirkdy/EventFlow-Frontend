import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { OrganizerFeedbackComponent } from './feedback';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { FeedbackTargetType } from '../../../../core/models/feedback/feedback.model';

describe('OrganizerFeedbackComponent', () => {
  let component: OrganizerFeedbackComponent;
  let fixture: ComponentFixture<OrganizerFeedbackComponent>;
  let httpMock: HttpTestingController;
  let notify: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const resultsPayload = {
    totalCount: 4,
    averageRating: 4.25,
    ratingDistribution: [
      { rating: 5, count: 2 },
      { rating: 4, count: 1 },
      { rating: 3, count: 1 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    targets: [
      {
        targetType: FeedbackTargetType.Event,
        targetId: 'event-1',
        targetName: 'Test Event',
        count: 4,
        averageRating: 4.25,
      },
    ],
    recentFeedback: [
      {
        id: 'f-1',
        targetType: FeedbackTargetType.Event,
        targetId: 'event-1',
        targetName: 'Test Event',
        rating: 5,
        comment: 'Loved it',
        submittedAtUtc: '2026-10-04T00:00:00Z',
      },
    ],
  };

  function flushResults(payload: any = resultsPayload) {
    httpMock
      .expectOne(r => r.url.includes('/feedback/results') && r.method === 'GET')
      .flush({ isSuccess: true, statusCode: 200, message: 'ok', data: payload });
  }

  beforeEach(async () => {
    notify = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [OrganizerFeedbackComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'event-1',
              },
            },
          },
        },
        {
          provide: NotificationService,
          useValue: notify,
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OrganizerFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load results', () => {
    expect(component).toBeTruthy();
    expect(component.loading()).toBe(true);

    flushResults();

    expect(component.loading()).toBe(false);
    expect(component.results()!.totalCount).toBe(4);
    expect(component.results()!.averageRating).toBe(4.25);
  });

  it('computes distribution percentages against the total', () => {
    flushResults();

    expect(component.distributionPercent(2)).toBe(50);
    expect(component.distributionPercent(1)).toBe(25);
    expect(component.distributionPercent(0)).toBe(0);
  });

  it('returns zero percent when there are no responses', () => {
    flushResults({ ...resultsPayload, totalCount: 0, ratingDistribution: [], targets: [], recentFeedback: [] });

    expect(component.distributionPercent(3)).toBe(0);
    expect(component.results()!.totalCount).toBe(0);
  });

  it('maps target types to display labels', () => {
    flushResults();

    expect(component.targetLabels[FeedbackTargetType.Event]).toBe('Event');
    expect(component.targetLabels[FeedbackTargetType.Session]).toBe('Session');
    expect(component.targetLabels[FeedbackTargetType.Speaker]).toBe('Speaker');
    expect(component.targetLabels[FeedbackTargetType.Venue]).toBe('Venue');
  });

  it('shows an error state when loading fails', () => {
    httpMock
      .expectOne(r => r.url.includes('/feedback/results'))
      .flush({ isSuccess: false, statusCode: 500, message: 'boom', data: null }, { status: 500, statusText: 'Server Error' });

    expect(component.loading()).toBe(false);
    expect(component.results()).toBeNull();
    expect(notify.error).toHaveBeenCalled();
  });
});
