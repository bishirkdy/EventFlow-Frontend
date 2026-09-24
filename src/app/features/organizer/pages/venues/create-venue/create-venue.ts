import { Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { VenueService } from '../../../../../core/services/venue/venue.service';
import { CreateVenueRequest } from '../../../../../core/models/venue/create-venue.model';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-create-venue',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-venue.html',
  styleUrl: './create-venue.css',
})
export class CreateVenue {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly venueService = inject(VenueService);
  private readonly organizerEventState = inject(
    OrganizerEventStateService
  );

  loading = signal(false);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(200),
      ],
    ],

    description: [
      '',
      [
        Validators.maxLength(2000),
      ],
    ],

    address: [
      '',
      [
        Validators.maxLength(500),
      ],
    ],

    capacity: [
      0,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],
  });

  goBack(): void {
    this.location.back();
  }


  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImage.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : null);
  }

  create(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const eventId = this.organizerEventState.eventId();

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    const formValue = this.form.getRawValue();

    const request: CreateVenueRequest = {
      name: formValue.name.trim(),
      description: formValue.description.trim() || undefined,
      address: formValue.address.trim() || undefined,
      capacity: formValue.capacity,
      image: this.selectedImage() ?? undefined,
    };

    this.loading.set(true);

    this.venueService.createVenue(eventId, request).subscribe({
      next: () => {
        this.loading.set(false);

        this.router.navigate([
          '/organizer',
          eventId,
          'venues',
        ]);
      },

      error: (error: unknown) => {
        console.error('Failed to create venue:', error);

        this.error.set('Failed to create venue.');

        this.loading.set(false);
      },
    });
  }
}