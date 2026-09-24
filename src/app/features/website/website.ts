import { Component, inject, OnInit, signal } from '@angular/core';
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

  readonly data = signal<EventWebsiteData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pageSlug = signal<string | null>(null);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    this.pageSlug.set(this.route.snapshot.paramMap.get('slug'));

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.loadWebsite(eventId);
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
