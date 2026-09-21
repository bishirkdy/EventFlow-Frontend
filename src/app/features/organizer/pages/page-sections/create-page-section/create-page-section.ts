import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { EventPageSectionService } from '../../../../../core/services/event-page-section/event-page-section.service';

@Component({
  selector: 'app-create-page-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-page-section.html',
  styleUrl: './create-page-section.css',
})
export class CreatePageSection {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly pageSectionService = inject(EventPageSectionService);

  private pageId = '';
  private eventId = '';

  readonly saving = signal(false);
  readonly selectedImage = signal<File | null>(null);

  readonly form = this.fb.nonNullable.group({
    sectionType: ['', Validators.required],
    title: [''],
    content: [''],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    configuration: [''],
  });

  constructor() {
    this.pageId =
      this.route.parent?.snapshot.paramMap.get('pageId') ?? '';

    this.eventId =
      this.route.parent?.parent?.parent?.snapshot.paramMap.get('eventId') ?? '';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImage.set(file);
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

    this.saving.set(true);

    this.pageSectionService
      .createSection(this.pageId, {
        ...this.form.getRawValue(),
        image: this.selectedImage() ?? undefined,
      })
      .subscribe({
        next: () => {
          this.toastr.success(
            'Page section created successfully.',
          );

          this.router.navigate([
            '/organizer',
            this.eventId,
            'pages',
            this.pageId,
            'sections',
          ]);
        },
        error: () => {
          this.saving.set(false);
          this.toastr.error(
            'Failed to create page section.',
          );
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'pages',
      this.pageId,
      'sections',
    ]);
  }
}