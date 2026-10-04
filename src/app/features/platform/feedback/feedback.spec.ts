import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { FeedbackComponent } from './feedback';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { FeedbackTargetType } from '../../../core/models/feedback/feedback.model';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  let httpMock: HttpTestingController;
  let notify: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  function flushTargets() {
    httpMock
      .expectOne(r => r.url.includes('/sessions') && r.method === 'GET')
      .flush({ isSuccess: true, statusCode: 200, message: 'ok', data: [] });
    httpMock
      .expectOne(r => r.url.includes('/speakers') && r.method === 'GET')
      .flush({ isSuccess: true, statusCode: 200, message: 'ok', data: [] });
    httpMock
      .expectOne(r => r.url.includes('/venues') && r.method === 'GET')
      .flush({ isSuccess: true, statusCode: 200, message: 'ok', data: [] });
  }

  beforeEach(async () => {
    notify = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [FeedbackComponent],
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
    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushTargets();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.submitted()).toBe(false);
    expect(component.targetType()).toBe(FeedbackTargetType.Event);
    expect(component.rating()).toBe(0);
  });

  it('defaults to event feedback without a target', () => {
    expect(component.needsTarget()).toBe(false);
    expect(component.currentTargets()).toEqual([]);
    expect(component.targetTypeOptions().length).toBe(1);
  });

  it('cannot submit without a rating', () => {
    expect(component.canSubmit()).toBe(false);
    component.setRating(4);
    expect(component.canSubmit()).toBe(true);
  });

  it('requires a target once a non-event type is chosen', () => {
    component.selectTargetType(FeedbackTargetType.Session);
    expect(component.needsTarget()).toBe(true);
    expect(component.canSubmit()).toBe(false);

    component.setRating(5);
    expect(component.canSubmit()).toBe(false);

    component.setTarget('session-1');
    expect(component.canSubmit()).toBe(true);
    expect(component.targetTypeOptions().length).toBe(1);
  });

  it('notifies and sends no request when rating is missing', () => {
    component.submit();
    expect(notify.error).toHaveBeenCalled();
    httpMock.expectNone(r => r.url.includes('/feedback') && r.method === 'POST');
  });

  it('submits feedback and shows the success state', () => {
    component.setRating(5);
    component.setComment('Great');

    component.submit();

    const req = httpMock.expectOne(
      r => r.url.includes('/v1/events/event-1/feedback') && r.method === 'POST',
    );
    expect(req.request.body.rating).toBe(5);
    expect(req.request.body.comment).toBe('Great');
    req.flush({
      isSuccess: true,
      statusCode: 200,
      message: 'ok',
      data: { feedbackId: 'f-1', rating: 5, submittedAtUtc: 'now' },
    });

    expect(component.submitted()).toBe(true);
    expect(notify.success).toHaveBeenCalled();
  });

  it('surfaces backend errors on submit', () => {
    component.setRating(3);
    component.submit();

    const req = httpMock.expectOne(
      r => r.url.includes('/v1/events/event-1/feedback') && r.method === 'POST',
    );
    req.flush(
      { isSuccess: false, statusCode: 409, message: 'Already submitted', data: null },
      { status: 409, statusText: 'Conflict' },
    );

    expect(component.submitted()).toBe(false);
    expect(notify.error).toHaveBeenCalled();
  });

  it('resets the form after the success state', () => {
    component.setRating(4);
    component.submit();
    httpMock
      .expectOne(r => r.url.includes('/feedback') && r.method === 'POST')
      .flush({ isSuccess: true, statusCode: 200, message: 'ok', data: { feedbackId: 'f', rating: 4, submittedAtUtc: 'now' } });

    component.reset();

    expect(component.submitted()).toBe(false);
    expect(component.rating()).toBe(0);
    expect(component.targetType()).toBe(FeedbackTargetType.Event);
  });
});
