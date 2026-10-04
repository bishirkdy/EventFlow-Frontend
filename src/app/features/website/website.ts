import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { WebsiteTemplateSelector } from './components/website-template-selector/website-template-selector';
import { EventWebsiteService } from '../../core/services/website/event-website.service';
import { EventWebsiteData } from '../../core/models/website/event-website-data.model';

@Component({
  selector: 'app-website',
  standalone: true,
  imports: [WebsiteTemplateSelector],
  templateUrl: './website.html',
  styleUrl: './website.css',
})

export class Website implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly websiteService = inject(EventWebsiteService);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = signal<EventWebsiteData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pageSlug = signal<string | null>(null);

  private loadedEventId: string | null = null;

  ngOnInit(): void {
    // Follow the route params instead of reading them once, otherwise
    // moving from one page slug to another keeps showing the first page.
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const eventId = params.get('eventId');
        this.pageSlug.set(params.get('slug'));

        if (!eventId) {
          this.error.set('Event ID not found.');
          this.loading.set(false);
          return;
        }

        if (eventId !== this.loadedEventId) {
          this.loadedEventId = eventId;
          this.loadWebsite(eventId);
        }
      });
  }

  retry(): void {
    const eventId = this.loadedEventId;
    if (eventId) this.loadWebsite(eventId);
  }

  private loadWebsite(eventId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.websiteService.load(eventId).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load event website:', error);
        this.error.set('Failed to load event website.');
        this.loading.set(false);
      },
    });
  }
}
