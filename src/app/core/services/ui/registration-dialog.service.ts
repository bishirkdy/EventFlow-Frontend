import { Injectable, signal } from '@angular/core';
import { RegistrationScope } from '../../models/registration';

export interface RegistrationDialogConfig {
  eventId: string;
  scopeType: RegistrationScope;
  scopeId: string | null;
  contextTitle?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationDialogService {
  readonly isOpen = signal(false);
  readonly config = signal<RegistrationDialogConfig | null>(null);

  open(config: RegistrationDialogConfig): void {
    this.config.set(config);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
