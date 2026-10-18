import { Component, inject, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UpdateVenueRequest, VenueModel } from '../../../../../core/models/venue';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { createAsyncAction } from '@/core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

@Component({
  selector: 'app-edit-venue',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncState],
  templateUrl: './edit-venue.html',
  styleUrl: './edit-venue.css'
})
export class EditVenue implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly venueService = inject(VenueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  error = signal<string | null>(null);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  currentImageUrl = signal<string | null>(null);

  private eventId = '';
  private venueId = '';

  private readonly loadAction = createAsyncAction(
    () => this.venueService.getVenueById(this.eventId, this.venueId),
    {
      toastErrors: true,
      errorFallback: 'Failed to load venue.',
      onError: () => this.error.set('Failed to load venue.'),
      onSuccess: (response) => {
        const venue = response.data;
        if (!venue) {
          this.error.set('Venue data was not returned.');
          return;
        }

        this.form.patchValue({
          name: venue.name,
          description: venue.description ?? '',
          address: venue.address ?? '',
          capacity: venue.capacity
        });
        this.currentImageUrl.set(venue.imageUrl ?? null);
        this.imagePreview.set(venue.imageUrl ?? null);
      }
    }
  );

  private readonly updateAction = createAsyncAction(
    (request: UpdateVenueRequest) =>
      this.venueService.updateVenue(this.eventId, this.venueId, request),
    {
      successMessage: 'Venue updated successfully',
      errorFallback: 'Failed to update venue.',
      onSuccess: () => this.router.navigate(['/organizer', this.eventId, 'venues'])
    }
  );

  loading = this.loadAction.pending;
  saving = this.updateAction.pending;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],

    description: ['', [Validators.maxLength(2000)]],

    address: ['', [Validators.maxLength(500)]],

    capacity: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const venueId = this.route.snapshot.paramMap.get('venueId');

    if (!eventId) {
      this.error.set('Event ID not found.');
      return;
    }

    if (!venueId) {
      this.error.set('Venue ID not found.');
      return;
    }

    this.eventId = eventId;
    this.venueId = venueId;

    this.reload();
  }

  reload(): void {
    this.error.set(null);
    this.loadAction.run();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImage.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : this.currentImageUrl());
  }

  updateVenue(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const request: UpdateVenueRequest = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      address: formValue.address.trim(),
      capacity: formValue.capacity,
      image: this.selectedImage() ?? undefined
    };

    this.updateAction.run(request);
  }

  goBack(): void {
    this.router.navigate(['/organizer', this.eventId, 'venues']);
  }
}
