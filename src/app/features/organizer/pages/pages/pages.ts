import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';

import { EventPageService } from '../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../core/models/event-page/event-page.model';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-pages',
  standalone: true,
  templateUrl: './pages.html',
  styleUrl: './pages.css',
})
export class Pages implements OnInit {
  private readonly pageService = inject(EventPageService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);

  readonly pages = signal<EventPageModel[]>([]);
  readonly loading = signal(false);

  readonly eventId = this.eventState.eventId;

  ngOnInit(): void {
    this.loadPages();
  }

  loadPages(): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.toastr.error('Event not found.');
      return;
    }

    this.loading.set(true);

    this.pageService.getPages(eventId).subscribe({
      next: (response) => {
        this.pages.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load event pages.');
      },
    });
  }

  createPage(): void {
    this.router.navigate(['/organizer', this.eventId(), 'pages', 'create']);
  }

  publishPage(page: EventPageModel): void {
    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.pageService.publishPage(eventId, page.id).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.loadPages();
      },
      error: () => {
        this.toastr.error('Failed to publish page.');
      },
    });
  }

  unpublishPage(page: EventPageModel): void {
    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.pageService.unpublishPage(eventId, page.id).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.loadPages();
      },
      error: () => {
        this.toastr.error('Failed to unpublish page.');
      },
    });
  }

  movePage(page: EventPageModel, direction: -1 | 1): void {
    const current = [...this.pages()].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = current.findIndex((item) => item.id === page.id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= current.length) {
      return;
    }

    [current[index], current[target]] = [current[target], current[index]];

    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.pageService.reorderPages(
      eventId,
      current.map((item) => item.id),
    ).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.loadPages();
      },
      error: () => this.toastr.error('Failed to reorder event pages.'),
    });
  }

  deletePage(page: EventPageModel): void {
    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${page.name}"?`);

    if (!confirmed) {
      return;
    }

    this.pageService.deletePage(eventId, page.id).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.loadPages();
      },
      error: () => {
        this.toastr.error('Failed to delete page.');
      },
    });
  }

  trackById(_: number, page: EventPageModel): string {
    return page.id;
  }

  editPage(page: EventPageModel): void {
    this.router.navigate(['/organizer', this.eventId(), 'pages', page.id, 'edit']);
  }

  pageDetails(page: EventPageModel): void {
    this.router.navigate(['/organizer', this.eventId(), 'pages', page.id]);
  }
}
