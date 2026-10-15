import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, map } from 'rxjs';
import { NotificationService } from 'core/services/ui/notification.service';
import { OrganizerEventStateService } from '@/features/organizer/services/organizer-event-state.service';
import { PhotoService } from '@/core/services/photo/photo.service';
import { createAsyncAction } from 'core/state';

import {
  Images,
  ChevronLeft,
  ChevronRight,
  LucideAngularModule,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-angular';
import { Photo } from '@/core/models/photographer';

@Component({
  selector: 'app-photo-moderation',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './photo-moderation-grid.html',
})
export class PhotoModerationGrid implements OnInit {
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly photoService = inject(PhotoService);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal('');
  readonly photos = signal<Photo[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly filterStatus = signal<'all' | 'visible' | 'hidden'>('all');
  readonly selectedPhotoIds = signal<Set<string>>(new Set());

  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  readonly hasPreviousPage = computed(() => this.currentPage() > 1);
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  readonly allSelected = computed(
    () =>
      this.photos().length > 0 &&
      this.photos().every((photo) => this.selectedPhotoIds().has(photo.photoId)),
  );

  readonly skeletonSlots = Array.from({ length: 12 }, (_, i) => i);

  readonly icons = {
    Images,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Eye,
    EyeOff,
    RefreshCw,
  };

  private readonly loadAction = createAsyncAction(
    () => {
      const status = this.filterStatus();
      const visibleOnly = status === 'all' ? undefined : status === 'visible';

      return this.photoService.getPhotos(
        this.eventId(),
        this.currentPage(),
        this.pageSize(),
        visibleOnly,
      );
    },
    {
      errorFallback: 'Failed to load photos.',
      onError: () => {
        this.photos.set([]);
        this.totalCount.set(0);
        this.notification.error('Failed to load photos.');
      },
      onSuccess: (response) => {
        if (response.isSuccess && response.data) {
          this.photos.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
          return;
        }

        this.photos.set([]);
        this.totalCount.set(0);
        this.notification.error(response.message || 'Failed to load photos.');
      },
    },
  );

  private readonly toggleVisibilityAction = createAsyncAction(
    (photo: Photo, newVisibility: boolean) =>
      this.photoService.toggleVisibility(this.eventId(), photo.photoId, newVisibility).pipe(
        map((response) => ({ photo, newVisibility, response })),
      ),
    {
      errorFallback: 'Failed to update visibility.',
      onSuccess: ({ photo, newVisibility, response }) => {
        if (!response.isSuccess) {
          this.notification.error(response.message || 'Failed to update visibility.');
          return;
        }

        const status = this.filterStatus();

        if ((status === 'visible' && !newVisibility) || (status === 'hidden' && newVisibility)) {
          this.photos.update((current) => current.filter((item) => item.photoId !== photo.photoId));

          this.totalCount.update((count) => Math.max(0, count - 1));
        } else {
          this.photos.update((current) =>
            current.map((item) =>
              item.photoId === photo.photoId ? { ...item, isVisible: newVisibility } : item,
            ),
          );
        }
      },
    },
  );

  private readonly bulkVisibilityAction = createAsyncAction(
    (targets: Photo[], isVisible: boolean) =>
      forkJoin(
        targets.map((photo) =>
          this.photoService.toggleVisibility(this.eventId(), photo.photoId, isVisible),
        ),
      ).pipe(map((responses) => ({ targets, isVisible, responses }))),
    {
      errorFallback: 'Failed to update some photos. Refreshing the list.',
      onError: () => {
        this.clearSelection();
        this.loadPhotos();
      },
      onSuccess: ({ targets, isVisible, responses }) => {
        const failed = responses.some((response) => !response.isSuccess);

        if (failed) {
          this.notification.error('Some photos could not be updated. Refreshing the list.');
          this.clearSelection();
          this.loadPhotos();
          return;
        }

        const updatedIds = new Set(targets.map((photo) => photo.photoId));

        this.photos.update((current) =>
          current.map((photo) => (updatedIds.has(photo.photoId) ? { ...photo, isVisible } : photo)),
        );

        this.clearSelection();
        this.notification.success(`Updated ${targets.length} photo(s).`);
      },
    },
  );

  private readonly deleteAction = createAsyncAction(
    (photoId: string) => this.photoService.deletePhoto(this.eventId(), photoId).pipe(
      map((response) => ({ photoId, response })),
    ),
    {
      errorFallback: 'Failed to delete photo.',
      onSuccess: ({ photoId, response }) => {
        if (response.isSuccess) {
          this.photos.update((current) => current.filter((item) => item.photoId !== photoId));

          this.selectedPhotoIds.update((current) => {
            const next = new Set(current);
            next.delete(photoId);
            return next;
          });

          this.totalCount.update((count) => Math.max(0, count - 1));
        } else {
          this.notification.error(response.message || 'Failed to delete photo.');
        }
      },
    },
  );

  readonly loading = this.loadAction.pending;

  ngOnInit(): void {
    const id = this.eventState.eventId();

    if (id) {
      this.eventId.set(id);
      this.loadPhotos();
    }
  }

  loadPhotos(): void {
    this.loadAction.run();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;

    this.clearSelection();
    this.currentPage.set(page);
    this.loadPhotos();
  }

  onFilterChange(status: 'all' | 'visible' | 'hidden'): void {
    this.filterStatus.set(status);
    this.currentPage.set(1);
    this.clearSelection();
    this.loadPhotos();
  }

  togglePhotoSelection(photoId: string, checked: boolean): void {
    this.selectedPhotoIds.update((current) => {
      const next = new Set(current);

      if (checked) {
        next.add(photoId);
      } else {
        next.delete(photoId);
      }

      return next;
    });
  }

  toggleSelectAll(checked: boolean): void {
    this.selectedPhotoIds.update((current) => {
      const next = new Set(current);

      for (const photo of this.photos()) {
        if (checked) {
          next.add(photo.photoId);
        } else {
          next.delete(photo.photoId);
        }
      }

      return next;
    });
  }

  clearSelection(): void {
    this.selectedPhotoIds.set(new Set());
  }

  toggleVisibility(photo: Photo): void {
    this.toggleVisibilityAction.run(photo, !photo.isVisible);
  }

  bulkSetVisibility(isVisible: boolean): void {
    const selectedIds = [...this.selectedPhotoIds()];

    const targets = this.photos().filter(
      (photo) => selectedIds.includes(photo.photoId) && photo.isVisible !== isVisible,
    );

    if (targets.length === 0) {
      this.clearSelection();
      return;
    }

    this.bulkVisibilityAction.run(targets, isVisible);
  }

  deletePhoto(photo: Photo): void {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    this.deleteAction.run(photo.photoId);
  }

  openPhoto(photo: Photo): void {
    window.open(photo.imageUrl, '_blank', 'noopener,noreferrer');
  }

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
