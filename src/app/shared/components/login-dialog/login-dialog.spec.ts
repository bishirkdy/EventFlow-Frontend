import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginDialog } from './login-dialog';
import { provideComponentTestProviders } from '../../../testing/component-providers';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginDialogService } from '../../../core/services/ui/login-dialog.service';
import { NotificationService } from '../../../core/services/ui/notification.service';

describe('LoginDialog', () => {
  let fixture: ComponentFixture<LoginDialog>;
  let component: LoginDialog;

  const authService = { login: vi.fn() };
  const toastr = { success: vi.fn(), error: vi.fn() };
  const validForm = { invalid: false, control: { markAllAsTouched: vi.fn() } } as any;

  function dialogElement(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]');
  }

  beforeEach(async () => {
    authService.login.mockReset();
    authService.login.mockReturnValue(of({ id: 'u-1' }));
    toastr.success.mockClear();
    toastr.error.mockClear();

    await TestBed.configureTestingModule({
      imports: [LoginDialog],
      providers: [
        ...provideComponentTestProviders(),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: toastr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('stays hidden until the service opens it', () => {
    fixture.detectChanges();
    expect(dialogElement()).toBeNull();
  });

  it('renders the dialog after the service opens it', () => {
    TestBed.inject(LoginDialogService).open();
    fixture.detectChanges();

    expect(dialogElement()).toBeTruthy();
    expect(dialogElement()!.textContent).toContain('Sign in to EventFlow');
  });

  it('signs in, toasts and closes on success', () => {
    TestBed.inject(LoginDialogService).open();
    component.email = 'user@example.com';
    component.password = 'secret';

    component.submit(validForm);

    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(LoginDialogService).isOpen()).toBe(false);
  });

  it('returns to the guarded page after signing in from the dialog', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    TestBed.inject(LoginDialogService).open('/events/evt-1/register');
    component.email = 'user@example.com';
    component.password = 'secret';

    component.submit(validForm);

    expect(navigate).toHaveBeenCalledWith('/events/evt-1/register');
    expect(TestBed.inject(LoginDialogService).isOpen()).toBe(false);
  });

  it('does not call the api when the form is invalid', () => {
    const invalidForm = { invalid: true, control: { markAllAsTouched: vi.fn() } } as any;

    component.submit(invalidForm);

    expect(authService.login).not.toHaveBeenCalled();
    expect(invalidForm.control.markAllAsTouched).toHaveBeenCalled();
  });

  it('shows an error toast and keeps the dialog open when login fails', () => {
    authService.login.mockReturnValue(
      throwError(() => Object.assign(new Error('bad credentials'), { status: 401 })),
    );
    TestBed.inject(LoginDialogService).open();
    component.email = 'user@example.com';
    component.password = 'wrong';

    component.submit(validForm);

    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(LoginDialogService).isOpen()).toBe(true);
  });
});
