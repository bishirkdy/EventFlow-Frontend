import { computed, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { platformAdminGuard } from './platform-admin.guard';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/ui/notification.service';
import { UserProfile } from '../../models/auth';

describe('platformAdminGuard', () => {
  let currentUser: WritableSignal<UserProfile | null>;
  let loadCurrentUser: ReturnType<typeof vi.fn>;

  function setup(initialUser: UserProfile | null, failProbe = false) {
    currentUser = signal<UserProfile | null>(initialUser);
    loadCurrentUser = vi.fn(() =>
      failProbe ? throwError(() => new Error('unauthorized')) : of(currentUser()),
    );

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser,
            isPlatformAdmin: computed(() => currentUser()?.isPlatformAdmin === true),
            loadCurrentUser,
          },
        },
      ],
    });
  }

  async function run(): Promise<any> {
    const result = TestBed.runInInjectionContext(() =>
      platformAdminGuard({} as never, { url: '/admin/dashboard' } as never),
    );

    if (result instanceof UrlTree || typeof result === 'boolean') {
      return result;
    }

    return await firstValueFrom(result as Observable<unknown>);
  }

  it('allows a cached platform administrator', async () => {
    setup({ id: '1', userName: 'admin', email: 'a@b.c', firstName: 'A', lastName: 'B', isPlatformAdmin: true });

    expect(await run()).toBe(true);
    expect(loadCurrentUser).not.toHaveBeenCalled();
  });

  it('blocks a signed-in non-admin and redirects home', async () => {
    setup({ id: '2', userName: 'user', email: 'u@b.c', firstName: 'U', lastName: 'B', isPlatformAdmin: false });
    const notification = TestBed.inject(NotificationService);
    const errorSpy = vi.spyOn(notification, 'error');

    const result = await run();

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
    expect(errorSpy).toHaveBeenCalled();
  });

  it('loads the profile when none is cached and allows an administrator', async () => {
    setup(null);
    loadCurrentUser.mockReturnValue(
      of({ id: '1', userName: 'admin', email: 'a@b.c', firstName: 'A', lastName: 'B', isPlatformAdmin: true }),
    );

    expect(await run()).toBe(true);
    expect(loadCurrentUser).toHaveBeenCalled();
  });

  it('redirects to login when the profile probe fails', async () => {
    setup(null, true);

    const result = await run();

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toContain('/login');
  });
});
