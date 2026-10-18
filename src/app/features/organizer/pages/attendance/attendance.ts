import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { of, map } from 'rxjs';

import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { AttendanceDashboardModel } from '../../../../core/models/operations';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { createAsyncAction } from '@/core/state';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './attendance.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  private readonly dashboardAction = createAsyncAction(
    () => {
      const id = this.state.eventId();
      if (!id) return of(null);
      return this.ops.dashboard(id).pipe(map((r) => r.data ?? null));
    },
    {
      toastErrors: true,
      errorFallback: 'Unable to load attendance dashboard.',
      onSuccess: (data) => {
        if (data) this.dashboard.set(data);
      }
    }
  );

  private readonly checkInAction = createAsyncAction(
    (qr: string) => {
      const id = this.state.eventId() ?? '';
      return this.ops.checkInQr(id, qr, null, null);
    },
    {
      errorFallback: 'Ticket verification failed.',
      onSuccess: (r) => {
        if (r.isSuccess) {
          this.toast.success(r.message || 'Checked in');
          this.qr.set('');
          this.dashboardAction.run();
        } else {
          this.toast.error(r.message || 'Check-in failed');
        }
      }
    }
  );

  constructor() {
    this.dashboardAction.run();
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
          }
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

    this.checkInAction.run(qr);
  }
}
