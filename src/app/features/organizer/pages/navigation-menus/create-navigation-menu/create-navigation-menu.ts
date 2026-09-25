import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationMenuService } from '../../../../../core/services/navigation-menu/navigation-menu.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';


@Component({
  selector: 'app-create-navigation-menu',
  imports: [ReactiveFormsModule],
  templateUrl: './create-navigation-menu.html',
  styleUrl: './create-navigation-menu.css',
})

export class CreateNavigationMenu {
  private readonly fb = inject(FormBuilder);
  private readonly navigationMenuService = inject(NavigationMenuService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly loading = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    location: ['', [Validators.required, Validators.maxLength(100)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.toastr.error('Event ID is required.');
      return;
    }

    this.navigationMenuService
      .createMenu(eventId, this.form.getRawValue())
      .subscribe({
        next: (response) => {
          if (!response.data) {
            this.toastr.error('Navigation menu was created but no menu ID was returned.');
            return;
          }

          this.toastr.success(response.message);

          this.router.navigate([
            '/organizer',
            eventId,
            'navigation-menus',
            response.data,
          ]);
        },
        error: () => {
          this.toastr.error('Failed to create navigation menu.');
        },
      });
  }

  cancel(): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
    ]);
  }
}