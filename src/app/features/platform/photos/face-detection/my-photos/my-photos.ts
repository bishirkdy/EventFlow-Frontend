import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, map, of, switchMap } from 'rxjs';
import { NotificationService } from '../../../../../core/services/ui/notification.service';
import { FaceDetectionService, type MatchedPhoto } from '../face-detection.service';
import { ArrowLeft, ScanFace, Camera, LucideAngularModule, X } from 'lucide-angular';
import { SelfieCapture } from '../selfie-capture/selfie-capture';
import { PhotoService } from '@/core/services/photo/photo.service';
import { type Photo } from '@/core/models/photographer';
import { createRawAsyncState } from '@/core/state';
import { AsyncState } from '@/shared/components/async-state/async-state';

interface MatchedEventPhoto extends Photo {
  confidence: number;
}

@Component({
  selector: 'app-my-photos',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, SelfieCapture, AsyncState],
  templateUrl: './my-photos.html'
})
export class MyPhotos implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly photoService = inject(PhotoService);
  private readonly faceDetection = inject(FaceDetectionService);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal<string>('');
  readonly matching = signal(false);
  readonly hasFaceProfile = signal(false);

  private readonly photosState = createRawAsyncState<Photo[]>(
    () => {
      const eventId = this.eventId();
      if (!eventId) return of([]);
      return this.loadPage(eventId, 1);
    },
    { initial: [], autoLoad: false, errorFallback: 'Failed to load event photos.' }
  );

  readonly allPhotos = this.photosState.data;
  readonly loading = this.photosState.loading;
  readonly error = this.photosState.error;

  reload(): void {
    this.photosState.load();
  }

  readonly matchedPhotos = signal<MatchedEventPhoto[]>([]);

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
      this.photosState.load();
      this.checkFaceProfile();
    }
  }

  private loadPage(eventId: string, page: number): Observable<Photo[]> {
    return this.photoService.getPhotos(eventId, page, 100, true).pipe(
      switchMap((response) => {
        if (response.isSuccess && response.data) {
          const items = response.data.items ?? [];

          if (response.data.hasNextPage) {
            return this.loadPage(eventId, page + 1).pipe(map((rest) => [...items, ...rest]));
          }

          return of(items);
        }

        return of([]);
      })
    );
  }

  private checkFaceProfile() {
    const descriptor = this.faceDetection.getUserFaceDescriptor();
    this.hasFaceProfile.set(descriptor !== null);

    this.faceDetection.loadUserFaceDescriptorAsync().then((descriptor) => {
      this.hasFaceProfile.set(descriptor !== null);
    });
  }

  async findMyPhotos() {
    const descriptor: Float32Array | null = await this.faceDetection.loadUserFaceDescriptorAsync();
    if (!descriptor) {
      this.notification.error(
        'Please set up your face profile first in the Selfie Capture section.'
      );
      return;
    }

    this.matching.set(true);
    this.notification.success('Scanning photos for your face...');

    const photoUrls = this.allPhotos().map((p) => p.imageUrl);

    try {
      const descriptors = await this.faceDetection.processEventPhotos(photoUrls);

      const matches = this.faceDetection.findMatchingPhotos(descriptor, descriptors, 0.6);

      const matchedPhotos: MatchedEventPhoto[] = matches.flatMap((match: MatchedPhoto) => {
        const photo = this.allPhotos().find(
          (p) => p.photoId === match.photoId || p.imageUrl === match.photoId
        );
        return photo ? [{ ...photo, confidence: match.confidence }] : [];
      });

      this.matchedPhotos.set(matchedPhotos);

      if (matchedPhotos.length > 0) {
        this.notification.success(`Found ${matchedPhotos.length} photos of you!`);
      } else {
        this.notification.info(
          'No matching photos found. Try retaking your selfie or check back later.'
        );
      }
    } catch {
      this.notification.error('Failed to find matching photos. Please try again.');
    } finally {
      this.matching.set(false);
    }
  }

  openPhoto(photo: MatchedEventPhoto) {
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
    } catch {
      this.notification.error('The face profile was saved, but its status could not be refreshed.');
    }
  }
}
