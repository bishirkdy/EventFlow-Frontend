import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, timeout } from 'rxjs';
import { Button } from '../../../../shared/components/button/button';
import { CapitalizePipe } from '../../../../shared/components/pipes/capitalize.pipe';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { EventService } from '../../../../core/services/event/event.service';
import { Event as EventModel, PublicEventStats } from '../../../../core/models/event';
import { createRawAsyncState } from '../../../../core/state';

@Component({
  selector: 'app-hero',
  imports: [Button, RouterLink, CapitalizePipe],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly eventService = inject(EventService);

  currentUser = this.authService.currentUser;

  private readonly featuredState = createRawAsyncState<EventModel | null>(
    () =>
      this.eventService
        .getPublicEvents(1)
        .pipe(
          timeout(8000),
          map((response) => response.data?.[0] ?? null)
        ),
    { initial: null }
  );

  private readonly statsState = createRawAsyncState<PublicEventStats>(
    () =>
      this.eventService
        .getPublicEventStats()
        .pipe(
          timeout(8000),
          map(
            (response) =>
              response.data ?? { publishedEvents: 0, participants: 0 }
          )
        ),
    { initial: { publishedEvents: 0, participants: 0 } }
  );

  readonly featuredEvent = this.featuredState.data;
  readonly stats = this.statsState.data;

  ngOnInit(): void {
    this.featuredState.load();
    this.statsState.load();
  }

  formatDate(date: string, timeZone?: string): string {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return date;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(timeZone ? { timeZone } : {})
    }).format(value);
  }
}
