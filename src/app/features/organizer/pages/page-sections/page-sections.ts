import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { EventPageSectionService } from '../../../../core/services/event-page-section/event-page-section.service';
import { PageSectionModel } from '../../../../core/models/event-page-section/PageSectionModel';

@Component({
  selector: 'app-page-sections',
  standalone: true,
  templateUrl: './page-sections.html',
  styleUrl: './page-sections.css',
})
export class PageSections implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly pageSectionService = inject(EventPageSectionService);

  readonly sections = signal<PageSectionModel[]>([]);
  readonly loading = signal(false);

  private pageId = '';
  private eventId = '';

  ngOnInit(): void {
    this.pageId = this.route.snapshot.paramMap.get('pageId') ?? '';
    this.eventId = this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId') ?? '';

    if (!this.pageId || !this.eventId) {
      this.toastr.error('Page information is missing.');
      return;
    }

    this.loadSections();
  }

  loadSections(): void {
    this.loading.set(true);

    this.pageSectionService.getSections(this.pageId).subscribe({
      next: (response) => {
        this.sections.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load page sections.');
      },
    });
  }

  createSection(): void {
    this.router.navigate(['/organizer', this.eventId, 'pages', this.pageId, 'sections', 'create']);
  }

  editSection(section: PageSectionModel): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'pages',
      this.pageId,
      'sections',
      section.id,
      'edit',
    ]);
  }

  deleteSection(section: PageSectionModel): void {
    if (!confirm(`Delete "${section.title || section.sectionType}"?`)) {
      return;
    }

    this.pageSectionService.deleteSection(this.pageId, section.id).subscribe({
      next: () => {
        this.sections.update((sections) => sections.filter((item) => item.id !== section.id));
        this.toastr.success('Page section deleted successfully.');
      },
      error: () => {
        this.toastr.error('Failed to delete page section.');
      },
    });
  }

  reorderSections(): void {
    const sectionIds = this.sections().map((section) => section.id);

    this.pageSectionService.reorderSections(this.pageId, sectionIds).subscribe({
      next: () => {
        this.toastr.success('Page sections reordered successfully.');
      },
      error: () => {
        this.toastr.error('Failed to reorder page sections.');

        this.loadSections();
      },
    });
  }
}
