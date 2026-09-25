import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-edit-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-page.html',
  styleUrl: './edit-page.css',
})
export class EditPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pageService = inject(EventPageService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly eventId = this.eventState.eventId;

  private readonly pageId = this.route.snapshot.paramMap.get('pageId');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],

    slug: [
      '',
      [
        Validators.required,
        Validators.maxLength(150),
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      ],
    ],

    pageType: ['', [Validators.required, Validators.maxLength(50)]],

    displayOrder: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadPage();
  }

  private loadPage(): void {
    const eventId = this.eventId();

    if (!eventId || !this.pageId) {
      this.toastr.error('Page not found.');
      return;
    }

    this.loading.set(true);

    this.pageService.getPageById(eventId, this.pageId).subscribe({
      next: (response) => {
        const page = response.data;
        if (!page) {
          this.loading.set(false);
          this.toastr.error('Page data was not returned.');
          return;
        }

        this.form.patchValue({
          name: page.name,
          slug: page.slug,
          pageType: page.pageType,
          displayOrder: page.displayOrder,
        });

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load page.');
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const eventId = this.eventId();

    if (!eventId || !this.pageId) {
      this.toastr.error('Page not found.');
      return;
    }

    this.saving.set(true);

    this.pageService.updatePage(eventId, this.pageId, this.form.getRawValue()).subscribe({
      next: (response) => {
        this.toastr.success(response.message);

        this.router.navigate(['/organizer', eventId, 'pages']);
      },

      error: () => {
        this.saving.set(false);
        this.toastr.error('Failed to update page.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventId(), 'pages']);
  }
}
