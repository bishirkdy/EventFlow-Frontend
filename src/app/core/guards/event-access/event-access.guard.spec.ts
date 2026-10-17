import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { eventAccessGuard, EventAccessRequirement } from './event-access.guard';
import { EventRoleService } from '../../services/event-role/event-role.service';
import { NotificationService } from '../../services/ui/notification.service';

describe('eventAccessGuard', () => {
  const eventId = 'event-1';

  function makeRoute(eventIdValue: string | null): any {
    return {
      paramMap: {
        get: (key: string) => (key === 'eventId' ? eventIdValue : null),
      },
      parent: null,
    };
  }

  async function executeGuard(
    requirement: EventAccessRequirement,
    eventIdValue: string | null = eventId,
    state: any = {},
  ): Promise<any> {
    const result: any = TestBed.runInInjectionContext(() =>
      eventAccessGuard(requirement)(makeRoute(eventIdValue), state),
    );
    if (result instanceof UrlTree || typeof result === 'boolean') return result;
    return await firstValueFrom(result as Observable<any>);
  }

  function setAccess(access: { roles?: string[]; permissions?: string[] }) {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyPermissions.mockReturnValue(
      of({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: { roles: access.roles ?? [], permissions: access.permissions ?? [] },
      }),
    );
    return spy;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: EventRoleService,
          useValue: { getMyPermissions: vi.fn() },
        },
      ],
    });
  });

  it('redirects home when the event id is missing', async () => {
    const result = await executeGuard({ permissions: ['event.update'] }, null);
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });

  it('allows a matching permission', async () => {
    setAccess({ permissions: ['event.update'] });
    expect(await executeGuard({ permissions: ['event.update'] })).toBe(true);
  });

  it('allows a matching role when no permission is unique', async () => {
    setAccess({ roles: ['AttendanceStaff'] });
    expect(await executeGuard({ roles: ['AttendanceStaff'] })).toBe(true);
  });

  it('allows when one of several permissions matches', async () => {
    setAccess({ permissions: ['photo.upload'] });
    expect(await executeGuard({ permissions: ['photo.view', 'photo.upload'] })).toBe(true);
  });

  it('blocks mismatched access with a redirect home', async () => {
    setAccess({ roles: ['Photographer'], permissions: ['photo.upload'] });
    const result = await executeGuard({ permissions: ['event.update'] });
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });

  it('does not treat the owner as a super-role', async () => {
    setAccess({ roles: ['Owner'], permissions: ['event.view', 'event.team.manage'] });
    const result = await executeGuard({ permissions: ['event.update'] });
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });

  it('redirects home when the access lookup fails', async () => {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyPermissions.mockReturnValue(throwError(() => new Error('boom')));
    const result = await executeGuard({ permissions: ['event.update'] });
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });

  it('sends expired sessions to login without an error toast', async () => {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyPermissions.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const notification = TestBed.inject(NotificationService);
    const errorSpy = vi.spyOn(notification, 'error');

    const result = await executeGuard({ permissions: ['event.update'] });

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toContain('/login');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('uses the url being activated as the login returnUrl', async () => {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyPermissions.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

    const result = await executeGuard({ permissions: ['photo.upload'] }, eventId, {
      url: '/photographer/7/photos',
    });

    expect(result.toString()).toBe('/login?returnUrl=%2Fphotographer%2F7%2Fphotos');
  });

  it('redirects home with a clear message when the server forbids the lookup', async () => {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyPermissions.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    const notification = TestBed.inject(NotificationService);
    const errorSpy = vi.spyOn(notification, 'error');

    const result = await executeGuard({ permissions: ['event.update'] });

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
    expect(errorSpy).toHaveBeenCalledWith("You don't have access to this event workspace.");
  });
});
