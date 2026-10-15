import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/ui/notification.service';
import { PhotoService } from '@/core/services/photo/photo.service';
import {
  LucideAngularModule,
  ChevronLeft,
  ChevronRight,
  Images,
  Maximize2,
  ArrowLeft,
  ScanFace,
} from 'lucide-angular';
import { Photo } from '@/core/models/photographer';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './photo-gallery.html',
})
export class PhotoGallery implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);
  private readonly photoService = inject(PhotoService);

  readonly eventId = signal('');
  readonly photos = signal<Photo[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(24);
  readonly totalCount = signal(0);

  readonly Images = Images;
  readonly Maximize2 = Maximize2;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly ArrowLeft = ArrowLeft;
  readonly ScanFace = ScanFace;

  private readonly loadAction = createAsyncAction(
    () => {
      const eventId = this.eventId();
      if (!eventId) {
        return of(null);
      }
      return this.photoService.getPhotos(eventId, this.currentPage(), this.pageSize(), true);
    },
    {
      toastErrors: true,
      errorFallback: 'Failed to load photos.',
      onError: () => {
        this.photos.set([]);
        this.totalCount.set(0);
      },
      onSuccess: (response) => {
        if (response && response.isSuccess && response.data) {
          this.photos.set(response.data.items ?? []);
          this.totalCount.set(response.data.totalCount ?? 0);
          return;
        }

        if (response) {
          this.photos.set([]);
          this.totalCount.set(0);
          this.notification.error('Unable to load photos for this event.');
        }
      },
    },
  );

  readonly loading = this.loadAction.pending;

  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  readonly hasPreviousPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  readonly startItem = computed(() =>
    this.totalCount() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1,
  );

  readonly endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalCount()),
  );

  readonly skeletonSlots = Array.from({ length: 12 }, (_, i) => i);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.notification.error('Event ID was not found');
      return;
    }

    this.eventId.set(eventId);
    this.loadPhotos();
  }

  loadPhotos(): void {
    if (!this.eventId()) {
      return;
    }

    this.loadAction.run();
  }

  onPageChange(page: number): void {
    if (this.loading() || page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadPhotos();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let page = 1; page <= total; page++) {
        pages.push(page);
      }

      return pages;
    }

    pages.push(1);

    if (current > 3) {
      pages.push(-1);
    }

    for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
      pages.push(page);
    }

    if (current < total - 2) {
      pages.push(-1);
    }

    pages.push(total);

    return pages;
  }

  openPhoto(photo: Photo): void {
    if (!photo.imageUrl) {
      this.notification.error('Photo URL is unavailable.');
      return;
    }

    window.open(photo.imageUrl, '_blank', 'noopener,noreferrer');
  }

  trackByPhotoId(_index: number, photo: Photo): string {
    return photo.photoId;
  }
}
