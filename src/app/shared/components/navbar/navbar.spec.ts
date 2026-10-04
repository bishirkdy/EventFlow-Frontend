import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';
import { provideComponentTestProviders } from '../../../testing/component-providers';
import { LoginDialogService } from '../../../core/services/ui/login-dialog.service';

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
    expect(hrefs).not.toContain('/features');
    expect(hrefs).not.toContain('/about');
    expect(hrefs).not.toContain('/profile');
  });
});
