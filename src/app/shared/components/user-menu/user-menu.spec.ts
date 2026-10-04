import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { UserMenu } from './user-menu';
import { provideComponentTestProviders } from '../../../testing/component-providers';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginDialogService } from '../../../core/services/ui/login-dialog.service';

describe('UserMenu', () => {
  let fixture: ComponentFixture<UserMenu>;
  let component: UserMenu;

  const authService = {
    currentUser: signal<any>(null),
    logout: vi.fn(() => of({})),
    clearCurrentUser: vi.fn(),
  };

  function rootText(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function signInButton(): HTMLButtonElement | null {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    );
    return buttons.find(button => button.textContent?.trim() === 'Sign in') ?? null;
  }

  async function setup(): Promise<void> {
    authService.currentUser.set(null);
    authService.logout.mockClear();

    await TestBed.configureTestingModule({
      imports: [UserMenu],
      providers: [
        ...provideComponentTestProviders(),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('shows a sign in button for anonymous visitors', async () => {
    await setup();

    expect(signInButton()).toBeTruthy();
    expect(rootText()).not.toContain('My Events');
  });

  it('opens the login dialog when sign in is clicked', async () => {
    await setup();

    signInButton()!.click();
    fixture.detectChanges();

    expect(TestBed.inject(LoginDialogService).isOpen()).toBe(true);
  });

  it('shows the avatar with initials for a signed in user', async () => {
    await setup();
    authService.currentUser.set({
      id: 'u-1',
      userName: 'jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    fixture.detectChanges();

    expect(rootText()).toContain('JD');
    expect(signInButton()).toBeNull();
  });

  it('lists My Events and the extra event links in the menu', async () => {
    await setup();
    authService.currentUser.set({
      id: 'u-1',
      userName: 'jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    component = fixture.componentInstance;
    fixture.componentRef.setInput('links', [
      { label: 'Certificate', url: '/events/evt-1/certificates' },
    ]);
    fixture.detectChanges();

    const avatar = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-haspopup="menu"]',
    ) as HTMLButtonElement;
    avatar.click();
    fixture.detectChanges();

    expect(rootText()).toContain('My Events');
    expect(rootText()).toContain('Certificate');
    expect(rootText()).toContain('Sign out');
  });
});
