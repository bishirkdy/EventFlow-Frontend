import { Component, inject, OnInit } from '@angular/core';
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
  selector: 'app-edit-navigation-item',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-navigation-item.html',
  styleUrl: './edit-navigation-item.css',
})
export class EditNavigationItem implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navigationItemService = inject(NavigationItemService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  menuId = '';
  itemId = '';

  loading = true;
  saving = false;

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(100)]],
    url: [''],
    pageId: [''],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    openInNewTab: [false],
    isVisible: [true],
  });

  ngOnInit(): void {
    this.menuId =
      this.route.snapshot.paramMap.get('menuId') ?? '';

    this.itemId =
      this.route.snapshot.paramMap.get('itemId') ?? '';

    if (!this.menuId || !this.itemId) {
      this.toastr.error('Navigation item information is required.');
      return;
    }

    this.loadItem();
  }

  loadItem(): void {
    this.loading = true;

    this.navigationItemService
      .getItems(this.menuId)
      .subscribe({
        next: (response) => {
          const item = response.data?.find(
            x => x.id === this.itemId,
          );

          if (!item) {
            this.loading = false;
            this.toastr.error('Navigation item not found.');
            return;
          }

          this.form.patchValue({
            label: item.label,
            url: item.url ?? '',
            pageId: item.pageId ?? '',
            displayOrder: item.displayOrder,
            openInNewTab: item.openInNewTab,
            isVisible: item.isVisible,
          });

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Failed to load navigation item.');
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.menuId || !this.itemId) {
      return;
    }

    this.saving = true;

    const value = this.form.getRawValue();

    const request = {
      label: value.label,
      url: value.url || null,
      pageId: value.pageId || null,
      displayOrder: value.displayOrder,
      openInNewTab: value.openInNewTab,
      isVisible: value.isVisible,
    };

    this.navigationItemService
      .updateItem(this.menuId, this.itemId, request)
      .subscribe({
        next: (response) => {
          this.saving = false;
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
          this.saving = false;
          this.toastr.error('Failed to update navigation item.');
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