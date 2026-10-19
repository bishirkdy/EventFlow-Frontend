import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { EventPageSectionService } from '../../../../../core/services/event-page-section/event-page-section.service';
import {
  PageSectionModel,
  UpdatePageSectionModel
} from '../../../../../core/models/event-page-section';
import { createAsyncAction } from '@/core/state';

@Component({
  selector: 'app-edit-page-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-page-section.html',
  styleUrl: './edit-page-section.css'
})
export class EditPageSection implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);
  private readonly pageSectionService = inject(EventPageSectionService);

  readonly selectedImage = signal<File | null>(null);
  readonly currentImageUrl = signal<string | null>(null);
  readonly imagePreview = signal<string | null>(null);

  private pageId = '';
  private sectionId = '';
  private eventId = '';

  private readonly loadAction = createAsyncAction(
    () => this.pageSectionService.getManageSections(this.pageId),
    {
      toastErrors: true,
      errorFallback: 'Failed to load page section.',
      onSuccess: (response) => {
        const section = response.data?.find((item) => item.id === this.sectionId);

        if (!section) {
          this.toastr.error('Page section not found.');
          this.goBack();
          return;
        }

        this.setForm(section);
      }
    }
  );

  private readonly updateSectionAction = createAsyncAction(
    (payload: UpdatePageSectionModel) =>
      this.pageSectionService.updateSection(this.pageId, this.sectionId, payload),
    {
      successMessage: 'Page section updated successfully.',
      errorFallback: 'Failed to update page section.',
      onSuccess: () => this.goBack()
    }
  );

  readonly loading = this.loadAction.pending;
  readonly saving = this.updateSectionAction.pending;

  readonly form = this.fb.nonNullable.group({
    sectionType: ['', Validators.required],
    title: [''],
    content: [''],
    isVisible: [true],
    configuration: ['']
  });

  ngOnInit(): void {
    let currentRoute: ActivatedRoute | null = this.route;

    while (currentRoute) {
      const pageId = currentRoute.snapshot.paramMap.get('pageId');
      const sectionId = currentRoute.snapshot.paramMap.get('sectionId');
      const eventId = currentRoute.snapshot.paramMap.get('eventId');

      if (pageId) {
        this.pageId = pageId;
      }

      if (sectionId) {
        this.sectionId = sectionId;
      }

      if (eventId) {
        this.eventId = eventId;
      }

      currentRoute = currentRoute.parent;
    }

    if (!this.pageId || !this.sectionId || !this.eventId) {
      this.toastr.error('Page section information is missing.');
      return;
    }

    this.loadSection();
  }

  loadSection(): void {
    this.loadAction.run();
  }

  private setForm(section: PageSectionModel): void {
    this.form.patchValue({
      sectionType: section.sectionType,
      title: section.title ?? '',
      content: section.content ?? '',
      isVisible: section.isVisible,
      configuration: section.configuration ?? ''
    });

    this.currentImageUrl.set(section.imageUrl);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImage.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : null);
  }

  updateSection(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.updateSectionAction.run({
      ...this.form.getRawValue(),
      image: this.selectedImage() ?? undefined
    });
  }

  goBack(): void {
    this.router.navigate(['/organizer', this.eventId, 'pages', this.pageId, 'sections']);
  }
}
