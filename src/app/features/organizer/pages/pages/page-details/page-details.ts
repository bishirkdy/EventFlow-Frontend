import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../core/models/event-page/event-page.model';
import { NavigationItemByPageModel } from '../../../../../core/models/navigation-item/navigation-item-bypage.model';
import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';
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
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  readonly page = signal<EventPageModel | null>(null);
  readonly navigationItem = signal<NavigationItemByPageModel | null>(null);

  readonly loading = signal(true);
  readonly navigationLoading = signal(false);
  readonly navigationSaving = signal(false);
  readonly showNavigationForm = signal(false);

  private pageId = '';
  private eventId = '';

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
      this.loading.set(false);
      return;
    }

    this.loadPage();
    this.loadNavigation();
  }

  loadPage(): void {
    this.loading.set(true);

    this.pageService.getPageById(this.eventId, this.pageId).subscribe({
      next: (r) => {
        if (!r.data) {
          this.toastr.error('Page not found.');
          this.loading.set(false);
          return;
        }

        this.page.set(r.data);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.toastr.error(this.apiMessage(e, 'Failed to load page.'));
      },
    });
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
    this.navigationLoading.set(true);

    this.navigationItemService.getItemByPage(this.pageId).subscribe({
      next: (r) => {
        this.navigationItem.set(r.data ?? null);
        this.navigationLoading.set(false);
      },
      error: () => {
        this.navigationItem.set(null);
        this.navigationLoading.set(false);
      },
    });
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
      this.navigationItemService
        .updateItem(this.eventId, existing.id, {
          label: value.label.trim(),
          pageId: this.pageId,
          isVisible: existing.isVisible,
        })
        .subscribe({
          next: (r) => {
            this.navigationSaving.set(false);
            this.showNavigationForm.set(false);
            this.toastr.success(r.message);
            this.loadNavigation();
          },
          error: (e) => {
            this.navigationSaving.set(false);
            this.toastr.error(this.apiMessage(e, 'Failed to update navigation.'));
          },
        });
    } else {
      this.navigationItemService
        .createItem(this.eventId, {
          label: value.label.trim(),
          pageId: this.pageId,
        })
        .subscribe({
          next: (r) => {
            this.navigationSaving.set(false);
            this.showNavigationForm.set(false);
            this.toastr.success(r.message);
            this.loadNavigation();
          },
          error: (e) => {
            this.navigationSaving.set(false);
            this.toastr.error(this.apiMessage(e, 'Failed to add page to navigation.'));
          },
        });
    }
  }

  removeFromNavigation(): void {
    const item = this.navigationItem();

    if (!item || !confirm('Remove this page from navigation?')) {
      return;
    }

    this.navigationItemService.deleteItem(this.eventId, item.id).subscribe({
      next: (r) => {
        this.toastr.success(r.message);
        this.navigationItem.set(null);
      },
      error: (e) => {
        this.toastr.error(this.apiMessage(e, 'Failed to remove page from navigation.'));
      },
    });
  }

  private apiMessage(error: unknown, fallback: string): string {
    const r = (
      error as {
        error?: {
          message?: string;
          errors?: string[];
        };
      }
    )?.error;

    return r?.errors?.join(' ') || r?.message || fallback;
  }
}
