import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EventPageService } from '../../../../../core/services/event-page/event-page.service';
import { OrganizerPageStateService } from '../../../../../core/services/organizer-page-state';
import { EventPageModel } from '../../../../../core/models/event-page/event-page.model';

@Component({
  selector: 'app-page-details',
  standalone: true,
  templateUrl: './page-details.html',
  styleUrl: './page-details.css',
})
export class PageDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pageService = inject(EventPageService);
  private readonly toastr = inject(ToastrService);

  readonly page = signal<EventPageModel | null>(null);
  readonly loading = signal(true);

  private pageId = '';
  private eventId = '';

  ngOnInit(): void {
    this.pageId = this.route.snapshot.paramMap.get('pageId') ?? '';
    this.eventId = this.route.parent?.parent?.snapshot.paramMap.get('eventId') ?? '';

    if (!this.pageId || !this.eventId) {
      this.toastr.error('Page information is missing.');
      this.loading.set(false);
      return;
    }

    this.loadPage();
  }

  loadPage(): void {
    this.loading.set(true);

    this.pageService.getPageById(this.eventId, this.pageId).subscribe({
      next: (response) => {
        const page = response.data;

        if (!page) {
          this.toastr.error('Page not found.');
          this.loading.set(false);
          return;
        }

        this.page.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load page.');
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
}
  