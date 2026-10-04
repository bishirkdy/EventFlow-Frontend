import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginDialogService {
  readonly isOpen = signal(false);

  private readonly pendingUrl = signal<string | null>(null);

  open(returnUrl?: string): void {
    this.pendingUrl.set(returnUrl ?? null);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  takeReturnUrl(): string | null {
    const url = this.pendingUrl();
    this.pendingUrl.set(null);
    return url;
  }
}
