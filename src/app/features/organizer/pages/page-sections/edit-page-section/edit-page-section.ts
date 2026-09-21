import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { EventPageSectionService } from '../../../../../core/services/event-page-section/event-page-section.service';
import { PageSectionModel } from '../../../../../core/models/event-page-section/PageSectionModel';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-edit-page-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-page-section.html',
  styleUrl: './edit-page-section.css',
})
export class EditPageSection implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly pageSectionService = inject(EventPageSectionService);
  private readonly eventState = inject(OrganizerEventStateService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly selectedImage = signal<File | null>(null);
  readonly currentImageUrl = signal<string | null>(null);

  private pageId = '';
  private sectionId = '';
  private eventId = '';

  readonly form = this.fb.nonNullable.group({
    sectionType: ['', Validators.required],
    title: [''],
    content: [''],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    isVisible: [true],
    configuration: [''],
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

    console.log('Event ID:', this.eventId);
    console.log('Page ID:', this.pageId);
    console.log('Section ID:', this.sectionId);

    if (!this.pageId || !this.sectionId || !this.eventId) {
      this.toastr.error('Page section information is missing.');
      this.loading.set(false);
      return;
    }

    this.loadSection();
  }
  loadSection(): void {
    this.loading.set(true);

    this.pageSectionService.getSections(this.pageId).subscribe({
      next: (response) => {
        const section = response.data?.find((item) => item.id === this.sectionId);

        if (!section) {
          this.toastr.error('Page section not found.');
          this.goBack();
          return;
        }

        this.setForm(section);
        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load page section.');
      },
    });
  }

  private setForm(section: PageSectionModel): void {
    this.form.patchValue({
      sectionType: section.sectionType,
      title: section.title ?? '',
      content: section.content ?? '',
      displayOrder: section.displayOrder,
      isVisible: section.isVisible,
      configuration: section.configuration ?? '',
    });

    this.currentImageUrl.set(section.imageUrl);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedImage.set(input.files?.[0] ?? null);
  }

  updateSection(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.pageSectionService
      .updateSection(this.pageId, this.sectionId, {
        ...this.form.getRawValue(),
        image: this.selectedImage() ?? undefined,
      })
      .subscribe({
        next: () => {
          this.toastr.success('Page section updated successfully.');

          this.goBack();
        },

        error: () => {
          this.saving.set(false);
          this.toastr.error('Failed to update page section.');
        },
      });
  }
  
  goBack(): void {
    this.router.navigate(['/organizer', this.eventId, 'pages', this.pageId, 'sections']);
  }
}
