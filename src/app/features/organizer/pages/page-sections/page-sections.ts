import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { NotificationService } from '../../../../core/services/ui/notification.service';

import { EventPageSectionService } from '../../../../core/services/event-page-section/event-page-section.service';
import { PageSectionModel } from '../../../../core/models/event-page-section';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { createAsyncAction } from 'core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-page-sections',
  standalone: true,
  imports: [CapitalizePipe, AsyncState],
  templateUrl: './page-sections.html',
  styleUrl: './page-sections.css',
})
export class PageSections implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);
  private readonly pageSectionService = inject(EventPageSectionService);

  readonly sections = signal<PageSectionModel[]>([]);

  private pageId = '';
  private eventId = '';

  private readonly loadAction = createAsyncAction(
    () => this.pageSectionService.getManageSections(this.pageId),
    {
      errorFallback: 'Failed to load page sections.',
      onSuccess: (response) => this.sections.set(response.data ?? []),
    },
  );

  private readonly moveAction = createAsyncAction(
    (ids: string[]) => this.pageSectionService.reorderSections(this.pageId, ids),
    {
      errorFallback: 'Failed to reorder page sections.',
      onSuccess: (response) => {
        this.toastr.success(response.message);
        this.loadSections();
      },
    },
  );

  private readonly deleteAction = createAsyncAction(
    (section: PageSectionModel) =>
      this.pageSectionService.deleteSection(this.pageId, section.id).pipe(
        map((response) => ({ sectionId: section.id, response })),
      ),
    {
      errorFallback: 'Failed to delete page section.',
      onSuccess: ({ sectionId, response }) => {
        this.sections.update((items) => items.filter((item) => item.id !== sectionId));
        this.toastr.success(response.message);
      },
    },
  );

  private readonly reorderAction = createAsyncAction(
    (ids: string[]) => this.pageSectionService.reorderSections(this.pageId, ids),
    {
      errorFallback: 'Failed to reorder page sections.',
      onError: () => this.loadSections(),
      onSuccess: (response) => this.toastr.success(response.message),
    },
  );

  loading = this.loadAction.pending;
  readonly error = this.loadAction.error;

  ngOnInit(): void {
    this.pageId = this.route.snapshot.paramMap.get('pageId') ?? '';
    this.eventId = this.findRouteParam('eventId');

    if (!this.pageId || !this.eventId) {
      this.toastr.error('Page information is missing.');
      return;
    }

    this.loadSections();
  }

  private findRouteParam(name: string): string {
    let current: ActivatedRoute | null = this.route;

    while (current) {
      const value = current.snapshot.paramMap.get(name);
      if (value) return value;
      current = current.parent;
    }

    return '';
  }

  loadSections(): void {
    this.loadAction.run();
  }

  createSection(): void {
    this.router.navigate(['/organizer', this.eventId, 'pages', this.pageId, 'sections', 'create']);
  }

  editSection(section: PageSectionModel): void {
    this.router.navigate([
      '/organizer', this.eventId, 'pages', this.pageId, 'sections', section.id, 'edit',
    ]);
  }

  moveSection(section: PageSectionModel, direction: -1 | 1): void {
    const current = [...this.sections()].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = current.findIndex((item) => item.id === section.id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= current.length) {
      return;
    }

    [current[index], current[target]] = [current[target], current[index]];

    this.moveAction.run(current.map((item) => item.id));
  }

  deleteSection(section: PageSectionModel): void {
    if (!confirm(`Delete "${section.title || section.sectionType}"?`)) return;

    this.deleteAction.run(section);
  }

  reorderSections(): void {
    const sectionIds = this.sections().map((section) => section.id);

    this.reorderAction.run(sectionIds);
  }
}
