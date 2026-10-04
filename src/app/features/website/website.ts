import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
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
  private readonly platformId = inject(PLATFORM_ID);

  readonly data = signal<EventWebsiteData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pageSlug = signal<string | null>(null);
  readonly preview = signal(false);

  private loadKey: string | null = null;
  private lastLoad: { eventId: string; preview: boolean } | null = null;

  ngOnInit(): void {
    // Follow the route params instead of reading them once, otherwise
    // moving from one page slug to another keeps showing the first page.
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, queryParams]) => {
        const eventId = params.get('eventId');
        this.pageSlug.set(params.get('slug'));

        const preview = queryParams.get('preview') === '1';
        this.preview.set(preview);

        if (!eventId) {
          this.error.set('Event ID not found.');
          this.loading.set(false);
          return;
        }

        const key = `${eventId}|${preview ? 'preview' : 'public'}`;
        if (key !== this.loadKey) {
          this.loadKey = key;
          this.lastLoad = { eventId, preview };
          this.loadWebsite(eventId, preview);
        }
      });
  }

  retry(): void {
    const last = this.lastLoad;
    if (last) this.loadWebsite(last.eventId, last.preview);
  }

  private loadWebsite(eventId: string, preview: boolean): void {
    this.loading.set(true);
    this.error.set(null);

    // The preview endpoints need the organizer's session cookie, which the
    // server never has, so preview data is only fetched in the browser.
    if (preview && isPlatformServer(this.platformId)) {
      return;
    }

    this.websiteService.load(eventId, preview).subscribe({
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
