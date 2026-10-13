import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { authRefreshInterceptor } from './authRefreshInterceptor';
import { AuthService } from '../services/auth/auth.service';

describe('authRefreshInterceptor', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  let navigateSpy: any;

  const authService = {
    refresh: vi.fn(() => of(false)),
    loadCurrentUser: vi.fn(() => of(null)),
    clearCurrentUser: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authRefreshInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    authService.refresh.mockClear();
    authService.loadCurrentUser.mockClear();
    authService.clearCurrentUser.mockClear();
  });

  afterEach(() => httpMock.verify());

  function failWith401(url: string): void {
    TestBed.inject(HttpClient)
      .get(url)
      .subscribe({ error: () => undefined });

    httpMock
      .expectOne(url)
      .flush('no session', { status: 401, statusText: 'Unauthorized' });
  }

  it('never redirects for the session probe while no navigation is committed', () => {
    // Boot: the app initializer fires /v1/auth/profile before the router has
    // navigated, so `router.url` is still '/'. This is where
    // `/login?returnUrl=%2F` came from.
    failWith401('/v1/auth/profile');

    expect(authService.refresh).toHaveBeenCalledTimes(1);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('does not redirect when there is no committed url yet', () => {
    failWith401('/v1/events');

    expect(authService.clearCurrentUser).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('keeps the committed page as returnUrl when the refresh fails', () => {
    router.navigated = true;
    Object.defineProperty(router, 'url', { configurable: true, get: () => '/my-events' });

    failWith401('/v1/events');

    expect(String(navigateSpy.mock.calls[0][0])).toBe('/login?returnUrl=%2Fmy-events');
  });

  it('uses the in-flight navigation target as returnUrl', () => {
    vi.spyOn(router, 'getCurrentNavigation').mockReturnValue({
      extractedUrl: router.parseUrl('/photographer/7/photos'),
    } as any);

    failWith401('/v1/events');

    expect(String(navigateSpy.mock.calls[0][0])).toBe(
      '/login?returnUrl=%2Fphotographer%2F7%2Fphotos',
    );
  });

  it('does not rewrite an existing /login returnUrl (invitation switch account)', () => {
    router.navigated = true;
    Object.defineProperty(router, 'url', {
      configurable: true,
      get: () => '/login?returnUrl=%2Fphotographer%2F7%2Fphotos&email=a%40b.com',
    });

    failWith401('/v1/events');

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('redirects to a bare /login when the committed url is the home page', () => {
    router.navigated = true;
    Object.defineProperty(router, 'url', { configurable: true, get: () => '/' });

    failWith401('/v1/events');

    expect(String(navigateSpy.mock.calls[0][0])).toBe('/login');
  });

  it('retries the original request when the refresh succeeds', () => {
    authService.refresh.mockReturnValueOnce(of(true));
    authService.loadCurrentUser.mockReturnValueOnce(of({ id: 'u-1' } as any));

    let body: unknown;
    TestBed.inject(HttpClient)
      .get('/v1/events')
      .subscribe(value => (body = value));

    httpMock
      .expectOne('/v1/events')
      .flush('expired', { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/v1/events').flush({ ok: true });

    expect(body).toEqual({ ok: true });
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
