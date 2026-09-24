import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationItemService } from '../../../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../../../services/organizer-event-state.service';
import { EventPageService } from '../../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../../core/models/event-page/event-page.model';

@Component({
  selector: 'app-create-navigation-item',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-navigation-item.html',
  styleUrl: './create-navigation-item.css',
})
export class CreateNavigationItem implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navigationItemService = inject(NavigationItemService);
  private readonly eventPageService = inject(EventPageService);
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly toastr = inject(ToastrService);

  readonly menuId = this.route.snapshot.paramMap.get('menuId') ?? '';
  readonly pages: EventPageModel[] = [];
  pageOptions: EventPageModel[] = [];
  loadingPages = true;
  saving = false;

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(100)]],
    targetType: ['page' as 'page' | 'url'],
    pageId: [''],
    url: [''],
    displayOrder: [0, [Validators.required, Validators.min(0)]],
    openInNewTab: [false],
  });

  ngOnInit(): void {
    const eventId = this.eventState.eventId();
    if (!eventId || !this.menuId) {
      this.toastr.error('Event and navigation menu are required.');
      return;
    }
    this.eventPageService.getPages(eventId).subscribe({
      next: (response) => {
        this.pageOptions = (response.data ?? []).filter(page => page.isPublished);
        this.loadingPages = false;
      },
      error: () => { this.loadingPages = false; this.toastr.error('Failed to load event pages.'); },
    });
  }

  submit(): void {
    if (this.form.invalid || !this.menuId) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.targetType === 'page' && !value.pageId) { this.toastr.error('Select a page.'); return; }
    if (value.targetType === 'url' && !value.url.trim()) { this.toastr.error('Enter a URL.'); return; }
    this.saving = true;
    const request = {
      label: value.label.trim(),
      url: value.targetType === 'url' ? value.url.trim() : null,
      pageId: value.targetType === 'page' ? value.pageId : null,
      displayOrder: value.displayOrder,
      openInNewTab: value.openInNewTab,
    };
    this.navigationItemService.createItem(this.menuId, request).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.router.navigate(['/organizer', this.eventState.eventId(), 'navigation-menus', this.menuId, 'items']);
      },
      error: (error: unknown) => { this.saving = false; this.toastr.error((error as any)?.error?.message || 'Failed to create navigation item.'); },
    });
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.eventState.eventId(), 'navigation-menus', this.menuId, 'items']);
  }
}
