import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { apiErrorInterceptor } from './apiErrorInterceptor';
import { NotificationService } from '../services/ui/notification.service';

describe('apiErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  const notification = { error: vi.fn() };

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

  it('stays out of the way on 401 so authRefreshInterceptor owns recovery', () => {
    let captured: any;
    TestBed.inject(HttpClient).get('/api/data').subscribe({ error: err => (captured = err) });

    httpMock.expectOne('/api/data').flush('expired', { status: 401, statusText: 'Unauthorized' });

    expect(captured.status).toBe(401);
    expect(notification.error).not.toHaveBeenCalled();
  });

  it('still surfaces a permission toast on 403', () => {
    TestBed.inject(HttpClient).get('/api/data').subscribe({ error: () => undefined });

    httpMock.expectOne('/api/data').flush('forbidden', { status: 403, statusText: 'Forbidden' });

    expect(notification.error).toHaveBeenCalledTimes(1);
  });

  it('does not toast on ordinary server errors', () => {
    TestBed.inject(HttpClient).get('/api/data').subscribe({ error: () => undefined });

    httpMock.expectOne('/api/data').flush('boom', { status: 500, statusText: 'Server Error' });

    expect(notification.error).not.toHaveBeenCalled();
  });
});
