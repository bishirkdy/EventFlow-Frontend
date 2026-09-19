import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { EventService } from '../../../core/services/event/event.service';
import { dateRangeValidator } from '../../../shared/validators/date-range.validator';

@Component({
  selector: 'app-create-event',
  imports: [ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEvent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly toastr = inject(ToastrService);

  loading = signal(false);

  selectedImages: File[] = [];
  imagePreviews: string[] = [];

  eventTypes = [
    'Wedding & Private Events',
    'Conference & Business',
    'Education & Workshop',
    'Festival & Cultural',
    'Sports & Competition',
  ];

  eventForm = this.fb.group(
    {
      eventName: [
        '',
        [Validators.required, Validators.maxLength(200)],
      ],

      eventType: [
        '',
        [Validators.required, Validators.maxLength(100)],
      ],

      subType: [
        '',
        [Validators.maxLength(100)],
      ],

      startDate: [
        '',
        [Validators.required],
      ],

      endDate: [
        '',
        [Validators.required],
      ],

      description: [
        '',
        [Validators.maxLength(2000)],
      ],

      timeZone: [
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        [Validators.required, Validators.maxLength(100)],
      ],
    },
    {
      validators: dateRangeValidator,
    },
  );

  onImagesSelected(event: globalThis.Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.imagePreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    this.selectedImages = Array.from(input.files);

    this.imagePreviews = this.selectedImages.map((file) =>
      URL.createObjectURL(file),
    );
  }

  createEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    if (this.selectedImages.length === 0) {
      this.toastr.error(
        'Please select at least one event image.',
      );
      return;
    }

    this.loading.set(true);

    const request = {
      name: this.eventForm.value.eventName!,
      description: this.eventForm.value.description || '',
      eventType: this.eventForm.value.eventType!,
      subType: this.eventForm.value.subType || '',
      startDate: this.eventForm.value.startDate!,
      endDate: this.eventForm.value.endDate!,
      timeZone: this.eventForm.value.timeZone!,
      images: this.selectedImages,
    };

    this.eventService
      .createEvent(request)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          const eventId = response.data.id;

          this.toastr.success(
            'Event and images created successfully!',
          );

          this.router.navigate([
            '/organizer',
            eventId,
            'overview',
          ]);
        },

        error: (error) => {
          console.error(
            'Create event failed:',
            error,
          );

          this.toastr.error(
            error?.error?.message ||
              'Failed to create event.',
          );
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}