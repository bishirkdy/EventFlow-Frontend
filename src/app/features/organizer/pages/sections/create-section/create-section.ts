import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { CreateSectionModel } from '../../../../../core/models/section/create-section.model';
import { SectionService } from '../../../../../core/services/section/section.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-create-section',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-section.html',
  styleUrl: './create-section.css',
})
export class CreateSection implements OnInit {
  private readonly router = inject(Router);
  private readonly sectionService = inject(SectionService);
  private readonly toastr = inject(NotificationService);
  private readonly organizerEventState =
    inject(OrganizerEventStateService);

  eventId = '';

  saving = signal(false);
  error = signal<string | null>(null);

  section: CreateSectionModel = {
    name: '',
    description: '',
    displayOrder: 1,
    isActive: true,
  };

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    this.eventId = eventId;
  }

  createSection(): void {
    this.error.set(null);

    if (!this.section.name.trim()) {
      this.error.set('Section name is required.');
      return;
    }

    if (this.section.displayOrder < 1) {
      this.error.set('Display order must be at least 1.');
      return;
    }

    const request: CreateSectionModel = {
      name: this.section.name.trim(),
      description: this.section.description?.trim() || undefined,
      displayOrder: this.section.displayOrder,
      isActive: this.section.isActive,
    };

    this.saving.set(true);

    this.sectionService
      .createSection(this.eventId, request)
      .subscribe({
        next: () => {
          this.saving.set(false);

          this.toastr.success(
            'Section created successfully.',
          );

          this.router.navigate([
            '/organizer',
            this.eventId,
            'sections',
          ]);
        },

        error: (error: unknown) => {
          console.error(
            'Failed to create section:',
            error,
          );

          this.saving.set(false);
          this.error.set(
            'Failed to create section.',
          );
        },
      });
  }

  cancel(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'sections',
    ]);
  }
}