import { Injectable, signal } from "@angular/core";
import { Event } from "../../../core/models/event/event.model";

@Injectable({
    providedIn: 'root',
})
export class OrganizerEventStateService {
    eventId = signal<string | null>(null);
    event = signal<Event | null>(null);

    setEventId(eventId: string): void {
        this.eventId.set(eventId);
    }
    setEvent(event: Event): void {
        this.event.set(event);
    }

    clear(): void {
        this.eventId.set(null);
        this.event.set(null);
    }

}