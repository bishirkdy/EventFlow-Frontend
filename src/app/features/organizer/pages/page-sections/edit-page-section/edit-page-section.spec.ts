import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EventPageSectionService } from '../../../../../core/services/event-page-section/event-page-section.service';
import { PageSectionModel } from '../../../../../core/models/event-page-section/PageSectionModel';



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

  // Replace with your existing global page state service
  private readonly pageId = '';

  private sectionId = '';

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly selectedImage = signal<File | null>(null);
  readonly currentImageUrl = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    sectionType: ['', Validators.required],
    title: [''],
    content: [''],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    isVisible: [true],
    configuration: [''],
  });

  ngOnInit(): void {
    this.sectionId =
      this.route.snapshot.paramMap.get('sectionId') ?? '';

    if (!this.sectionId || !this.pageId) {
      this.toastr.error('Section information is missing.');
      this.loading.set(false);
      return;
    }

    this.loadSection();
  }

  loadSection(): void {
    this.loading.set(true);

    this.pageSectionService
      .getSections(this.pageId)
      .subscribe({
        next: (response) => {
          const section = response.data?.find(
            (item) => item.id === this.sectionId,
          );

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
    const file = input.files?.[0] ?? null;

    this.selectedImage.set(file);
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

          this.router.navigate([
            '/organizer',
            'page-section',
          ]);
        },
        error: () => {
          this.saving.set(false);
          this.toastr.error('Failed to update page section.');
        },
      });
  }

  goBack(): void {
    this.router.navigate([
      '/organizer',
      'page-section',
    ]);
  }
}