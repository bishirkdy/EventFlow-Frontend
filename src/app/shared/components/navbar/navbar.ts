import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu, X } from 'lucide-angular';
import { UserMenu, UserMenuLink } from '../user-menu/user-menu';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, UserMenu, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  isMenuOpen = signal(false);
  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser = this.authService.currentUser;

  // Only platform administrators see the console link.
  readonly isPlatformAdmin = this.authService.isPlatformAdmin;

  readonly menuIcon = Menu;
  readonly closeIcon = X;

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

  // Platform admins only get the console link; regular users get their pages.
  readonly userLinks = computed<UserMenuLink[]>(() => {
    if (this.isPlatformAdmin()) {
      return [{ label: 'Admin Console', url: '/admin' }];
    }

    return [
      { label: 'My Events', url: '/my-events' },
      { label: 'My Certificates', url: '/my-certificates' },
    ];
  });

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
