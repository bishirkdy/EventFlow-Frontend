import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventPageService } from '../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../core/models/event-page/event-page.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pages',
  imports: [],
  templateUrl: './pages.html',
  styleUrl: './pages.css',
})
export class Pages {
  private route = inject(ActivatedRoute);
  private eventPageService = inject(EventPageService);

  private toaster = inject(ToastrService);

  pages = signal<EventPageModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventPageService.getPages(eventId).subscribe({
      next: response => {
        this.pages.set(response.data);
        this.loading.set(false);
      },
      error: error => {
        console.error('Failed to load pages', error);
        this.error.set('Failed to load pages.');
        this.loading.set(false);
      },
    });
  }

  publishPage(page: EventPageModel): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.toaster.error('Event ID not found.');
      return;
    }

    this.eventPageService
      .publishPage(eventId, page.id)
      .subscribe({
        next: response => {
          this.pages.update(pages =>
            pages.map(item =>
              item.id === page.id ? response.data : item
            )
          );

          this.toaster.success('Page published successfully.');
        },
        error: error => {
          console.error('Failed to publish page', error);
          this.toaster.error('Failed to publish page.');
        },
      });
  }

  unpublishPage(page: EventPageModel): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.toaster.error('Event ID not found.');
      return;
    }

    this.eventPageService
      .unpublishPage(eventId, page.id)
      .subscribe({
        next: response => {
          this.pages.update(pages =>
            pages.map(item =>
              item.id === page.id ? response.data : item
            )
          );

          this.toaster.success('Page unpublished successfully.');
        },
        error: error => {
          console.error('Failed to unpublish page', error);
          this.toaster.error('Failed to unpublish page.');
        },
      });
  }

  deletePage(page: EventPageModel): void {
    const eventId =
      this.route.parent?.parent?.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.toaster.error('Event ID not found.');
      return;
    }

    this.eventPageService.deletePage(eventId, page.id).subscribe({
      next: () => {
        this.pages.update(pages =>
          pages.filter(item => item.id !== page.id)
        );

        this.toaster.success('Page deleted successfully.');
      },
      error: error => {
        console.error('Failed to delete page', error);
        this.toaster.error('Failed to delete page.');
      },
    });
  }
}
