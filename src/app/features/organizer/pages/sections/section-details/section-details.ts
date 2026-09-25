import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { SectionModel } from '../../../../../core/models/section/section.model';
import { SectionService } from '../../../../../core/services/section/section.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-section-details',
  standalone: true,
  imports: [],
  templateUrl: './section-details.html',
  styleUrl: './section-details.css',
})
export class SectionDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  section = signal<SectionModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private eventId = '';
  private sectionId = '';

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const sectionId = this.route.snapshot.paramMap.get('sectionId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      this.loading.set(false);
      return;
    }

    if (!sectionId) {
      this.error.set('Section ID not found.');
      this.loading.set(false);
      return;
    }

    this.eventId = eventId;
    this.sectionId = sectionId;

    this.loadSection();
  }

  private loadSection(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sectionService
      .getSectionById(this.sectionId)
      .subscribe({
        next: (response) => {
          if (!response.data) {
            this.toastr.error('Section data was not returned.');
            this.loading.set(false);
            return;
          }

          this.section.set(response.data);
          this.loading.set(false);
        },

        error: (error: unknown) => {
          console.error(
            'Failed to load section:',
            error,
          );

          this.error.set('Failed to load section.');
          this.loading.set(false);
        },
      });
  }

  editSection(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
      this.sectionId,
      'edit',
    ]);
  }

  goBack(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
    ]);
  }

  deleteSection(): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this section?'
    );

    if (!confirmed) {
      return;
    }

    this.sectionService
      .deleteSection(
        this.eventId,
        this.sectionId,
      )
      .subscribe({
        next: () => {
          this.toastr.success(
            'Section deleted successfully.',
          );

          this.goBack();
        },

        error: (error: unknown) => {
          console.error(
            'Failed to delete section:',
            error,
          );

          this.toastr.error(
            'Failed to delete section.',
          );
        },
      });
  }
}