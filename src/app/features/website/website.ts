import { Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, EMPTY, of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { WebsiteTemplateSelector } from './components/website-template-selector/website-template-selector';
import { EventWebsiteService } from '../../core/services/website/event-website.service';
import { EventWebsiteData } from '../../core/models/website';
import { createRawAsyncState } from 'core/state';

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

  private lastLoad: { eventId: string; preview: boolean } | null = null;
  private loadKey: string | null = null;

  private readonly websiteState = createRawAsyncState<EventWebsiteData>(
    () => {
      const last = this.lastLoad;
      if (!last) return EMPTY;
      // The preview endpoints need the organizer's session cookie, which the
      // server never has, so preview data is only fetched in the browser.
      if (last.preview && isPlatformServer(this.platformId)) return EMPTY;
      return this.websiteService.load(last.eventId, last.preview).pipe(
        catchError((requestError: unknown) => {
          // A 404 on the public site means the event is not published yet.
          if (
            !last.preview &&
            requestError instanceof HttpErrorResponse &&
            requestError.status === 404
          ) {
            this.notPublished.set(true);
            return of(null as unknown as EventWebsiteData);
          }
          return throwError(() => requestError);
        }),
      );
    },
    { errorFallback: 'Failed to load event website.' },
  );

  private readonly routeError = signal<string | null>(null);

  readonly data = this.websiteState.data;
  readonly loading = this.websiteState.loading;
  readonly error = computed<string | null>(
    () => this.routeError() ?? this.websiteState.error(),
  );
  readonly pageSlug = signal<string | null>(null);
  readonly preview = signal(false);
  readonly notPublished = signal(false);

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
          this.routeError.set('Event ID not found.');
          return;
        }

        this.routeError.set(null);

        const key = `${eventId}|${preview ? 'preview' : 'public'}`;
        if (key !== this.loadKey) {
          this.loadKey = key;
          this.loadWebsite(eventId, preview);
        }
      });
  }

  retry(): void {
    if (this.lastLoad) {
      this.notPublished.set(false);
      this.websiteState.load();
    }
  }

  private loadWebsite(eventId: string, preview: boolean): void {
    this.lastLoad = { eventId, preview };
    this.notPublished.set(false);
    this.websiteState.load();
  }
}
