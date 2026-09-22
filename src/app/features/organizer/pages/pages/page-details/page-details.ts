import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../core/models/event-page/event-page.model';

import { NavigationItemByPageModel } from '../../../../../core/models/navigation-item/navigation-item-bypage.model';
import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';

import { NavigationMenuModel } from '../../../../../core/models/navigation-menu/navigation-menu.model';
import { NavigationMenuService } from '../../../../../core/services/navigation-menu/navigation-menu.service';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';

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
  private readonly navigationMenuService = inject(NavigationMenuService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  readonly page = signal<EventPageModel | null>(null);

  readonly navigationItem =
    signal<NavigationItemByPageModel | null>(null);

  readonly navigationMenus =
    signal<NavigationMenuModel[]>([]);

  readonly loading = signal(true);
  readonly navigationLoading = signal(false);
  readonly navigationSaving = signal(false);
  readonly showNavigationForm = signal(false);

  private pageId = '';
  private eventId = '';

  readonly navigationForm = this.fb.nonNullable.group({
    navigationMenuId: ['', Validators.required],
    label: [
      '',
      [
        Validators.required,
        Validators.maxLength(200),
      ],
    ],
    displayOrder: [
      0,
      [
        Validators.required,
        Validators.min(0),
      ],
    ],
    openInNewTab: [false],
  });

ngOnInit(): void {
  this.pageId =
    this.route.snapshot.paramMap.get('pageId') ?? '';

  this.eventId =
    this.eventState.eventId() ?? '';

  if (!this.pageId || !this.eventId) {
    this.toastr.error('Page information is missing.');
    this.loading.set(false);
    return;
  }

  this.loadPage();
  this.loadNavigation();
}

  // ============================================
  // PAGE
  // ============================================

  loadPage(): void {
    this.loading.set(true);

    this.pageService
      .getPageById(this.eventId, this.pageId)
      .subscribe({
        next: (response) => {
          if (!response.data) {
            this.toastr.error(
              'Page not found.',
            );

            this.loading.set(false);
            return;
          }

          this.page.set(response.data);
          this.loading.set(false);
        },

        error: () => {
          this.loading.set(false);

          this.toastr.error(
            'Failed to load page.',
          );
        },
      });
  }

  editPage(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'pages',
      this.pageId,
      'edit',
    ]);
  }

  viewSection(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'pages',
      this.pageId,
      'sections',
    ]);
  }

  backToPages(): void {
    this.router.navigate([
      '/organizer',
      this.eventId,
      'pages',
    ]);
  }

  // ============================================
  // NAVIGATION
  // ============================================

  loadNavigation(): void {
    this.navigationItemService
      .getItemByPage(this.pageId)
      .subscribe({
        next: (response) => {
          this.navigationItem.set(
            response.data ?? null,
          );
        },

        error: () => {
          this.navigationItem.set(null);

          this.toastr.error(
            'Failed to load navigation information.',
          );
        },
      });
  }

  addToNavigation(): void {
    const currentPage = this.page();

    if (!currentPage) {
      return;
    }

    this.showNavigationForm.set(true);

    this.navigationForm.reset({
      navigationMenuId: '',
      label: currentPage.name,
      displayOrder: currentPage.displayOrder,
      openInNewTab: false,
    });

    this.loadNavigationMenus();
  }

  editNavigation(): void {
    const item = this.navigationItem();

    if (!item) {
      return;
    }

    this.showNavigationForm.set(true);

    this.navigationForm.reset({
      navigationMenuId: item.navigationMenuId,
      label: item.label,
      displayOrder: item.displayOrder,
      openInNewTab: item.openInNewTab,
    });

    this.loadNavigationMenus();
  }

  cancelNavigation(): void {
    this.showNavigationForm.set(false);

    this.navigationForm.reset({
      navigationMenuId: '',
      label: '',
      displayOrder: 0,
      openInNewTab: false,
    });
  }

  loadNavigationMenus(): void {
    this.navigationLoading.set(true);

    this.navigationMenuService
      .getMenus(this.eventId)
      .subscribe({
        next: (response) => {
          const menus = response.data ?? [];

          this.navigationMenus.set(menus);
          this.navigationLoading.set(false);

          if (menus.length === 0) {
            this.toastr.info(
              'Create a navigation menu before adding this page.',
            );
          }
        },

        error: () => {
          this.navigationMenus.set([]);
          this.navigationLoading.set(false);

          this.toastr.error(
            'Failed to load navigation menus.',
          );
        },
      });
  }

  saveNavigation(): void {
    if (this.navigationSaving()) {
      return;
    }

    if (this.navigationForm.invalid) {
      this.navigationForm.markAllAsTouched();
      return;
    }

    const value =
      this.navigationForm.getRawValue();

    const existingItem =
      this.navigationItem();

    this.navigationSaving.set(true);

    if (existingItem) {
      this.updateNavigation(
        existingItem,
        value,
      );
    } else {
      this.createNavigation(value);
    }
  }

  private createNavigation(
    value: ReturnType<
      typeof this.navigationForm.getRawValue
    >,
  ): void {
    this.navigationItemService
      .createItem(
        value.navigationMenuId,
        {
          label: value.label,
          url: null,
          pageId: this.pageId,
          displayOrder: value.displayOrder,
          openInNewTab:
            value.openInNewTab,
        },
      )
      .subscribe({
        next: (response) => {
          this.toastr.success(
            response.message,
          );

          this.navigationSaving.set(false);
          this.showNavigationForm.set(false);

          this.loadNavigation();
        },

        error: () => {
          this.navigationSaving.set(false);

          this.toastr.error(
            'Failed to add page to navigation.',
          );
        },
      });
  }

  private updateNavigation(
    item: NavigationItemByPageModel,
    value: ReturnType<
      typeof this.navigationForm.getRawValue
    >,
  ): void {
    this.navigationItemService
      .updateItem(
        item.navigationMenuId,
        item.id,
        {
          label: value.label,
          url: null,
          pageId: this.pageId,
          displayOrder: value.displayOrder,
          openInNewTab:
            value.openInNewTab,
          isVisible: item.isVisible,
        },
      )
      .subscribe({
        next: (response) => {
          this.toastr.success(
            response.message,
          );

          this.navigationSaving.set(false);
          this.showNavigationForm.set(false);

          this.loadNavigation();
        },

        error: () => {
          this.navigationSaving.set(false);

          this.toastr.error(
            'Failed to update navigation.',
          );
        },
      });
  }

  removeFromNavigation(): void {
    const item = this.navigationItem();

    if (!item) {
      return;
    }

    if (
      !confirm(
        'Remove this page from navigation?',
      )
    ) {
      return;
    }

    this.navigationItemService
      .deleteItem(
        item.navigationMenuId,
        item.id,
      )
      .subscribe({
        next: (response) => {
          this.toastr.success(
            response.message,
          );

          this.navigationItem.set(null);
        },

        error: () => {
          this.toastr.error(
            'Failed to remove page from navigation.',
          );
        },
      });
  }
}