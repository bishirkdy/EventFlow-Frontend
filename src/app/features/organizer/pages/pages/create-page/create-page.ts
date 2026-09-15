import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { CreateEventPageRequest } from '../../../../../core/models/event-page/event-page.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-page',
  imports: [FormsModule],
  templateUrl: './create-page.html',
  styleUrl: './create-page.css',
})
export class CreatePage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventPageService = inject(EventPageService);

  name = '';
  slug = '';
  pageType = '';
  displayOrder = 0;

  loading = signal(false);
  error = signal<string | null>(null);

  create(): void {
    const eventId =
      this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    if (!this.name.trim()) {
      this.error.set('Page name is required.');
      return;
    }

    if (!this.slug.trim()) {
      this.error.set('Page slug is required.');
      return;
    }

    if (!this.pageType.trim()) {
      this.error.set('Page type is required.');
      return;
    }

    const request: CreateEventPageRequest = {
      name: this.name.trim(),
      slug: this.slug.trim(),
      pageType: this.pageType.trim(),
      displayOrder: this.displayOrder,
    };

    this.loading.set(true);
    this.error.set(null);

    this.eventPageService.createPage(eventId, request).subscribe({
      next: () => {
        this.loading.set(false);

        this.router.navigate(['../../'], {
          relativeTo: this.route,
        });
      },

      error: error => {
        console.error('Failed to create page', error);
        this.error.set('Failed to create page.');
        this.loading.set(false);
      },
    });
  }
}
