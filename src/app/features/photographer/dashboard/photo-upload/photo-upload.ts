import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ArrowLeft,
  Images,
  Upload,
  Plus,
  X,
  LoaderCircle,
  LucideAngularModule,
} from 'lucide-angular';

import { NotificationService } from '../../../../core/services/ui/notification.service';
import { PhotoService } from '@/core/services/photo/photo.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './photo-upload.html',
  styleUrl: './photo-upload.css',
})
export class PhotoUpload implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotoService);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal<string>('');
  readonly photos = signal<File[]>([]);
  readonly uploading = signal<Record<string, boolean>>({});
  readonly uploadProgress = signal<Record<string, number>>({});
  readonly dragActive = signal(false);

  readonly canUpload = computed(() => this.photos().length > 0);

  readonly allUploadsComplete = computed(() => {
    const photos = this.photos();

    return photos.length > 0 && photos.every((_, index) => !this.uploading()[index.toString()]);
  });

  readonly isUploading = computed(() => Object.values(this.uploading()).some(Boolean));

  readonly icons = {
    ArrowLeft,
    Images,
    Upload,
    Plus,
    X,
    LoaderCircle,
  };

  ngOnInit(): void {
    const eventId =
      this.route.parent?.snapshot.paramMap.get('eventId') ??
      this.route.snapshot.paramMap.get('eventId');

    if (eventId) {
      this.eventId.set(eventId);
    } else {
      this.notification.error('Event ID was not found.');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);

    const files = event.dataTransfer?.files;

    if (files?.length) {
      this.addFiles(Array.from(files));
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private addFiles(files: File[]): void {
    const maxFiles = 30;
    const maxSize = 10 * 1024 * 1024;
    let currentFiles = this.photos();

    for (const file of files) {
      if (currentFiles.length >= maxFiles) {
        this.notification.error(`Maximum ${maxFiles} files allowed.`);
        break;
      }

      if (!file.type.startsWith('image/')) {
        this.notification.error(`${file.name} is not an image file.`);
        continue;
      }

      if (file.size > maxSize) {
        this.notification.error(`${file.name} exceeds the 10 MB size limit.`);
        continue;
      }

      currentFiles = [...currentFiles, file];
    }

    this.photos.set(currentFiles);
  }

  removePhoto(index: number): void {
    this.photos.update((files) => files.filter((_, i) => i !== index));
  }

  async uploadPhotos(): Promise<void> {
    const eventId = this.eventId();
    const files = this.photos();

    if (!eventId) {
      this.notification.error('Event ID is missing.');
      return;
    }

    if (files.length === 0 || this.isUploading()) {
      return;
    }

    const failedFiles: File[] = [];
    let successCount = 0;

    for (const [index, file] of files.entries()) {
      const key = index.toString();

      this.uploading.update((current) => ({
        ...current,
        [key]: true,
      }));

      this.uploadProgress.update((current) => ({
        ...current,
        [key]: 0,
      }));

      try {
        const response = await firstValueFrom(this.photoService.uploadPhoto(eventId, file));

        if (!response.isSuccess || !response.data?.imageUrl) {
          throw new Error(response.message || 'Upload failed.');
        }

        successCount++;
        this.notification.success(`${file.name} uploaded successfully.`);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        failedFiles.push(file);
        this.notification.error(`Failed to upload ${file.name}.`);
      } finally {
        this.uploading.update((current) => ({
          ...current,
          [key]: false,
        }));
      }
    }

    this.photos.set(failedFiles);
    this.uploadProgress.set({});
    this.uploading.set({});

    if (failedFiles.length === 0) {
      this.notification.success(`${successCount} photo(s) uploaded successfully.`);
    } else {
      this.notification.error(
        `${successCount} uploaded; ${failedFiles.length} failed. You can retry the failed files.`,
      );
    }
  }

  cancelUpload(): void {
    if (this.isUploading()) {
      return;
    }

    this.photos.set([]);
    this.uploadProgress.set({});
    this.uploading.set({});
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
