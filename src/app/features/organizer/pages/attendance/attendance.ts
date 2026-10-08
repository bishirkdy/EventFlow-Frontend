import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { AttendanceDashboardModel } from '../../../../core/models/operations/operations.model';
import { NotificationService } from '../../../../core/services/ui/notification.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './attendance.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceComponent {
  @ViewChild('qrVideo')
  private qrVideo!: ElementRef<HTMLVideoElement>;

  private scannerControls?: IScannerControls;

  private readonly state = inject(OrganizerEventStateService);
  private readonly ops = inject(OperationsService);
  private readonly toast = inject(NotificationService);

  readonly dashboard = signal<AttendanceDashboardModel | null>(null);
  readonly qr = signal('');
  readonly scanning = signal(false);

  constructor() {
    const id = this.state.eventId();
    if (id) this.load(id);
  }

  load(id: string) {
    this.ops.dashboard(id).subscribe({
      next: (r) => {
        if (r.data) this.dashboard.set(r.data);
      },
      error: () => this.toast.error('Unable to load attendance dashboard.'),
    });
  }

  async camera(): Promise<void> {
    this.scanning.set(true);

    setTimeout(async () => {
      try {
        const reader = new BrowserMultiFormatReader();

        this.scannerControls = await reader.decodeFromVideoDevice(
          undefined,
          this.qrVideo.nativeElement,
          (result) => {
            if (!result) return;

            this.qr.set(result.getText());

            this.scannerControls?.stop();
            this.scannerControls = undefined;
            this.scanning.set(false);

            this.checkIn();
          },
        );
      } catch {
        this.scanning.set(false);
        this.toast.error('Unable to access the camera.');
      }
    });
  }
  closeCamera(): void {
    this.scannerControls?.stop();
    this.scannerControls = undefined;
    this.scanning.set(false);
  }

  checkIn() {
    const id = this.state.eventId();
    const qr = this.qr().trim();

    if (!id || !qr) return;

    this.ops.checkInQr(id, qr, null, null).subscribe({
      next: (r) => {
        if (r.isSuccess) {
          this.toast.success(r.message || 'Checked in');
          this.qr.set('');
          this.load(id);
        } else {
          this.toast.error(r.message || 'Check-in failed');
        }
      },
      error: () => this.toast.error('Ticket verification failed.'),
    });
  }
}
