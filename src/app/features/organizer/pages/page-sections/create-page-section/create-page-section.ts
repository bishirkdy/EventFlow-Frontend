import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { EventPageSectionService } from '../../../../../core/services/event-page-section/event-page-section.service';
import { CreatePageSectionModel } from '../../../../../core/models/event-page-section';
import { createAsyncAction } from '@/core/state';

@Component({
  selector: 'app-create-page-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-page-section.html',
  styleUrl: './create-page-section.css'
})
export class CreatePageSection {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);
  private readonly pageSectionService = inject(EventPageSectionService);

  private pageId = '';
  private eventId = '';

  readonly selectedImage = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  private readonly createSectionAction = createAsyncAction(
    (payload: CreatePageSectionModel) =>
      this.pageSectionService.createSection(this.pageId, payload),
    {
      successMessage: 'Page section created successfully.',
      errorFallback: 'Failed to create page section.',
      onSuccess: () =>
        this.router.navigate(['/organizer', this.eventId, 'pages', this.pageId, 'sections'])
    }
  );

  readonly saving = this.createSectionAction.pending;

  readonly form = this.fb.nonNullable.group({
    sectionType: ['', Validators.required],
    title: [''],
    content: [''],
    configuration: ['']
  });

  constructor() {
    this.pageId = this.route.parent?.snapshot.paramMap.get('pageId') ?? '';

    this.eventId = this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId') ?? '';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImage.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : null);
  }

  createSection(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.pageId) {
      this.toastr.error('Page ID is missing.');
      return;
    }

    this.createSectionAction.run({
      ...this.form.getRawValue(),
      image: this.selectedImage() ?? undefined
    });
  }

  goBack(): void {
    this.router.navigate(['/organizer', this.eventId, 'pages', this.pageId, 'sections']);
  }
}
