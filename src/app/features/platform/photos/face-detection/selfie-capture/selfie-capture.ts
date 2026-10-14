import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Camera, LucideAngularModule } from 'lucide-angular';

import { FaceDetectionService } from '../face-detection.service';
import { NotificationService } from '../../../../../core/services/ui/notification.service';
import type { NotificationService as NotificationServiceType } from '../../../../../core/services/ui/notification.service';

@Component({
  selector: 'app-selfie-capture',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './selfie-capture.html',
})

export class SelfieCapture implements OnInit, OnDestroy {
  private readonly faceDetection = inject(FaceDetectionService);
  private readonly notification = inject<NotificationServiceType>(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('videoElement')
  videoElement?: ElementRef<HTMLVideoElement>;

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly Camera = Camera;

  readonly showCamera = signal(false);
  readonly capturing = signal(false);
  readonly processing = signal(false);
  readonly faceDetected = signal(false);
  readonly faceDescriptor = signal<Float32Array | null>(null);
  readonly error = signal<string | null>(null);

  private stream: MediaStream | null = null;
  private detectionInterval: ReturnType<typeof setInterval> | null = null;
  private detectionInProgress = false;
  private destroyed = false;

  async ngOnInit(): Promise<void> {
    await this.loadFaceModels();

    const existingDescriptor = await this.faceDetection.loadUserFaceDescriptorAsync();

    if (!this.destroyed && existingDescriptor) {
      this.faceDescriptor.set(existingDescriptor);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopCamera();
  }

  private async loadFaceModels(): Promise<void> {
    try {
      await this.faceDetection.loadModels();
    } catch (error) {
      console.error('Failed to load face detection models:', error);
      this.error.set('Failed to load face detection models. Please refresh the page.');
    }
  }

  hasFaceProfile(): boolean {
    return this.faceDescriptor() !== null || this.faceDetection.getUserFaceDescriptor() !== null;
  }

  async startCamera(): Promise<void> {
    if (this.stream || this.capturing()) return;

    this.error.set(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      this.error.set('Camera access requires HTTPS or localhost and a supported browser.');
      return;
    }

    try {
      // Render the video element before accessing its ViewChild.
      this.showCamera.set(true);
      this.cdr.detectChanges();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (this.destroyed) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      this.stream = stream;

      const video = this.videoElement?.nativeElement;

      if (!video) {
        throw new Error('Camera preview element was not found.');
      }

      video.srcObject = stream;
      await video.play();

      this.startFaceDetection();
    } catch (error) {
      console.error('Failed to access camera:', error);
      this.stopCamera();

      this.error.set('Unable to access the camera. Please check your browser permissions.');

      this.notification.error('Unable to access camera. Please check permissions.');
    }
  }

  stopCamera(): void {
    if (this.detectionInterval !== null) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    this.detectionInProgress = false;

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    const video = this.videoElement?.nativeElement;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    this.showCamera.set(false);
    this.faceDetected.set(false);
  }

  cancel(): void {
    this.stopCamera();
    this.cancelled.emit();
  }

  private startFaceDetection(): void {
    if (this.detectionInterval !== null) {
      clearInterval(this.detectionInterval);
    }

    this.detectionInterval = setInterval(async () => {
      const video = this.videoElement?.nativeElement;

      if (
        !video ||
        video.paused ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        this.detectionInProgress
      ) {
        return;
      }

      this.detectionInProgress = true;

      try {
        const detections = await this.faceDetection.detectFaces(video);

        this.faceDetected.set(detections.length > 0);

      } catch (error) {
        console.error('Face detection failed:', error);
        this.faceDetected.set(false);
      } finally {
        this.detectionInProgress = false;
      }
    }, 500);
  }

  async captureSelfie(): Promise<void> {
    const video = this.videoElement?.nativeElement;

    if (!video || !this.stream || video.videoWidth === 0) {
      this.error.set('Camera is not ready. Please wait and try again.');
      return;
    }

    if (!this.faceDetected()) {
      this.error.set('No face detected. Position your face in the frame and try again.');
      return;
    }

    this.capturing.set(true);
    this.processing.set(true);
    this.error.set(null);

    try {
      const descriptor = await this.faceDetection.computeFaceDescriptor(video);

      if (!descriptor) {
        this.error.set('No face detected. Please position your face in the frame and try again.');
        return;
      }

      await this.faceDetection.setUserFaceDescriptor(descriptor);

      this.faceDescriptor.set(descriptor);

      this.notification.success('Selfie captured! Your face profile has been saved.');

      this.stopCamera();
      this.saved.emit();
    } catch (error) {
      console.error('Selfie capture error:', error);

      this.error.set('Failed to save your face profile. Please try again.');

      this.notification.error('Failed to save your face profile.');
    } finally {
      this.capturing.set(false);
      this.processing.set(false);
    }
  }

  retakeSelfie(): void {
    this.error.set(null);
    this.faceDetected.set(false);
    void this.startCamera();
  }

  formatDescriptor(descriptor: Float32Array | null): string {
    if (!descriptor) return 'Face profile is ready';

    const values = Array.from(descriptor)
      .slice(0, 3)
      .map((value) => value.toFixed(4))
      .join(', ');

    return `[${descriptor.length} dimensions: ${values}...]`;
  }
}
