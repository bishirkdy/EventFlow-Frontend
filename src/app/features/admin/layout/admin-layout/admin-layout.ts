import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Home, LucideAngularModule, Menu, X } from 'lucide-angular';
import { ADMIN_NAVIGATION } from '../../config/admin-navigation';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-layout.html'
})
export class AdminLayout {
  readonly navigation = ADMIN_NAVIGATION;
  readonly mobileMenuOpen = signal(false);

  readonly menuIcon = Menu;
  readonly closeIcon = X;
  readonly homeIcon = Home;

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
