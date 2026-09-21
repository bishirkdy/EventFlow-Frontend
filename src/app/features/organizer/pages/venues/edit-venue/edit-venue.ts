import { Component, inject, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { VenueModel } from '../../../../../core/models/venue/venue.model';
import { VenueService } from '../../../../../core/services/venue/venue.service';
import { UpdateVenueRequest } from '../../../../../core/models/venue/update-venue.model';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

@Component({
  selector: 'app-edit-venue',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-venue.html',
  styleUrl: './edit-venue.css',
})
export class EditVenue implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly venueService = inject(VenueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly toastr = inject(ToastrService);
  private readonly organizerEventState = inject(OrganizerEventStateService);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  private eventId = '';
  private venueId = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],

    description: ['', [Validators.maxLength(2000)]],

    address: ['', [Validators.maxLength(500)]],

    capacity: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const eventId = this.organizerEventState.eventId();
    const venueId = this.route.snapshot.paramMap.get('venueId');

    if (!eventId) {
      this.toastr.error('Event ID not found');
      this.loading.set(false);
      return;
    }

    if (!venueId) {
      this.toastr.error('Venue ID not found');
      this.loading.set(false);
      return;
    }

    this.eventId = eventId;
    this.venueId = venueId;

    this.loadVenue();
  }

  private loadVenue(): void {
    this.loading.set(true);
    this.error.set(null);

    this.venueService.getVenueById(this.eventId, this.venueId).subscribe({
      next: (response) => {
        const venue: VenueModel = response.data;

        this.form.patchValue({
          name: venue.name,
          description: venue.description ?? '',
          address: venue.address ?? '',
          capacity: venue.capacity,
        });

        this.loading.set(false);
      },

      error: (error: unknown) => {
        console.error('Failed to load venue:', error);

        this.error.set('Failed to load venue.');
        this.loading.set(false);

        this.toastr.error('Failed to load venue');
      },
    });
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
    };
    this.saving.set(true);

    this.venueService.updateVenue(this.eventId, this.venueId, request).subscribe({
      next: () => {
        this.saving.set(false);

        this.toastr.success('Venue updated successfully');

        this.router.navigate(['/organizer', this.eventId, 'venues']);
      },

      error: (error: unknown) => {
        console.error('Failed to update venue:', error);

        this.error.set('Failed to update venue.');
        this.saving.set(false);

        this.toastr.error('Failed to update venue');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/organizer', this.eventId, 'venues']);
  }
}
