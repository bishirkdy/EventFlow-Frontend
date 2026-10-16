import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/ui/notification.service';

import { EventService } from '../../../core/services/event/event.service';
import { EventRoleService } from '../../../core/services/event-role/event-role.service';
import { EventTypeService } from '../../../core/services/event-type/event-type.service';
import { EventTypeModel } from '../../../core/models/event-type';
import { workspaceUrlForRoles } from '../../../core/routing/event-route.util';
import { dateRangeValidator } from '../../../shared/validators/date-range.validator';
import { createAsyncAction, createAsyncState } from 'core/state';

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
  private readonly eventRoleService = inject(EventRoleService);
  private readonly toastr = inject(NotificationService);
  private readonly eventTypeService = inject(EventTypeService);

  private readonly eventTypesState = createAsyncState<EventTypeModel[]>(
    () => this.eventTypeService.getEventTypes(),
    { initial: [], errorFallback: 'Failed to load event types.' },
  );

  readonly eventTypes = this.eventTypesState.data;
  readonly eventTypesError = this.eventTypesState.error;

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

  private readonly createAction = createAsyncAction(
    (request: Parameters<EventService['createEvent']>[0]) =>
      this.eventService.createEvent(request),
    {
      onSuccess: (response) => {
        const data = response.data;

        if (!data) {
          this.toastr.error('Event was created but no event data was returned.');
          return;
        }

        this.toastr.success('Event created successfully.');

        // The creator is always made the owner, so the owner dashboard is the
        // safe landing page if the role lookup fails or comes back empty.
        this.eventRoleService.getMyRoles(data.id).subscribe({
          next: (rolesResponse) => {
            const url = workspaceUrlForRoles(data.id, rolesResponse.data ?? []);

            void this.router.navigate(url ?? ['/owner', data.id]);
          },
          error: () => {
            void this.router.navigate(['/owner', data.id]);
          },
        });
      },
      errorFallback: 'Failed to create event.',
    },
  );

  readonly loading = this.createAction.pending;

  ngOnInit(): void {
    this.eventTypesState.load();
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

    const formValue = this.eventForm.getRawValue();

    this.createAction.run({
      name: formValue.eventName,
      description: formValue.description,
      eventTypeId: formValue.eventTypeId,
      subType: formValue.subType,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      timeZone: formValue.timeZone,
      images: this.selectedImages,
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
