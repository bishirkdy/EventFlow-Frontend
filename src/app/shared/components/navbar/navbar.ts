import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserMenu, UserMenuLink } from '../user-menu/user-menu';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, UserMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  isMenuOpen = signal(false);
  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser = this.authService.currentUser;

  private readonly logoutAction = createAsyncAction(() => this.authService.logout(), {
    onSettled: () => {
      this.authService.clearCurrentUser();
      void this.router.navigate(['/']);
    },
  });

  readonly navLinks: { label: string; url: string }[] = [
    { label: 'Events', url: '/events' },
    { label: 'About', url: '/about' },
    { label: 'Features', url: '/features' },
    { label: 'Event Setup', url: '/event-setup' },
    { label: 'Contact', url: '/contact' },
  ];

  readonly userLinks: UserMenuLink[] = [
    { label: 'My Certificates', url: '/my-certificates' },
  ];

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.logoutAction.run();
  }
}
