import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Login } from './login';
import { provideComponentTestProviders } from '../../../testing/component-providers';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { of } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Login returnUrl round-trip', () => {
  let component: Login;
  let router: Router;

  const authService = { login: vi.fn(() => of({ id: 'u-1' })) };
  const toastr = { success: vi.fn(), error: vi.fn() };
  const validForm = { invalid: false, control: { markAllAsTouched: vi.fn() } } as any;

  async function setup(queryParams: Record<string, string>): Promise<void> {
    authService.login.mockClear();
    toastr.success.mockClear();
    toastr.error.mockClear();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        ...provideComponentTestProviders({}, queryParams),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: toastr },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    const fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    component.email = 'user@example.com';
    component.password = 'secret';
    await fixture.whenStable();
  }

  it('returns to the guarded deep link after a successful login', async () => {
    await setup({ returnUrl: '/my-events' });

    component.login(validForm);

    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/my-events');
  });

  it('lands on the home page when no returnUrl was preserved', async () => {
    await setup({});

    component.login(validForm);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('ignores an absolute external returnUrl (open-redirect protection)', async () => {
    await setup({ returnUrl: 'https://evil.example.com/phish' });

    component.login(validForm);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('ignores a protocol-relative returnUrl (open-redirect protection)', async () => {
    await setup({ returnUrl: '//evil.example.com' });

    component.login(validForm);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
