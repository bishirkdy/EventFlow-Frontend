import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationMenuService } from '../../../../../core/services/navigation-menu/navigation-menu.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';



@Component({
  selector: 'app-edit-navigation-menu',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-navigation-menu.html',
  styleUrl: './edit-navigation-menu.css',
})

export class EditNavigationMenu implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly navigationMenuService = inject(NavigationMenuService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  menuId = '';

  loading = true;
  saving = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    location: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.menuId =
      this.route.snapshot.paramMap.get('menuId') ?? '';

    if (!this.menuId) {
      this.toastr.error('Navigation menu ID is required.');
      return;
    }

    this.loadMenu();
  }

  loadMenu(): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.toastr.error('Event ID is required.');
      return;
    }

    this.navigationMenuService
      .getMenuById(eventId, this.menuId)
      .subscribe({
        next: (response) => {
          const menu = response.data;

          this.form.patchValue({
            name: menu.name,
            location: menu.location,
          });

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Failed to load navigation menu.');
        },
      });
  }

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

    this.saving = true;

    this.navigationMenuService
      .updateMenu(
        eventId,
        this.menuId,
        this.form.getRawValue(),
      )
      .subscribe({
        next: (response) => {
          this.saving = false;
          this.toastr.success(response.message);

          this.router.navigate([
            '/organizer',
            eventId,
            'navigation-menus',
            this.menuId,
          ]);
        },
        error: () => {
          this.saving = false;
          this.toastr.error('Failed to update navigation menu.');
        },
      });
  }

  cancel(): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
      this.menuId,
    ]);
  }
}