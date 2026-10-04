import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { eventRoleGuard, UserRole } from './event-role.guard';
import { EventRoleService } from '../../services/event-role/event-role.service';
import { NotificationService } from '../../services/ui/notification.service';

describe('eventRoleGuard', () => {
  const eventId = 'event-1';

  function makeRoute(eventIdValue: string | null): any {
    return {
      paramMap: {
        get: (key: string) => (key === 'eventId' ? eventIdValue : null),
      },
      parent: null,
    };
  }

  async function executeGuard(requiredRole: UserRole, eventIdValue: string | null = eventId): Promise<any> {
    const result: any = TestBed.runInInjectionContext(() =>
      eventRoleGuard(requiredRole)(makeRoute(eventIdValue), {} as any),
    );
    if (result instanceof UrlTree || typeof result === 'boolean') return result;
    return await firstValueFrom(result as Observable<any>);
  }

  function setRoles(...roleNames: string[]) {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyRoles.mockReturnValue(
      of({
        isSuccess: true,
        statusCode: 200,
        message: 'ok',
        data: roleNames.map(roleName => ({ roleName })),
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
          useValue: { getMyRoles: vi.fn() },
        },
      ],
    });
  });

  it('redirects home when the event id is missing', async () => {
    const result = await executeGuard('Organizer', null);
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });

  it('allows the attendance staff role for attendance staff routes', async () => {
    setRoles('AttendanceStaff');
    expect(await executeGuard('AttendanceStaff')).toBe(true);
  });

  it('allows the owner for attendance staff routes', async () => {
    setRoles('Owner');
    expect(await executeGuard('AttendanceStaff')).toBe(true);
  });

  it('allows photographers on photographer routes', async () => {
    setRoles('Photographer');
    expect(await executeGuard('Photographer')).toBe(true);
  });

  it('allows organizers on organizer routes', async () => {
    setRoles('Organizer');
    expect(await executeGuard('Organizer')).toBe(true);
  });

  it('blocks mismatched roles with a redirect home', async () => {
    setRoles('Photographer');
    const result = await executeGuard('AttendanceStaff');
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });

  it('allows the owner on photographer routes', async () => {
    setRoles('Owner');
    expect(await executeGuard('Photographer')).toBe(true);
  });

  it('redirects home when the role lookup fails', async () => {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyRoles.mockReturnValue(throwError(() => new Error('boom')));
    const result = await executeGuard('Organizer');
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });

  it('sends expired sessions to login without an error toast', async () => {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyRoles.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 })),
    );
    const notification = TestBed.inject(NotificationService);
    const errorSpy = vi.spyOn(notification, 'error');

    const result = await executeGuard('Organizer');

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toContain('/login');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('redirects home with a clear message when the server forbids the role lookup', async () => {
    const spy = TestBed.inject(EventRoleService) as any;
    spy.getMyRoles.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403 })),
    );
    const notification = TestBed.inject(NotificationService);
    const errorSpy = vi.spyOn(notification, 'error');

    const result = await executeGuard('Organizer');

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
    expect(errorSpy).toHaveBeenCalledWith(
      "You don't have Organizer access for this event.",
    );
  });
});
