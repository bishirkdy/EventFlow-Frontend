import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { environment } from '../../../../../environments/environment';

interface Photo {
  photoId: string;
  eventId: string;
  photographerId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isVisible: boolean;
  uploadedAt: string;
  approvedAt?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.html',
  styleUrl: './photo-gallery.css'
})
export class PhotoGallery implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal<string>('');
  readonly photos = signal<Photo[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly pageSize = signal(24);
  readonly totalCount = signal(0);

  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  readonly hasPreviousPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalCount()));
  readonly startItem = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
      this.loadPhotos();
    }
  }

  loadPhotos() {
    this.loading.set(true);
    this.http.get<any>(
      `${environment.apiUrl}/events/${this.eventId()}/photos?page=${this.currentPage()}&pageSize=${this.pageSize()}&visibleOnly=true`
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.photos.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load photos.');
      }
    });
  }

  onPageChange(page: number) {
    const totalPages = Math.ceil(this.totalCount() / this.pageSize());
    if (page >= 1 && page <= totalPages) {
      this.currentPage.set(page);
      this.loadPhotos();
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1); // ellipsis
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1); // ellipsis
      pages.push(total);
    }

    return pages;
  }

  openPhoto(photo: Photo) {
    // Navigate to photo detail or open in modal
    window.open(photo.imageUrl, '_blank');
  }

  trackByPhotoId(index: number, photo: Photo): string {
    return photo.photoId;
  }
}