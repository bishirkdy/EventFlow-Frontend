import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { ApiResponse } from '../../../../core/models/common/api-response';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './photo-upload.html',
  styleUrl: './photo-upload.css'
})
export class PhotoUpload implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal<string>('');
  readonly photos = signal<File[]>([]);
  readonly uploading = signal<Record<string, boolean>>({});
  readonly uploadProgress = signal<Record<string, number>>({});
  readonly dragActive = signal(false);
  readonly selectedFiles = signal<FileList | null>(null);

  readonly canUpload = computed(() => this.photos().length > 0);
  readonly allUploadsComplete = computed(() => {
    const photos = this.photos();
    if (photos.length === 0) return false;
    return photos.every((_, index) => !this.uploading()[index.toString()]);
  });

  readonly isUploading = computed(() => Object.values(this.uploading()).some(v => v));

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);

    if (event.dataTransfer?.files) {
      this.onFilesSelected({
        target: { files: event.dataTransfer.files }
      } as unknown as Event);
    }
  }

  ngOnInit() {
    const eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      const maxFiles = 20;
      const maxSize = 10 * 1024 * 1024; // 10MB

      for (const file of newFiles) {
        if (this.photos().length >= maxFiles) {
          this.notification.error(`Maximum ${maxFiles} files allowed.`);
          break;
        }

        if (!file.type.startsWith('image/')) {
          this.notification.error(`${file.name} is not an image file.`);
          continue;
        }

        if (file.size > maxSize) {
          this.notification.error(`${file.name} exceeds 10MB size limit.`);
          continue;
        }

        this.photos.update(current => [...current, file]);
      }

      // Clear input
      const fileInput = event.target as HTMLInputElement;
      fileInput.value = '';
    }
  }

  removePhoto(index: number) {
    this.photos.update(current => current.filter((_, i) => i !== index));
  }

  async uploadPhotos() {
    if (this.photos().length === 0) return;

    for (let i = 0; i < this.photos().length; i++) {
      const file = this.photos()[i];
      const key = i.toString();
      this.uploading.update(current => ({ ...current, [key]: true }));
      this.uploadProgress.update(current => ({ ...current, [key]: 0 }));

      try {
        const formData = new FormData();
        formData.append('image', file);

        // Upload the file; the API stores it in Cloudinary and records the photo.
        const response = await firstValueFrom(
          this.http.post<ApiResponse<{ photoId: string; imageUrl: string; uploadedAt: string }>>(
            `${environment.apiUrl}/events/${this.eventId()}/photos`,
            formData
          )
        );

        if (response.isSuccess && response.data?.imageUrl) {
          this.notification.success(`${file.name} uploaded successfully.`);
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        this.notification.error(`Failed to upload ${file.name}`);
      } finally {
        this.uploading.update(current => ({ ...current, [key]: false }));
      }
    }

    this.photos.set([]);
    this.notification.success('All photos uploaded successfully!');
  }

  cancelUpload() {
    this.photos.set([]);
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}