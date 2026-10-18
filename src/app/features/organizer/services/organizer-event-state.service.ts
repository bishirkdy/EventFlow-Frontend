import { Injectable, signal } from '@angular/core';
import { Event } from '../../../core/models/event';

@Injectable({
  providedIn: 'root'
})
export class OrganizerEventStateService {
  eventId = signal<string | null>(null);
  event = signal<Event | null>(null);
  permissions = signal<ReadonlySet<string>>(new Set());

  setEventId(eventId: string): void {
    this.eventId.set(eventId);
  }
  setEvent(event: Event): void {
    this.event.set(event);
  }
  setPermissions(permissions: ReadonlySet<string>): void {
    this.permissions.set(permissions);
  }

  clear(): void {
    this.eventId.set(null);
    this.event.set(null);
    this.permissions.set(new Set());
  }
}
