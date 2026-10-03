import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from 'core/services/ui/notification.service';
import { environment } from 'environments/environment';
import { PhotoCardComponent, Photo } from './photo-card/photo-card.component';

export type { Photo } from './photo-card/photo-card.component';

interface PaginatedResponse<T> {
  items: Photo[];
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
  selector: 'app-photo-moderation',
  standalone: true,
  imports: [CommonModule, PhotoCardComponent],
  templateUrl: './photo-moderation-grid.html',
  styleUrl: './photo-moderation-grid.css'
})
export class PhotoModerationGrid implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal<string>('');
  readonly photos = signal<Photo[]>([]);
  readonly loading = signal(true);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly filterStatus = signal<'all' | 'visible' | 'hidden'>('all');

  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  readonly hasPreviousPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly skeletonSlots = Array.from({ length: 12 }, (_, i) => i);

  ngOnInit() {
    const eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
      this.loadPhotos();
    }
  }

  loadPhotos() {
    this.loading.set(true);
    const statusParam = this.filterStatus() === 'all' ? '' : `&visibleOnly=${this.filterStatus() === 'visible'}`;
    this.http.get<any>(
      `${environment.apiUrl}/events/${this.eventId()}/photos?page=${this.currentPage()}&pageSize=${this.pageSize()}${statusParam}`
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
      }
    });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPhotos();
    }
  }

  onFilterChange(status: 'all' | 'visible' | 'hidden') {
    this.filterStatus.set(status);
    this.currentPage.set(1);
    this.loadPhotos();
  }

  toggleVisibility(photo: Photo) {
    const newVisibility = !photo.isVisible;
    this.http.patch<any>(
      `${environment.apiUrl}/events/${this.eventId()}/photos/${photo.photoId}/visibility`,
      { isVisible: newVisibility }
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.photos.update(current =>
            current.map(p => p.photoId === photo.photoId ? { ...p, isVisible: newVisibility } : p)
          );
        } else {
          alert(response.message || 'Failed to update visibility.');
        }
      },
      error: () => {
        alert('Failed to update visibility.');
      }
    });
  }

  deletePhoto(photo: Photo) {
    if (!confirm(`Are you sure you want to delete this photo? This action cannot be undone.`)) {
      return;
    }

    this.http.delete<any>(
      `${environment.apiUrl}/events/${this.eventId()}/photos/${photo.photoId}`
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.photos.update(current => current.filter(p => p.photoId !== photo.photoId));
          this.totalCount.update(count => count - 1);
        } else {
          alert(response.message || 'Failed to delete photo.');
        }
      },
      error: () => {
        alert('Failed to delete photo.');
      }
    });
  }

  openPhoto(photo: Photo) {
    window.open(photo.imageUrl, '_blank');
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

  trackByPhotoId(index: number, photo: Photo): string {
    return photo.photoId;
  }
}