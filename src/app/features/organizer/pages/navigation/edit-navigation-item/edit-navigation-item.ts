import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../core/models/event-page/event-page.model';
import { NavigationItemModel } from '../../../../../core/models/navigation-item/navigation-item.model';

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
  private readonly service = inject(NavigationItemService);
  private readonly state = inject(OrganizerEventStateService);
  private readonly toastr = inject(NotificationService);
  private readonly pages = inject(EventPageService);

  pageOptions: EventPageModel[] = [];
  loadingPages = true;
  loading = true;
  saving = false;

  item: NavigationItemModel | null = null;

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(100)]],
    pageId: ['', Validators.required],
    isVisible: [true],
  });

  ngOnInit(): void {
    const id = this.state.eventId();
    const itemId = this.route.snapshot.paramMap.get('itemId') ?? '';

    if (!id || !itemId) {
      this.toastr.error('Navigation item information is required.');
      this.loading = false;
      this.loadingPages = false;
      return;
    }

    this.pages.getManagePages(id).subscribe({
      next: (r) => {
        this.pageOptions = [...(r.data ?? [])].sort(
          (a, b) => Number(b.isPublished) - Number(a.isPublished),
        );
        this.loadingPages = false;
      },
      error: (e) => {
        this.loadingPages = false;
        this.toastr.error(
          this.apiMessage(e, 'Failed to load event pages.')
        );
      },
    });

    this.service.getItems(id).subscribe({
      next: (r) => {
        const item =
          r.data?.find((x) => x.id === itemId) ?? null;

        if (!item) {
          this.loading = false;
          this.toastr.error('Navigation item not found.');
          return;
        }

        this.item = item;

        this.form.patchValue({
          label: item.label,
          pageId: item.pageId,
          isVisible: item.isVisible,
        });

        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.toastr.error(
          this.apiMessage(
            e,
            'Failed to load navigation item.'
          )
        );
      },
    });
  }

  submit(): void {
    const id = this.state.eventId();
    const itemId =
      this.route.snapshot.paramMap.get('itemId') ?? '';

    if (
      this.form.invalid ||
      !id ||
      !itemId ||
      !this.item
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    this.saving = true;

    this.service
      .updateItem(id, itemId, {
        label: v.label.trim(),
        pageId: v.pageId,
        isVisible: v.isVisible,
      })
      .subscribe({
        next: (r) => {
          this.saving = false;
          this.toastr.success(r.message);

          this.router.navigate([
            '/organizer',
            id,
            'navigation',
          ]);
        },
        error: (e) => {
          this.saving = false;
          this.toastr.error(
            this.apiMessage(
              e,
              'Failed to update navigation item.'
            )
          );
        },
      });
  }

  cancel(): void {
    this.router.navigate([
      '/organizer',
      this.state.eventId(),
      'navigation',
    ]);
  }

  private apiMessage(
    error: unknown,
    fallback: string
  ): string {
    const r = (
      error as {
        error?: {
          message?: string;
          errors?: string[];
        };
      }
    )?.error;

    return (
      r?.errors?.join(' ') ||
      r?.message ||
      fallback
    );
  }
}