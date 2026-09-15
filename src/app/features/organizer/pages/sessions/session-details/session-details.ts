import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../../../core/services/session/session.service';
import { SessionModel } from '../../../../../core/models/session/session.model';

@Component({
  selector: 'app-session-details',
  imports: [],
  templateUrl: './session-details.html',
  styleUrl: './session-details.css',
})
export class SessionDetails {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);

  session = signal<SessionModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId =
      this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId');

    const sessionId = this.route.snapshot.paramMap.get('sessionId');

    if (!eventId || !sessionId) {
      this.error.set('Event ID or Session ID not found.');
      this.loading.set(false);
      return;
    }

    this.sessionService.getSessionById(eventId, sessionId).subscribe({
      next: response => {
        this.session.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load session', error);
        this.error.set('Failed to load session.');
        this.loading.set(false);
      },
    });
  }
}
