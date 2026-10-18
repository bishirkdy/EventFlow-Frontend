import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UpdateSectionModel } from '../../../../../core/models/section';
import { SectionService } from '../../../../../core/services/section/section.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { createAsyncAction } from '@/core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-update-section',
  standalone: true,
  imports: [FormsModule, AsyncState],
  templateUrl: './update-section.html',
  styleUrl: './update-section.css'
})
export class UpdateSection implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  sectionId = '';
  eventId = '';

  error = signal<string | null>(null);
  loadError = signal<string | null>(null);

  private readonly loadAction = createAsyncAction(
    () => this.sectionService.getSectionById(this.sectionId),
    {
      errorFallback: 'Failed to load section.',
      onError: () => this.loadError.set('Failed to load section.'),
      onSuccess: (response) => {
        const data = response.data;
        if (!data) {
          this.loadError.set('Section data was not returned.');
          return;
        }

        this.section = {
          name: data.name,
          description: data.description ?? '',
          displayOrder: data.displayOrder,
          isActive: data.isActive
        };
      }
    }
  );

  private readonly updateAction = createAsyncAction(
    (request: UpdateSectionModel) =>
      this.sectionService.updateSection(this.eventId, this.sectionId, request),
    {
      successMessage: 'Section updated successfully.',
      errorFallback: 'Failed to update section.',
      onSuccess: () =>
        this.router.navigate(['/organizer', this.eventId, 'sections', this.sectionId])
    }
  );

  loading = this.loadAction.pending;
  saving = this.updateAction.pending;

  section: UpdateSectionModel = {
    name: '',
    description: '',
    displayOrder: 1,
    isActive: true
  };

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const sectionId = this.route.snapshot.paramMap.get('sectionId');

    if (!eventId) {
      this.loadError.set('Event ID not found.');
      return;
    }

    if (!sectionId) {
      this.loadError.set('Section ID not found.');
      return;
    }

    this.eventId = eventId;
    this.sectionId = sectionId;

    this.reload();
  }

  reload(): void {
    this.loadError.set(null);
    this.loadAction.run();
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
      description: this.section.description?.trim() || undefined,
      displayOrder: this.section.displayOrder,
      isActive: this.section.isActive
    };

    this.updateAction.run(request);
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventId, 'sections', this.sectionId]);
  }
}
