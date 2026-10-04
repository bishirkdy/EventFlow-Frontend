import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { authGuard } from './auth-guard';
import { AuthService } from '../../services/auth/auth.service';

describe('authGuard', () => {
  const user = { id: 'u-1', email: 'user@example.com' } as any;

  interface AuthState {
    user?: typeof user | null;
    loadResult?: typeof user | null;
    loadError?: boolean;
  }

  function setup(state: AuthState) {
    const routerStub = {
      url: '/my-events',
      createUrlTree: vi.fn((commands: unknown[], extras?: unknown) => ({ commands, extras })),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Router, useValue: routerStub },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(state.user ?? null),
            loadCurrentUser: () =>
              state.loadError
                ? throwError(() => new Error('profile failed'))
                : of(state.loadResult ?? null),
          },
        },
      ],
    });

    return { routerStub };
  }

  const executeGuard = (): unknown =>
    TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

  it('lets a signed-in user through without a profile round-trip', () => {
    const { routerStub } = setup({ user });
    expect(executeGuard()).toBe(true);
    expect(routerStub.createUrlTree).not.toHaveBeenCalled();
  });

  it('restores the session on reload and allows the route', async () => {
    setup({ loadResult: user });
    const result = await firstValueFrom(executeGuard() as Observable<unknown>);
    expect(result).toBe(true);
  });

  it('redirects anonymous visitors to login with the deep link as returnUrl', async () => {
    const { routerStub } = setup({});
    const result = (await firstValueFrom(
      executeGuard() as Observable<unknown>,
    )) as { commands: string[]; extras: any };
    expect(result.commands).toEqual(['/login']);
    expect(result.extras.queryParams.returnUrl).toBe('/my-events');
    expect(routerStub.createUrlTree).toHaveBeenCalledTimes(1);
  });

  it('redirects to login with returnUrl when the profile lookup fails', async () => {
    setup({ loadError: true });
    const result = (await firstValueFrom(
      executeGuard() as Observable<unknown>,
    )) as { commands: string[]; extras: any };
    expect(result.commands).toEqual(['/login']);
    expect(result.extras.queryParams.returnUrl).toBe('/my-events');
  });
});
