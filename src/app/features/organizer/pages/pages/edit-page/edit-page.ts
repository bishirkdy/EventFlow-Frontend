import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { createAsyncAction } from 'core/state';

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
  private readonly toastr = inject(NotificationService);

  readonly eventId = this.eventState.eventId;

  private readonly pageId = this.route.snapshot.paramMap.get('pageId');

  private readonly loadAction = createAsyncAction(
    (eventId: string) => this.pageService.getManagePageById(eventId, this.pageId ?? ''),
    {
      toastErrors: true,
      errorFallback: 'Failed to load page.',
      onSuccess: (response) => {
        const page = response.data;
        if (!page) {
          this.toastr.error('Page data was not returned.');
          return;
        }

        this.form.patchValue({
          name: page.name,
          slug: page.slug,
          pageType: page.pageType,
        });
      },
    },
  );

  private readonly updateAction = createAsyncAction(
    (eventId: string, formValue: { name: string; slug: string; pageType: string }) =>
      this.pageService.updatePage(eventId, this.pageId ?? '', formValue).pipe(
        map((response) => ({ eventId, response })),
      ),
    {
      errorFallback: 'Failed to update page.',
      onSuccess: ({ eventId, response }) => {
        this.toastr.success(response.message);

        this.router.navigate(['/organizer', eventId, 'pages']);
      },
    },
  );

  readonly loading = this.loadAction.pending;
  readonly saving = this.updateAction.pending;

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

    this.loadAction.run(eventId);
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

    this.updateAction.run(eventId, this.form.getRawValue());
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventId(), 'pages']);
  }
}
