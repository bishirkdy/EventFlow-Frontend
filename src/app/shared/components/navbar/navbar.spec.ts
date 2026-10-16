import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';
import { provideComponentTestProviders } from '../../../testing/component-providers';
import { LoginDialogService } from '../../../core/services/ui/login-dialog.service';
import { AuthService } from '../../../core/services/auth/auth.service';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: provideComponentTestProviders(),
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the login popup from the sign in button', () => {
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    );
    const signIn = buttons.find(button => button.textContent?.trim() === 'Sign in');

    expect(signIn).toBeTruthy();
    signIn!.click();
    fixture.detectChanges();

    expect(TestBed.inject(LoginDialogService).isOpen()).toBe(true);
  });

  it('links to the real pages instead of the removed dead ones', () => {
    const hrefs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('a'),
    ).map(anchor => anchor.getAttribute('href'));

    expect(hrefs).toContain('/events');
    expect(hrefs).toContain('/about');
    expect(hrefs).toContain('/features');
    expect(hrefs).not.toContain('/profile');
  });

  it('gives platform admins the console link instead of my pages', () => {
    TestBed.inject(AuthService).currentUser.set({
      id: 'u-1',
      userName: 'admin',
      email: 'admin@example.com',
      firstName: 'Ada',
      lastName: 'Admin',
      isPlatformAdmin: true,
    });

    expect(component.userLinks().map((link) => link.label)).toEqual(['Admin Console']);
  });

  it('gives regular users their events and certificate pages', () => {
    TestBed.inject(AuthService).currentUser.set({
      id: 'u-2',
      userName: 'jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      isPlatformAdmin: false,
    });

    expect(component.userLinks().map((link) => link.label)).toEqual([
      'My Events',
      'My Certificates',
    ]);
  });
});
