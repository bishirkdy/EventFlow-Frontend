import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../../core/services/session/session.service';
import { SessionModel } from '../../../../core/models/session/session.model';

@Component({
  selector: 'app-sessions',
  imports: [],
  templateUrl: './sessions.html',
  styleUrl: './sessions.css',
})
export class Sessions {
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);

  sessions = signal<SessionModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId = this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.sessionService.getSessions(eventId).subscribe({
      next: response => {
        this.sessions.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load sessions', error);
        this.error.set('Failed to load sessions.');
        this.loading.set(false);
      },
    });
  }
}
