import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../../../core/services/ui/notification.service';
import type { NotificationService as NotificationServiceType } from '../../../../../core/services/ui/notification.service';
import { FaceDetectionService } from '../face-detection.service';
import { ArrowLeft, ScanFace, Camera, LucideAngularModule, X } from 'lucide-angular';
import { SelfieCapture } from '../selfie-capture/selfie-capture';
import { PhotoService } from '@/core/services/photo/photo.service';

@Component({
  selector: 'app-my-photos',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, SelfieCapture],
  templateUrl: './my-photos.html',
})
export class MyPhotos implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotoService);
  private readonly faceDetection = inject<FaceDetectionService>(FaceDetectionService);
  private readonly notification = inject<NotificationServiceType>(NotificationService);

  readonly eventId = signal<string>('');
  readonly allPhotos = signal<any[]>([]);
  readonly matchedPhotos = signal<any[]>([]);
  readonly loading = signal(true);
  readonly matching = signal(false);
  readonly hasFaceProfile = signal(false);

  readonly totalMatched = computed(() => this.matchedPhotos().length);
  readonly totalPhotos = computed(() => (this.loading() ? 0 : this.allPhotos().length));

  readonly selfieModalOpen = signal(false);

  readonly Camera = Camera;
  readonly ScanFace = ScanFace;
  readonly ArrowLeft = ArrowLeft;
  readonly X = X;

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

    this.faceDetection.loadUserFaceDescriptorAsync().then((descriptor) => {
      this.hasFaceProfile.set(descriptor !== null);
    });
  }

  private loadEventPhotos(eventId: string) {
    this.loadAllPages(eventId, 1);
  }

  private loadAllPages(eventId: string, page: number): void {
    this.loading.set(true);

    this.photoService.getPhotos(eventId, page, 100, true).subscribe({
      next: (response) => {
        const data = response.data;

        if (response.isSuccess && data) {
          this.allPhotos.update((current) => [...current, ...data.items]);

          if (data.hasNextPage) {
            this.loadAllPages(eventId, page + 1);
            return;
          }
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load event photos:', error);
        this.loading.set(false);
      },
    });
  }

  async findMyPhotos() {
    const descriptor: Float32Array | null = await this.faceDetection.loadUserFaceDescriptorAsync();
    if (!descriptor) {
      this.notification.error(
        'Please set up your face profile first in the Selfie Capture section.',
      );
      return;
    }

    this.matching.set(true);
    this.notification.success('Scanning photos for your face...');

    const photoUrls = this.allPhotos().map((p) => p.imageUrl);

    try {
      // Process all photos for face detection
      const descriptors = await this.faceDetection.processEventPhotos(photoUrls);

      // Find matches
      const matches = this.faceDetection.findMatchingPhotos(descriptor, descriptors, 0.6);

      // Map back to full photo data
      const matchedPhotos = matches
        .map((match: any) => {
          const photo = this.allPhotos().find(
            (p) => p.imageId === match.photoId || p.imageUrl === match.photoId,
          );
          return photo ? { ...photo, confidence: match.confidence, faceBox: match.faceBox } : null;
        })
        .filter(Boolean);

      this.matchedPhotos.set(matchedPhotos);

      if (matchedPhotos.length > 0) {
        this.notification.success(`Found ${matchedPhotos.length} photos of you!`);
      } else {
        this.notification.info(
          'No matching photos found. Try retaking your selfie or check back later.',
        );
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
      minute: '2-digit',
    });
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8)
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (confidence >= 0.6)
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
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

  openSelfieModal(): void {
    this.selfieModalOpen.set(true);
  }

  closeSelfieModal(): void {
    this.selfieModalOpen.set(false);
  }

  async onSelfieSaved(): Promise<void> {
    try {
      const descriptor = await this.faceDetection.loadUserFaceDescriptorAsync();

      this.hasFaceProfile.set(descriptor !== null);
      this.matchedPhotos.set([]);
      this.closeSelfieModal();
    } catch (error) {
      console.error('Failed to refresh face profile:', error);
      this.notification.error('The face profile was saved, but its status could not be refreshed.');
    }
  }
}
