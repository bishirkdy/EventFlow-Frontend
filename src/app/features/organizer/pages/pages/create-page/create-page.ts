import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

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
  private readonly toastr = inject(ToastrService);

  readonly saving = this.fb.nonNullable.control(false);

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

    this.saving.setValue(true);

    this.pageService.createPage(eventId, this.form.getRawValue()).subscribe({
      next: (response) => {
        this.toastr.success(response.message);

        this.router.navigate(['/organizer', eventId, 'pages']);
      },

      error: () => {
        this.saving.setValue(false);
        this.toastr.error('Failed to create event page.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventState.eventId(), 'pages']);
  }
}
