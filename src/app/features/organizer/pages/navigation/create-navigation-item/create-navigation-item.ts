import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../core/models/event-page';
import { createAsyncAction } from '@/core/state';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';

@Component({
  selector: 'app-create-navigation-item',
  standalone: true,
  imports: [ReactiveFormsModule, CapitalizePipe],
  templateUrl: './create-navigation-item.html',
  styleUrl: './create-navigation-item.css'
})
export class CreateNavigationItem implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(NavigationItemService);
  private readonly pages = inject(EventPageService);
  private readonly state = inject(OrganizerEventStateService);
  private readonly toastr = inject(NotificationService);

  readonly pageOptions = signal<EventPageModel[]>([]);
  readonly loadingPages = signal(true);
  readonly saving = signal(false);

  private readonly loadPagesAction = createAsyncAction(
    (id: string) => this.pages.getManagePages(id),
    {
      toastErrors: true,
      errorFallback: 'Failed to load event pages.',
      onSettled: () => {
        this.loadingPages.set(false);
      },
      onSuccess: (r) => {
        this.pageOptions.set(
          [...(r.data ?? [])].sort((a, b) => Number(b.isPublished) - Number(a.isPublished))
        );
      }
    }
  );

  private readonly createItemAction = createAsyncAction(
    (id: string, payload: { label: string; pageId: string }) =>
      this.service.createItem(id, payload).pipe(map((r) => ({ id, r }))),
    {
      errorFallback: 'Failed to create navigation item.',
      onSettled: () => {
        this.saving.set(false);
      },
      onSuccess: ({ id, r }) => {
        this.toastr.success(r.message);

        this.router.navigate(['/organizer', id, 'navigation']);
      }
    }
  );

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(100)]],
    pageId: ['', Validators.required]
  });

  ngOnInit(): void {
    const id = this.state.eventId();

    if (!id) {
      this.toastr.error('Event information is missing.');
      this.loadingPages.set(false);
      return;
    }

    this.loadPagesAction.run(id);
  }

  submit(): void {
    const id = this.state.eventId();

    if (this.form.invalid || !id) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    this.saving.set(true);

    this.createItemAction.run(id, {
      label: v.label.trim(),
      pageId: v.pageId
    });
  }

  cancel(): void {
    this.router.navigate(['/organizer', this.state.eventId(), 'navigation']);
  }
}
