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
import { EventPageService } from '../../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../../core/models/event-page/event-page.model';


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
  private readonly eventPageService = inject(EventPageService);

  pageOptions: EventPageModel[] = [];
  loadingPages = true;

  menuId = '';
  itemId = '';

  loading = true;
  saving = false;

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(100)]],
    pageId: ['', Validators.required],
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

    this.loadPages();
    this.loadItem();
  }


  loadPages(): void {
    const eventId = this.eventState.eventId();
    if (!eventId) return;
    this.eventPageService.getPages(eventId).subscribe({
      next: (response) => { this.pageOptions = (response.data ?? []).filter(page => page.isPublished); this.loadingPages = false; },
      error: () => { this.loadingPages = false; this.toastr.error('Failed to load event pages.'); },
    });
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
            pageId: item.pageId,
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
      label: value.label.trim(),
      pageId: value.pageId,
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