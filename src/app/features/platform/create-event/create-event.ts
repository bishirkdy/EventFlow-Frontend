import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, map, switchMap } from 'rxjs';

import { EventService } from '../../../core/services/event/event.service';
import { EventTypeService } from '../../../core/services/event-type/event-type.service';
import { EventTypeModel } from '../../../core/models/event-type/event-type.model';
import { dateRangeValidator } from '../../../shared/validators/date-range.validator';
import { EventWebsiteSetupService } from '../../../core/services/website/event-website-setup.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEvent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly toastr = inject(ToastrService);
  private readonly eventTypeService = inject(EventTypeService);
  private readonly websiteSetupService = inject(EventWebsiteSetupService);

  readonly loading = signal(false);
  readonly eventTypes = signal<EventTypeModel[]>([]);

  selectedImages: File[] = [];
  imagePreviews: string[] = [];

  readonly eventForm = this.fb.nonNullable.group(
    {
      eventName: ['', [Validators.required, Validators.maxLength(200)]],

      eventTypeId: ['', [Validators.required]],

      subType: ['', [Validators.maxLength(100)]],

      startDate: ['', [Validators.required]],

      endDate: ['', [Validators.required]],

      description: ['', [Validators.maxLength(2000)]],

      timeZone: [
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        [Validators.required, Validators.maxLength(100)],
      ],
    },
    {
      validators: dateRangeValidator,
    },
  );

  ngOnInit(): void {
    this.loadEventTypes();
  }

  private loadEventTypes(): void {
    this.eventTypeService.getEventTypes().subscribe({
      next: (response) => {
        this.eventTypes.set(response.data ?? []);
      },

      error: (error) => {
        console.error('Failed to load event types:', error);

        this.toastr.error(error?.error?.message || 'Failed to load event types.');
      },
    });
  }

  onImagesSelected(event: globalThis.Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.imagePreviews.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    this.selectedImages = Array.from(input.files);

    this.imagePreviews = this.selectedImages.map((file) => URL.createObjectURL(file));
  }

  createEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    if (this.selectedImages.length === 0) {
      this.toastr.error('Please select at least one event image.');
      return;
    }

    this.loading.set(true);

    const formValue = this.eventForm.getRawValue();

    const request = {
      name: formValue.eventName,
      description: formValue.description,
      eventTypeId: formValue.eventTypeId,
      subType: formValue.subType,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      timeZone: formValue.timeZone,
      images: this.selectedImages,
    };

    this.eventService
      .createEvent(request)
      .pipe(
        switchMap((response) => {
          const data = response.data;

          if (!data) {
            throw new Error('Event was created but no event data was returned.');
          }

          return this.websiteSetupService
            .setup(data.id, data.eventTypeId)
            .pipe(map(() => data));
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          const eventId = data.id;

          this.toastr.success('Event created and starter website configured.');

          this.router.navigate(['/organizer', eventId, 'overview']);
        },

        error: (error) => {
          console.error('Create event failed:', error);

          this.toastr.error(error?.error?.message || 'Failed to create event.');
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
