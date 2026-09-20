import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UpdateSectionModel } from '../../../../../core/models/section/update-section.model';
import { SectionService } from '../../../../../core/services/section/section.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-update-section',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './update-section.html',
  styleUrl: './update-section.css',
})
export class UpdateSection implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  sectionId = '';
  eventId = '';

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  section: UpdateSectionModel = {
    name: '',
    description: '',
    displayOrder: 1,
    isActive: true,
  };

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const sectionId =
      this.route.snapshot.paramMap.get('sectionId');

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
          const data = response.data;

          this.section = {
            name: data.name,
            description: data.description ?? '',
            displayOrder: data.displayOrder,
            isActive: data.isActive,
          };

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

  updateSection(): void {
    this.error.set(null);

    if (!this.section.name.trim()) {
      this.error.set('Section name is required.');
      return;
    }

    if (this.section.displayOrder < 1) {
      this.error.set('Display order must be at least 1.');
      return;
    }

    const request: UpdateSectionModel = {
      name: this.section.name.trim(),
      description:
        this.section.description?.trim() || undefined,
      displayOrder: this.section.displayOrder,
      isActive: this.section.isActive,
    };

    this.saving.set(true);

    this.sectionService
      .updateSection(
        this.eventId,
        this.sectionId,
        request,
      )
      .subscribe({
        next: () => {
          this.saving.set(false);

          this.toastr.success(
            'Section updated successfully.',
          );

          this.router.navigate([
            '/organizer',
            this.eventId,
            'sections',
            this.sectionId,
          ]);
        },

        error: (error: unknown) => {
          console.error(
            'Failed to update section:',
            error,
          );

          this.saving.set(false);
          this.error.set(
            'Failed to update section.',
          );
        },
      });
  }

  cancel(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
      this.sectionId,
    ]);
  }
}