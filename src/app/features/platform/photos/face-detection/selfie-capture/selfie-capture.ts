import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceDetectionService } from '../face-detection.service';
import { NotificationService } from '../../../../../core/services/ui/notification.service';
import type { NotificationService as NotificationServiceType } from '../../../../../core/services/ui/notification.service';

@Component({
  selector: 'app-selfie-capture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selfie-capture.html',
  styleUrl: './selfie-capture.css'
})
export class SelfieCapture implements OnInit, OnDestroy {
  private readonly faceDetection = inject<FaceDetectionService>(FaceDetectionService);
  private readonly notification = inject<NotificationServiceType>(NotificationService);

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  readonly showCamera = signal(false);
  readonly capturing = signal(false);
  readonly processing = signal(false);
  readonly faceDetected = signal(false);
  readonly faceDescriptor = signal<Float32Array | null>(null);
  readonly error = signal<string | null>(null);

  private stream: MediaStream | null = null;
  private detectionInterval: any = null;

  async ngOnInit() {
    await this.loadFaceModels();
  }

  ngOnDestroy() {
    this.stopCamera();
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
  }

  private async loadFaceModels() {
    try {
      await this.faceDetection.loadModels();
    } catch (error) {
      console.error('Failed to load face detection models:', error);
      this.error.set('Failed to load face detection models. Please refresh the page.');
    }
  }

  async startCamera() {
    this.error.set(null);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });

      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        await this.videoElement.nativeElement.play();
      }

      this.showCamera.set(true);
      this.startFaceDetection();
    } catch (error) {
      console.error('Failed to access camera:', error);
      this.error.set('Unable to access camera. Please check permissions.');
      this.notification.error('Unable to access camera. Please check permissions.');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.showCamera.set(false);
    this.faceDetected.set(false);
  }

  private startFaceDetection() {
    if (!this.videoElement?.nativeElement) return;

    this.detectionInterval = setInterval(async () => {
      if (!this.videoElement?.nativeElement || this.videoElement.nativeElement.paused) return;

      try {
        const detections = await this.faceDetection.detectFaces(this.videoElement.nativeElement);
        this.faceDetected.set(detections.length > 0);
      } catch (error) {
        console.warn('Face detection error:', error);
      }
    }, 500);
  }

  async captureSelfie() {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) {
      this.error.set('Camera not ready');
      return;
    }

    this.capturing.set(true);
    this.error.set(null);

    try {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
      });

      this.faceDetected.set(false);
      const descriptor = await this.faceDetection.computeFaceDescriptor(this.videoElement.nativeElement);

      if (!descriptor) {
        this.error.set('No face detected. Please position your face in the frame and try again.');
        return;
      }

      this.faceDescriptor.set(descriptor);
      await this.faceDetection.setUserFaceDescriptor(descriptor);

      this.notification.success('Selfie captured! Your face profile has been saved.');
    } catch (error) {
      console.error('Selfie capture error:', error);
      this.error.set('Failed to capture selfie. Please try again.');
    } finally {
      this.capturing.set(false);
    }
  }

  retakeSelfie() {
    this.faceDescriptor.set(null);
    this.faceDetected.set(false);
    this.error.set(null);
  }

  hasFaceProfile(): boolean {
    return this.faceDescriptor() !== null || this.faceDetection.getUserFaceDescriptor() !== null;
  }

  formatDescriptor(descriptor: Float32Array | null): string {
    if (!descriptor) return 'Not set';
    const arr = Array.from(descriptor);
    return `[${descriptor.length} dimensions: ${arr.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]`;
  }
}