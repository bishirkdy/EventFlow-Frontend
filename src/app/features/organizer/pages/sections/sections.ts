import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { SectionModel } from '../../../../core/models/section/section.model';
import { SectionService } from '../../../../core/services/section/section.service';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [],
  templateUrl: './sections.html',
  styleUrl: './sections.css',
})
export class Sections implements OnInit {
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  sections = signal<SectionModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  deleting = signal<string | null>(null);

  private eventId = '';

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventId = eventId;
    this.loadSections();
  }

  loadSections(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sectionService.getSections(this.eventId).subscribe({
      next: (response) => {
        this.sections.set(response.data ?? []);
        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load sections:', error);

        this.error.set('Failed to load sections.');
        this.loading.set(false);
      },
    });
  }

  createSection(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
      'create',
    ]);
  }

  viewSection(sectionId: string): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
      sectionId,
    ]);
  }

  editSection(sectionId: string): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
      sectionId,
      'edit',
    ]);
  }

  deleteSection(sectionId: string): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this section?'
    );

    if (!confirmed) {
      return;
    }

    this.deleting.set(sectionId);

    this.sectionService
      .deleteSection(this.eventId, sectionId)
      .subscribe({
        next: () => {
          this.deleting.set(null);

          this.toastr.success(
            'Section deleted successfully.'
          );

          this.loadSections();
        },

        error: (error: unknown) => {
          console.error(
            'Failed to delete section:',
            error
          );

          this.deleting.set(null);

          this.toastr.error(
            'Failed to delete section.'
          );
        },
      });
  }
}