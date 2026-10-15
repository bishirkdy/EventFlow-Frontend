import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../core/models/event-page';
import { NavigationItemByPageModel } from '../../../../../core/models/navigation-item';
import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-page-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './page-details.html',
  styleUrl: './page-details.css',
})
export class PageDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly pageService = inject(EventPageService);
  private readonly navigationItemService = inject(NavigationItemService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(NotificationService);

  readonly page = signal<EventPageModel | null>(null);
  readonly navigationItem = signal<NavigationItemByPageModel | null>(null);

  readonly showNavigationForm = signal(false);

  private pageId = '';
  private eventId = '';

  private readonly loadPageAction = createAsyncAction(
    () => this.pageService.getManagePageById(this.eventId, this.pageId),
    {
      toastErrors: true,
      errorFallback: 'Failed to load page.',
      onSuccess: (r) => {
        if (!r.data) {
          this.toastr.error('Page not found.');
          return;
        }

        this.page.set(r.data);
      },
    },
  );

  private readonly loadNavigationAction = createAsyncAction(
    () => this.navigationItemService.getItemByPage(this.pageId),
    {
      onError: () => this.navigationItem.set(null),
      onSuccess: (r) => this.navigationItem.set(r.data ?? null),
    },
  );

  private readonly updateNavigationAction = createAsyncAction(
    (label: string) =>
      this.navigationItemService.updateItem(this.eventId, this.navigationItem()?.id ?? '', {
        label,
        pageId: this.pageId,
        isVisible: this.navigationItem()?.isVisible ?? true,
      }),
    {
      errorFallback: 'Failed to update navigation.',
      onSettled: () => this.navigationSaving.set(false),
      onSuccess: (r) => {
        this.showNavigationForm.set(false);
        this.toastr.success(r.message);
        this.loadNavigation();
      },
    },
  );

  private readonly createNavigationAction = createAsyncAction(
    (label: string) =>
      this.navigationItemService.createItem(this.eventId, {
        label,
        pageId: this.pageId,
      }),
    {
      errorFallback: 'Failed to add page to navigation.',
      onSettled: () => this.navigationSaving.set(false),
      onSuccess: (r) => {
        this.showNavigationForm.set(false);
        this.toastr.success(r.message);
        this.loadNavigation();
      },
    },
  );

  private readonly removeNavigationAction = createAsyncAction(
    () => this.navigationItemService.deleteItem(this.eventId, this.navigationItem()?.id ?? ''),
    {
      errorFallback: 'Failed to remove page from navigation.',
      onSuccess: (r) => {
        this.toastr.success(r.message);
        this.navigationItem.set(null);
      },
    },
  );

  readonly loading = this.loadPageAction.pending;
  readonly navigationLoading = this.loadNavigationAction.pending;
  readonly navigationSaving = signal(false);

  readonly navigationForm = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    this.pageId = this.route.snapshot.paramMap.get('pageId') ?? '';

    this.eventId =
      this.eventState.eventId() ??
      this.route.parent?.parent?.snapshot.paramMap.get('eventId') ??
      '';

    if (!this.pageId || !this.eventId) {
      this.toastr.error('Page information is missing.');
      return;
    }

    this.loadPage();
    this.loadNavigation();
  }

  loadPage(): void {
    this.loadPageAction.run();
  }

  editPage(): void {
    this.router.navigate(['/organizer', this.eventId, 'pages', this.pageId, 'edit']);
  }

  viewSection(): void {
    this.router.navigate(['/organizer', this.eventId, 'pages', this.pageId, 'sections']);
  }

  backToPages(): void {
    this.router.navigate(['/organizer', this.eventId, 'pages']);
  }

  loadNavigation(): void {
    this.loadNavigationAction.run();
  }

  addToNavigation(): void {
    const page = this.page();

    if (!page) {
      return;
    }

    this.showNavigationForm.set(true);
    this.navigationForm.reset({
      label: page.name,
    });
  }

  editNavigation(): void {
    const item = this.navigationItem();

    if (!item) {
      return;
    }

    this.showNavigationForm.set(true);
    this.navigationForm.reset({
      label: item.label,
    });
  }

  cancelNavigation(): void {
    this.showNavigationForm.set(false);
    this.navigationForm.reset({
      label: '',
    });
  }

  saveNavigation(): void {
    if (this.navigationSaving() || this.navigationForm.invalid) {
      this.navigationForm.markAllAsTouched();
      return;
    }

    const value = this.navigationForm.getRawValue();
    const existing = this.navigationItem();

    this.navigationSaving.set(true);

    if (existing) {
      this.updateNavigationAction.run(value.label.trim());
    } else {
      this.createNavigationAction.run(value.label.trim());
    }
  }

  removeFromNavigation(): void {
    const item = this.navigationItem();

    if (!item || !confirm('Remove this page from navigation?')) {
      return;
    }

    this.removeNavigationAction.run();
  }
}
