import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-create-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-page.html',
  styleUrl: './create-page.css',
})
export class CreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly pageService = inject(EventPageService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);

  private readonly createPageAction = createAsyncAction(
    (eventId: string, formValue: { name: string; slug: string; pageType: string }) =>
      this.pageService.createPage(eventId, formValue).pipe(
        map((response) => ({ eventId, response })),
      ),
    {
      errorFallback: 'Failed to create event page.',
      onSuccess: ({ eventId, response }) => {
        this.toastr.success(response.message);

        this.router.navigate(['/organizer', eventId, 'pages']);
      },
    },
  );

  readonly saving = this.createPageAction.pending;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['',
      [
        Validators.required,
        Validators.maxLength(150),
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      ],
    ],
    pageType: ['', [Validators.required, Validators.maxLength(50)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.toastr.error('Event not found.');
      return;
    }

    this.createPageAction.run(eventId, this.form.getRawValue());
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventState.eventId(), 'pages']);
  }
}
