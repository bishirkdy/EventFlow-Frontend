import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UpdateSessionModel } from '../../../../../core/models/session/update-session.model';
import { SessionService } from '../../../../../core/services/session/session.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-update-session',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './update-session.html',
  styleUrl: './update-session.css',
})
export class UpdateSession implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  eventId = '';
  sessionId = '';

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  session: UpdateSessionModel = {
    title: '',
    description: '',
    sessionType: '',
    capacity: null,
  };

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const sessionId = this.route.snapshot.paramMap.get('sessionId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    if (!sessionId) {
      this.error.set('Session ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventId = eventId;
    this.sessionId = sessionId;

    this.loadSession();
  }

  private loadSession(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sessionService.getSessionById(this.eventId, this.sessionId).subscribe({
      next: (response) => {
        const data = response.data;

        this.session = {
          title: data.title,
          description: data.description ?? '',
          sessionType: data.sessionType,
          capacity: data.capacity,
        };

        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load session:', error);

        this.error.set('Failed to load session.');
        this.loading.set(false);
      },
    });
  }

  updateSession(): void {
    this.error.set(null);

    if (!this.session.title.trim()) {
      this.error.set('Session title is required.');
      return;
    }

    if (!this.session.sessionType.trim()) {
      this.error.set('Session type is required.');
      return;
    }

    if (this.session.capacity != null && this.session.capacity < 1) {
      this.error.set('Capacity must be greater than 0.');
      return;
    }

    const request: UpdateSessionModel = {
      title: this.session.title.trim(),
      description: this.session.description?.trim() || undefined,
      sessionType: this.session.sessionType.trim(),
      capacity: this.session.capacity,
    };

    this.saving.set(true);

    this.sessionService.updateSession(this.eventId, this.sessionId, request).subscribe({
      next: () => {
        this.saving.set(false);

        this.toastr.success('Session updated successfully.');

        this.router.navigate(['/organizer', this.eventId, 'sessions', this.sessionId]);
      },

      error: (error: unknown) => {
        console.error('Failed to update session:', error);

        this.saving.set(false);
        this.error.set('Failed to update session.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventId, 'sessions', this.sessionId]);
  }
}
