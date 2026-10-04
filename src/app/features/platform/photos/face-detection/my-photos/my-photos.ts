import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../../core/services/ui/notification.service';
import type { NotificationService as NotificationServiceType } from '../../../../../core/services/ui/notification.service';
import { FaceDetectionService } from '../face-detection.service';
import { environment } from '../../../../../../environments/environment';

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

interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

@Component({
  selector: 'app-my-photos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-photos.html',
  styleUrl: './my-photos.css'
})
export class MyPhotos implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly faceDetection = inject<FaceDetectionService>(FaceDetectionService);
  private readonly notification = inject<NotificationServiceType>(NotificationService);

  readonly eventId = signal<string>('');
  readonly allPhotos = signal<any[]>([]);
  readonly matchedPhotos = signal<any[]>([]);
  readonly loading = signal(true);
  readonly matching = signal(false);
  readonly hasFaceProfile = signal(false);

  readonly totalMatched = computed(() => this.matchedPhotos().length);
  readonly totalPhotos = computed(() => this.loading() ? 0 : this.allPhotos().length);

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
      this.loadEventPhotos(eventId);
      this.checkFaceProfile();
    }
  }

  private checkFaceProfile() {
    const descriptor = this.faceDetection.getUserFaceDescriptor();
    this.hasFaceProfile.set(descriptor !== null);

    // Also try async load
    this.faceDetection.loadUserFaceDescriptorAsync().then(descriptor => {
      this.hasFaceProfile.set(descriptor !== null);
    });
  }

  private loadEventPhotos(eventId: string) {
    // Load all pages of photos
    this.loadAllPages(eventId, 1);
  }

  private loadAllPages(eventId: string, page: number) {
    this.loading.set(true);
    this.http.get<any>(
      `${environment.apiUrl}/events/${eventId}/photos?page=${page}&pageSize=100&visibleOnly=true`
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.allPhotos.update(current => [...current, ...response.data.items]);
          if (response.data.hasNextPage) {
            // Keep the loading state on while subsequent pages stream in;
            // clearing it here made the counter jump around mid-load.
            this.loadAllPages(eventId, page + 1);
            return;
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  async findMyPhotos() {
    const descriptor: Float32Array | null = await this.faceDetection.loadUserFaceDescriptorAsync();
    if (!descriptor) {
      this.notification.error('Please set up your face profile first in the Selfie Capture section.');
      return;
    }

    this.matching.set(true);
    this.notification.success('Scanning photos for your face...');

    // Prepare photo URLs for face detection
    const photoUrls = this.allPhotos().map(p => p.imageUrl);

    try {
      // Process all photos for face detection
      const descriptors = await this.faceDetection.processEventPhotos(photoUrls);

      // Find matches
      const matches = this.faceDetection.findMatchingPhotos(descriptor, descriptors, 0.6);

      // Map back to full photo data
      const matchedPhotos = matches.map((match: any) => {
        const photo = this.allPhotos().find(p => p.imageId === match.photoId || p.imageUrl === match.photoId);
        return photo ? { ...photo, confidence: match.confidence, faceBox: match.faceBox } : null;
      }).filter(Boolean);

      this.matchedPhotos.set(matchedPhotos);

      if (matchedPhotos.length > 0) {
        this.notification.success(`Found ${matchedPhotos.length} photos of you!`);
      } else {
        this.notification.info('No matching photos found. Try retaking your selfie or check back later.');
      }
    } catch (error) {
      console.error('Face matching error:', error);
      this.notification.error('Failed to find matching photos. Please try again.');
    } finally {
      this.matching.set(false);
    }
  }

  openPhoto(photo: any) {
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

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (confidence >= 0.6) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  }

  getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  }

  roundConfidence(confidence: number): number {
    return Math.round(confidence * 100);
  }
}