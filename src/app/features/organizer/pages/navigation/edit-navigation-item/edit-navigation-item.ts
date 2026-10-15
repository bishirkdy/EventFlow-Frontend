import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../core/models/event-page';
import { NavigationItemModel } from '../../../../../core/models/navigation-item';
import { createAsyncAction } from 'core/state';

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

  private readonly loadPagesAction = createAsyncAction(
    (id: string) => this.pages.getManagePages(id),
    {
      toastErrors: true,
      errorFallback: 'Failed to load event pages.',
      onSettled: () => {
        this.loadingPages = false;
      },
      onSuccess: (r) => {
        this.pageOptions = [...(r.data ?? [])].sort(
          (a, b) => Number(b.isPublished) - Number(a.isPublished),
        );
      },
    },
  );

  private readonly loadItemAction = createAsyncAction(
    (id: string, itemId: string) =>
      this.service.getItems(id).pipe(
        map((r) => ({ itemId, r })),
      ),
    {
      toastErrors: true,
      errorFallback: 'Failed to load navigation item.',
      onSettled: () => {
        this.loading = false;
      },
      onSuccess: ({ itemId, r }) => {
        const item =
          r.data?.find((x) => x.id === itemId) ?? null;

        if (!item) {
          this.toastr.error('Navigation item not found.');
          return;
        }

        this.item = item;

        this.form.patchValue({
          label: item.label,
          pageId: item.pageId,
          isVisible: item.isVisible,
        });
      },
    },
  );

  private readonly updateItemAction = createAsyncAction(
    (
      id: string,
      itemId: string,
      payload: { label: string; pageId: string; isVisible: boolean },
    ) =>
      this.service.updateItem(id, itemId, payload).pipe(
        map((r) => ({ id, r })),
      ),
    {
      errorFallback: 'Failed to update navigation item.',
      onSettled: () => {
        this.saving = false;
      },
      onSuccess: ({ id, r }) => {
        this.toastr.success(r.message);

        this.router.navigate([
          '/organizer',
          id,
          'navigation',
        ]);
      },
    },
  );

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

    this.loadPagesAction.run(id);
    this.loadItemAction.run(id, itemId);
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

    this.updateItemAction.run(id, itemId, {
      label: v.label.trim(),
      pageId: v.pageId,
      isVisible: v.isVisible,
    });
  }

  cancel(): void {
    this.router.navigate([
      '/organizer',
      this.state.eventId(),
      'navigation',
    ]);
  }
}
