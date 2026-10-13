import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  ArrowLeft,
  Images,
  Upload,
  Eye,
  Clock,
  LoaderCircle,
  CalendarDays,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LucideAngularModule,
} from 'lucide-angular';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { PhotoService } from '@/core/services/photo/photo.service';

@Component({
  selector: 'app-photo-manager',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './photo-manager.html',
  styleUrl: './photo-manager.css',
})
export class PhotoManager implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotoService);
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

  ngOnInit(): void {
    const eventId =
      this.route.parent?.snapshot.paramMap.get('eventId') ??
      this.route.snapshot.paramMap.get('eventId');

    if (!eventId) {
      this.loading.set(false);
      this.notification.error('Event ID was not found.');
      return;
    }

    this.eventId.set(eventId);
    this.loadPhotos();
  }

  readonly icons = {
    ArrowLeft,
    Images,
    Upload,
    Eye,
    Clock,
    LoaderCircle,
    CalendarDays,
    Trash2,
    ChevronLeft,
    ChevronRight,
  };

  loadPhotos(): void {
    this.loading.set(true);

    this.photoService.getPhotos(this.eventId(), this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.photos.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
        } else {
          this.photos.set([]);
          this.totalCount.set(0);
          this.notification.error(response.message || 'Failed to load photos.');
        }

        this.loading.set(false);
      },
      error: () => {
        this.photos.set([]);
        this.totalCount.set(0);
        this.loading.set(false);
        this.notification.error('Failed to load photos.');
      },
    });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadPhotos();
  }

  deletePhoto(photo: Photo): void {
    if (this.deleting()[photo.photoId]) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete this photo? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    this.deleting.update((current) => ({
      ...current,
      [photo.photoId]: true,
    }));

    this.photoService.deletePhoto(this.eventId(), photo.photoId).subscribe({
      next: (response) => {
        this.deleting.update((current) => {
          const next = { ...current };
          delete next[photo.photoId];
          return next;
        });

        if (!response.isSuccess) {
          this.notification.error(response.message || 'Failed to delete photo.');
          return;
        }

        this.photos.update((current) => current.filter((item) => item.photoId !== photo.photoId));

        this.totalCount.update((count) => Math.max(0, count - 1));

        this.notification.success('Photo deleted successfully.');

        if (this.photos().length === 0 && this.currentPage() > 1) {
          this.currentPage.update((page) => page - 1);
          this.loadPhotos();
        }
      },
      error: () => {
        this.deleting.update((current) => {
          const next = { ...current };
          delete next[photo.photoId];
          return next;
        });

        this.notification.error('Failed to delete photo.');
      },
    });
  }

  readonly visibleCount = computed(() => this.photos().filter((photo) => photo.isVisible).length);

  readonly pendingCount = computed(() => this.photos().filter((photo) => !photo.isVisible).length);

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
