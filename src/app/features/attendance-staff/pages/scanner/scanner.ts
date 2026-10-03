import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';

type ScannerStatus = 'ready' | 'starting' | 'scanning' | 'verifying' | 'success' | 'error';

type BarcodeDetectorLike = {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructorLike = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

@Component({
  selector: 'app-attendance-qr-scanner',
  standalone: true,
  templateUrl: './scanner.html',
})
export class AttendanceQrScanner implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly operations = inject(OperationsService);
  private readonly notify = inject(NotificationService);
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;

  readonly status = signal<ScannerStatus>('ready');
  readonly manualQr = signal('');
  readonly message = signal('Point the camera at a participant QR code.');
  readonly eventId = this.route.parent?.parent?.snapshot.paramMap.get('eventId') ?? this.route.parent?.snapshot.paramMap.get('eventId');
  private stream: MediaStream | null = null;
  private frame = 0;

  ngAfterViewInit(): void { void this.start(); }

  ngOnDestroy(): void { this.stop(); }

  async start(): Promise<void> {
    if (!this.eventId || this.status() === 'scanning') return;
    this.status.set('starting');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      this.video.nativeElement.srcObject = this.stream;
      await this.video.nativeElement.play();
      const Detector = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorConstructorLike }).BarcodeDetector;
      if (!Detector) {
        this.status.set('ready');
        this.message.set('Automatic QR scanning is unavailable in this browser. Use manual QR entry below.');
        return;
      }
      this.status.set('scanning');
      this.message.set('Scanning...');
      const detector = new Detector({ formats: ['qr_code'] });
      const scan = async () => {
        if (this.status() !== 'scanning') return;
        try {
          const codes = await detector.detect(this.video.nativeElement);
          const value = codes.find(x => x.rawValue)?.rawValue;
          if (value) { await this.verify(value); return; }
        } catch { /* Camera frames can occasionally fail while focus changes. */ }
        this.frame = requestAnimationFrame(scan);
      };
      this.frame = requestAnimationFrame(scan);
    } catch {
      this.status.set('error');
      this.message.set('Camera access is unavailable. Use manual QR entry.');
    }
  }

  stop(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
  }

  verifyManual(): void {
    const value = this.manualQr().trim();
    if (value) void this.verify(value);
  }

  private async verify(value: string): Promise<void> {
    if (!this.eventId || this.status() === 'verifying') return;
    this.stop();
    this.status.set('verifying');
    this.message.set('Verifying ticket and attendance permission...');
    this.operations.checkInQr(this.eventId, value, null, null).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.status.set('success');
          this.message.set(response.message || 'Participant checked in successfully.');
          this.manualQr.set('');
          this.notify.success(this.message());
        } else {
          this.status.set('error');
          this.message.set(response.message || 'Ticket verification failed.');
          this.notify.error(null, this.message());
        }
      },
      error: error => {
        this.status.set('error');
        this.message.set('Ticket verification failed.');
        this.notify.error(error, this.message());
      },
    });
  }
}
