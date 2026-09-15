import { Component, inject, signal } from '@angular/core';
import { CreateSessionRequest } from '../../../../../core/models/session/session.model';
import { SessionService } from '../../../../../core/services/session/session.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from 'express';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-session',
  imports: [FormsModule],
  templateUrl: './create-session.html',
  styleUrl: './create-session.css',
})
export class CreateSession {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);

  sectionId = '';
  title = '';
  description = '';
  sessionType = '';
  capacity = 0;

  loading = signal(false);
  error = signal<string | null>(null);

  create(): void {
    const eventId =
      this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    if (!this.sectionId.trim()) {
      this.error.set('Section ID is required.');
      return;
    }

    if (!this.title.trim()) {
      this.error.set('Session title is required.');
      return;
    }

    if (!this.sessionType.trim()) {
      this.error.set('Session type is required.');
      return;
    }

    if (this.capacity < 0) {
      this.error.set('Capacity cannot be negative.');
      return;
    }

    const request: CreateSessionRequest = {
      sectionId: this.sectionId.trim(),
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      sessionType: this.sessionType.trim(),
      capacity: this.capacity || undefined,
    };

    this.loading.set(true);
    this.error.set(null);

    this.sessionService.createSession(eventId, request).subscribe({
      next: () => {
        this.loading.set(false);

        this.router.navigate(['../../'], {
          relativeTo: this.route,
        });
      },

      error: error => {
        console.error('Failed to create session', error);
        this.error.set('Failed to create session.');
        this.loading.set(false);
      },
    });
  }
}
