import { Injectable, signal } from '@angular/core';

/** Central request counter. Local buttons still own their own busy state. */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);
  readonly loading = this.activeRequests.asReadonly();

  start(): void { this.activeRequests.update(v => v + 1); }
  stop(): void { this.activeRequests.update(v => Math.max(0, v - 1)); }
}
