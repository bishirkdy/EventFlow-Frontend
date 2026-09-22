import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationItemService } from '../../../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../../../services/organizer-event-state.service';

@Component({
  selector: 'app-create-navigation-item',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-navigation-item.html',
  styleUrl: './create-navigation-item.css',
})
export class CreateNavigationItem {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navigationItemService = inject(NavigationItemService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  readonly menuId =
    this.route.snapshot.paramMap.get('menuId') ?? '';

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(100)]],
    url: [''],
    pageId: [''],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    openInNewTab: [false],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.menuId) {
      this.toastr.error('Navigation menu ID is required.');
      return;
    }

    const value = this.form.getRawValue();

    const request = {
      label: value.label,
      url: value.url || null,
      pageId: value.pageId || null,
      displayOrder: value.displayOrder,
      openInNewTab: value.openInNewTab,
    };

    this.navigationItemService
      .createItem(this.menuId, request)
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message);

          this.router.navigate([
            '/organizer',
            this.eventState.eventId(),
            'navigation-menus',
            this.menuId,
            'items',
          ]);
        },
        error: () => {
          this.toastr.error('Failed to create navigation item.');
        },
      });
  }

  cancel(): void {
    this.router.navigate([
      '/organizer',
      this.eventState.eventId(),
      'navigation-menus',
      this.menuId,
      'items',
    ]);
  }
}