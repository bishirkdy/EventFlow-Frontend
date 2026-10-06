import { Injectable, signal } from '@angular/core';

// Central loading
@Injectable({ providedIn: 'root' })

export class LoadingService {
  private readonly activeRequests = signal(0);
  readonly loading = this.activeRequests.asReadonly();

  start(): void { this.activeRequests.update(v => v + 1); }
  stop(): void { this.activeRequests.update(v => Math.max(0, v - 1)); }
}
