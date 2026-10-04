import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginDialogService } from '../../../core/services/ui/login-dialog.service';

export interface UserMenuLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-user-menu',
  imports: [RouterLink],
  templateUrl: './user-menu.html',
})
export class UserMenu {
  readonly links = input<UserMenuLink[]>([]);

  private readonly authService = inject(AuthService);
  readonly loginDialog = inject(LoginDialogService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef);

  readonly isOpen = signal(false);
  readonly user = this.authService.currentUser;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update(value => !value);
  }

  signIn(): void {
    this.isOpen.set(false);
    this.loginDialog.open();
  }

  signOut(): void {
    this.isOpen.set(false);
    this.authService.logout().subscribe({
      error: () => this.authService.clearCurrentUser(),
    });
    void this.router.navigateByUrl('/');
  }

  get initials(): string {
    const user = this.user();
    if (!user) return '';
    const first = user.firstName?.trim()?.charAt(0) ?? '';
    const last = user.lastName?.trim()?.charAt(0) ?? '';
    const fallback = (user.userName || user.email || '?').charAt(0);
    return (first || last ? first + last : fallback).toUpperCase();
  }

  get displayName(): string {
    const user = this.user();
    if (!user) return '';
    const full = [user.firstName, user.lastName]
      .map(value => value?.trim())
      .filter(Boolean)
      .join(' ');
    return full || user.userName || user.email;
  }
}
