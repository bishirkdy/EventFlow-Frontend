import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { NavigationItemService } from '../../../../../core/services/navigation-item/navigation-item.service';
import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { EventPageModel } from '../../../../../core/models/event-page/event-page.model';

@Component({
  selector: 'app-create-navigation-item',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-navigation-item.html',
  styleUrl: './create-navigation-item.css',
})
export class CreateNavigationItem implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(NavigationItemService);
  private readonly pages = inject(EventPageService);
  private readonly state = inject(OrganizerEventStateService);
  private readonly toastr = inject(NotificationService);

  pageOptions: EventPageModel[] = [];
  loadingPages = true;
  saving = false;

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(100)]],
    pageId: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.state.eventId();

    if (!id) {
      this.toastr.error('Event information is missing.');
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
  }

  submit(): void {
    const id = this.state.eventId();

    if (this.form.invalid || !id) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    this.saving = true;

    this.service
      .createItem(id, {
        label: v.label.trim(),
        pageId: v.pageId,
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
              'Failed to create navigation item.'
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

    return r?.errors?.join(' ') || r?.message || fallback;
  }
}