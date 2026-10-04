import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event/event.service';
import { EventRoleService } from '../../../core/services/event-role/event-role.service';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { Event } from '../../../core/models/event/event.model';

@Component({
  selector: 'app-my-events',
  imports: [DatePipe, RouterLink],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css',
})
export class MyEvents {
  events = signal<Event[]>([]);
  loading = signal(true);
  private eventService = inject(EventService);
  private roleService = inject(EventRoleService);
  private router = inject(Router);
  private toastr = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  publishing = signal<string | null>(null);


  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadEvents();
  }

  openEvent(event: Event): void {
    this.roleService.getMyRoles(event.id).subscribe({
      next: (response) => {
        const roles = (response.data ?? []).map(r => r.roleName.toLowerCase());

        if (roles.includes('owner')) {
          void this.router.navigate(['/owner', event.id]);
        } else if (roles.includes('attendancestaff')) {
          void this.router.navigate(['/attendance-staff', event.id]);
        } else if (roles.includes('photographer')) {
          void this.router.navigate(['/photographer', event.id, 'photos']);
        } else if (roles.includes('organizer')) {
          void this.router.navigate(['/organizer', event.id, 'overview']);
        } else if (roles.length > 0) {
          // Participant-only membership: open the public event site instead of
          // guessing a staff workspace the role guard would reject.
          void this.router.navigate(['/events', event.id]);
        } else {
          this.toastr.error("You don't have access to this event's workspace.");
        }
      },
      error: () => {
        this.toastr.error("Couldn't open this event. Check your connection and try again.");
      },
    });
  }

  publishEvent(event: Event): void {
    if (event.status !== 'Draft' || this.publishing()) return;
    this.publishing.set(event.id);
    this.eventService.publishEvent(event.id).subscribe({
      next: () => {
        this.publishing.set(null);
        this.events.update(items => items.map(item => item.id === event.id ? { ...item, status: 'Published' } : item));
      },
      error: (error: unknown) => {
        console.error('Failed to publish event', error);
        this.publishing.set(null);
      },
    });
  }

  private loadEvents(): void {
    this.loading.set(true);
    this.eventService.getMyEvents().subscribe({
      next: (response) => {
        const events = response.data;
        this.events.set(events ?? []);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load events', error);
        this.loading.set(false);
      },
    });
  }
}