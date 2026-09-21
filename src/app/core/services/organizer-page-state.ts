import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrganizerPageStateService {
  readonly pageId = signal<string | null>(null);

  setPageId(pageId: string): void {
    this.pageId.set(pageId);
  }

  clearPageId(): void {
    this.pageId.set(null);
  }
}