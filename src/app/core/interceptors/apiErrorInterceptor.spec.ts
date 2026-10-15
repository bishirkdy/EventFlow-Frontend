import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { apiErrorInterceptor } from './apiErrorInterceptor';
import { NotificationService } from '../services/ui/notification.service';

describe('apiErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  const notification = { error: vi.fn(), success: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notification },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    notification.error.mockClear();
  });

  afterEach(() => httpMock.verify());

  const flushError = (
    url: string,
    status: number,
    body: string | object | null = null,
    statusText = '',
  ) => httpMock.expectOne(url).flush(body, { status, statusText });

  it('stays out of the way on 401 so authRefreshInterceptor owns recovery', () => {
    let captured: any;
    TestBed.inject(HttpClient).get('/api/data').subscribe({ error: err => (captured = err) });

    flushError('/api/data', 401, 'expired', 'Unauthorized');

    expect(captured.status).toBe(401);
    expect(notification.error).not.toHaveBeenCalled();
  });

  it('does not toast on GET failures — components show inline error states', () => {
    TestBed.inject(HttpClient).get('/api/data').subscribe({ error: () => undefined });

    flushError('/api/data', 500, null, 'Server Error');

    expect(notification.error).not.toHaveBeenCalled();
  });

  it('does not toast a GET 403 — the calling page renders its own state', () => {
    TestBed.inject(HttpClient).get('/api/data').subscribe({ error: () => undefined });

    flushError('/api/data', 403, null, 'Forbidden');

    expect(notification.error).not.toHaveBeenCalled();
  });

  it('toasts failed mutations with the API message', () => {
    TestBed.inject(HttpClient)
      .post('/api/items', {})
      .subscribe({ error: () => undefined });

    flushError('/api/items', 500, { message: 'Saving failed.' }, 'Server Error');

    expect(notification.error).toHaveBeenCalledTimes(1);
    expect(notification.error).toHaveBeenCalledWith('Saving failed.');
  });

  it('uses the permission fallback for 403 mutations', () => {
    TestBed.inject(HttpClient)
      .delete('/api/items/1')
      .subscribe({ error: () => undefined });

    flushError('/api/items/1', 403, { message: 'Forbidden' }, 'Forbidden');

    expect(notification.error).toHaveBeenCalledWith('Forbidden');
  });

  it('uses the generic fallback when the error carries no message', () => {
    TestBed.inject(HttpClient)
      .post('/api/items', {})
      .subscribe({ error: () => undefined });

    flushError('/api/items', 500, null, 'Server Error');

    expect(notification.error).toHaveBeenCalledWith('The request failed. Please try again.');
  });

  it('skips mutations that failed server-side validation so forms can show field errors', () => {
    TestBed.inject(HttpClient)
      .post('/api/items', {})
      .subscribe({ error: () => undefined });

    flushError('/api/items', 400, { message: 'Invalid.', errors: ['Name is required.'] }, 'Bad Request');

    expect(notification.error).not.toHaveBeenCalled();
  });

  it('toasts a network failure with a connectivity message', () => {
    TestBed.inject(HttpClient)
      .post('/api/items', {})
      .subscribe({ error: () => undefined });

    flushError('/api/items', 0, null, 'Unknown Error');

    expect(notification.error).toHaveBeenCalledWith(
      'Network error. Check your connection and try again.',
    );
  });

  it('toasts failed login attempts even though they return 401', () => {
    TestBed.inject(HttpClient)
      .post('/api/v1/auth/login', {})
      .subscribe({ error: () => undefined });

    flushError('/api/v1/auth/login', 401, { message: 'Invalid credentials.' }, 'Unauthorized');

    expect(notification.error).toHaveBeenCalledTimes(1);
    expect(notification.error).toHaveBeenCalledWith('Invalid credentials.');
  });

  it('stays silent on logout 401 so an expired session does not toast', () => {
    TestBed.inject(HttpClient)
      .post('/api/v1/auth/logout', {})
      .subscribe({ error: () => undefined });

    flushError('/api/v1/auth/logout', 401, null, 'Unauthorized');

    expect(notification.error).not.toHaveBeenCalled();
  });
});
