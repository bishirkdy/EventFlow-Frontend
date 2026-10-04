import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { UserMenu } from '../user-menu/user-menu';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, UserMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  isMenuOpen = signal(false);
  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser = this.authService.currentUser;

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearCurrentUser();
        this.router.navigate(['/']);
      },

      error: (err) => {
        console.error('Logout failed:', err);

        // Clear local state even if server request fails
        this.authService.clearCurrentUser();
        this.router.navigate(['/']);
      },
    });
  }


}
