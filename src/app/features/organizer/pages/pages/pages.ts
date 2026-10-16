import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/ui/notification.service';

import { EventPageService } from '../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../core/models/event-page';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CapitalizePipe],
  templateUrl: './pages.html',
  styleUrl: './pages.css',
})
export class Pages implements OnInit {
  private readonly pageService = inject(EventPageService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);

  readonly pages = signal<EventPageModel[]>([]);

  readonly eventId = this.eventState.eventId;

  private readonly loadAction = createAsyncAction(
    (eventId: string) => this.pageService.getManagePages(eventId),
    {
      toastErrors: true,
      errorFallback: 'Failed to load event pages.',
      onSuccess: (response) => this.pages.set(response.data ?? []),
    },
  );

  private readonly publishAction = createAsyncAction(
    (eventId: string, pageId: string) => this.pageService.publishPage(eventId, pageId),
    {
      errorFallback: 'Failed to publish page.',
      onSuccess: (response) => {
        this.toastr.success(response.message);
        this.loadPages();
      },
    },
  );

  private readonly unpublishAction = createAsyncAction(
    (eventId: string, pageId: string) => this.pageService.unpublishPage(eventId, pageId),
    {
      errorFallback: 'Failed to unpublish page.',
      onSuccess: (response) => {
        this.toastr.success(response.message);
        this.loadPages();
      },
    },
  );

  private readonly reorderAction = createAsyncAction(
    (eventId: string, ids: string[]) => this.pageService.reorderPages(eventId, ids),
    {
      errorFallback: 'Failed to reorder event pages.',
      onSuccess: (response) => {
        this.toastr.success(response.message);
        this.loadPages();
      },
    },
  );

  private readonly deleteAction = createAsyncAction(
    (eventId: string, pageId: string) => this.pageService.deletePage(eventId, pageId),
    {
      errorFallback: 'Failed to delete page.',
      onSuccess: (response) => {
        this.toastr.success(response.message);
        this.loadPages();
      },
    },
  );

  loading = this.loadAction.pending;

  ngOnInit(): void {
    this.loadPages();
  }

  loadPages(): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.toastr.error('Event not found.');
      return;
    }

    this.loadAction.run(eventId);
  }

  createPage(): void {
    this.router.navigate(['/organizer', this.eventId(), 'pages', 'create']);
  }

  publishPage(page: EventPageModel): void {
    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.publishAction.run(eventId, page.id);
  }

  unpublishPage(page: EventPageModel): void {
    const eventId = this.eventId();

    if (!eventId) {
      return;
    }

    this.unpublishAction.run(eventId, page.id);
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

    this.reorderAction.run(
      eventId,
      current.map((item) => item.id),
    );
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

    this.deleteAction.run(eventId, page.id);
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
