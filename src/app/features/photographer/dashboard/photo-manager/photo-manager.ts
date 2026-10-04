import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-photo-manager',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './photo-manager.html',
  styleUrl: './photo-manager.css'
})
export class PhotoManager implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal<string>('');
  readonly photos = signal<Photo[]>([]);
  readonly loading = signal(true);
  readonly deleting = signal<Record<string, boolean>>({});
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);

  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  readonly hasPreviousPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  ngOnInit() {
    const eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
      this.loadPhotos();
    }
  }

  loadPhotos() {
    this.loading.set(true);
    this.http.get<ApiResponse<PaginatedResponse<Photo>>>(
      `${environment.apiUrl}/events/${this.eventId()}/photos?page=${this.currentPage()}&pageSize=${this.pageSize()}&visibleOnly=false`
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
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPhotos();
    }
  }

  deletePhoto(photo: Photo) {
    if (!confirm(`Are you sure you want to delete "${photo.imageUrl}"? This action cannot be undone.`)) {
      return;
    }

    this.deleting.set({ ...this.deleting(), [photo.photoId]: true });

    this.http.delete<ApiResponse<object>>(
      `${environment.apiUrl}/events/${this.eventId()}/photos/${photo.photoId}`
    ).subscribe({
      next: (response) => {
        this.deleting.update(current => {
          const next = { ...current };
          delete next[photo.photoId];
          return next;
        });
        if (response.isSuccess) {
          this.photos.update(current => current.filter(p => p.photoId !== photo.photoId));
          this.totalCount.update(count => count - 1);
          this.notification.success('Photo deleted successfully.');
        } else {
          this.notification.error(response.message || 'Failed to delete photo.');
        }
      },
      error: () => {
        this.deleting.update(current => {
          const next = { ...current };
          delete next[photo.photoId];
          return next;
        });
        this.notification.error('Failed to delete photo.');
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}