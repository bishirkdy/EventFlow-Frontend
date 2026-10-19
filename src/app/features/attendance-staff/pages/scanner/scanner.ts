import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { SessionService } from '../../../../core/services/session/session.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { AttendanceScopeType } from '../../../../core/models/operations';

type ScannerStatus = 'ready' | 'starting' | 'scanning' | 'verifying' | 'success' | 'error';

export type StaffScope = {
  key: string;
  label: string;
  sessionId: string | null;
};

@Component({
  selector: 'app-attendance-qr-scanner',
  standalone: true,
  templateUrl: './scanner.html'
})
export class AttendanceQrScanner implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly operations = inject(OperationsService);
  private readonly sessions = inject(SessionService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  @ViewChild('qrVideo') private qrVideo?: ElementRef<HTMLVideoElement>;

  readonly status = signal<ScannerStatus>('ready');
  readonly manualQr = signal('');
  readonly message = signal('Point the camera at a participant QR code.');
  readonly scopes = signal<StaffScope[]>([]);
  readonly scopesLoaded = signal(false);
  readonly selectedScope = signal<StaffScope | null>(null);
  readonly cameraOpen = signal(false);

  private scannerControls?: IScannerControls;

  readonly eventId =
    this.route.parent?.parent?.snapshot.paramMap.get('eventId') ??
    this.route.parent?.snapshot.paramMap.get('eventId');

  constructor() {
    const existing = this.auth.currentUser();
    if (existing?.id) {
      this.loadScopes(existing.id);
    } else {
      // On hard reload the session restores asynchronously; wait for it so a
      // staff member's real assignments are used instead of a fallback scope.
      this.auth.loadCurrentUser().subscribe((user) => {
        if (user?.id) this.loadScopes(user.id);
        else this.scopesLoaded.set(true);
      });
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  selectScope(key: string): void {
    const scope = this.scopes().find((x) => x.key === key);
    if (scope) this.selectedScope.set(scope);
  }

  openCamera(): void {
    if (!this.eventId || this.status() === 'scanning' || this.status() === 'starting') return;

    this.cameraOpen.set(true);
    this.status.set('starting');
    this.message.set('Starting camera...');

    setTimeout(async () => {
      try {
        const reader = new BrowserMultiFormatReader();

        this.scannerControls = await reader.decodeFromVideoDevice(
          undefined,
          this.qrVideo!.nativeElement,
          (result) => {
            if (!result) return;

            this.stopCamera();
            void this.verify(result.getText());
          }
        );

        this.status.set('scanning');
        this.message.set('Scanning...');
      } catch {
        this.stopCamera();
        this.status.set('error');
        this.message.set('Camera access is unavailable. Use manual QR entry.');
        this.notify.error(null, 'Camera access is unavailable.');
      }
    });
  }

  closeCamera(): void {
    this.stopCamera();

    if (this.status() === 'scanning' || this.status() === 'starting') {
      this.status.set('ready');
      this.message.set('Point the camera at a participant QR code.');
    }
  }

  private stopCamera(): void {
    this.scannerControls?.stop();
    this.scannerControls = undefined;
    this.cameraOpen.set(false);
  }

  verifyManual(): void {
    const value = this.manualQr().trim();
    if (value) void this.verify(value);
  }

  private loadScopes(me: string): void {
    if (!this.eventId) {
      this.scopesLoaded.set(true);
      return;
    }
    forkJoin({
      staff: this.operations.getStaff(this.eventId).pipe(catchError(() => of(null))),
      sessions: this.sessions.getSessions(this.eventId).pipe(catchError(() => of(null)))
    }).subscribe(({ staff, sessions }) => {
      const mine = (staff?.data ?? []).filter((x) => x.isActive && x.userId === me);
      const sessionNames = new Map((sessions?.data ?? []).map((s) => [s.id, s.title]));
      const options: StaffScope[] = [];
      for (const assignment of mine) {
        if (assignment.scopeType === AttendanceScopeType.Event) {
          options.push({ key: 'event', label: 'Event-wide', sessionId: null });
        } else if (assignment.scopeType === AttendanceScopeType.Session && assignment.scopeId) {
          options.push({
            key: `session:${assignment.scopeId}`,
            label: sessionNames.get(assignment.scopeId) ?? 'Session',
            sessionId: assignment.scopeId
          });
        }
      }
      const unique = options.filter(
        (option, index) => options.findIndex((x) => x.key === option.key) === index
      );
      if (unique.length === 0) {
        // Owners and organizers hold event.team.manage and legitimately scan
        // event-wide without an assignment row; the server still authorizes
        // every scan, so unassigned users are rejected there with a clear error.
        unique.push({ key: 'event', label: 'Event-wide', sessionId: null });
      }
      this.scopes.set(unique);
      this.selectedScope.update((scope) =>
        scope && unique.some((x) => x.key === scope.key) ? scope : unique[0]
      );
      this.scopesLoaded.set(true);
    });
  }

  private async verify(value: string): Promise<void> {
    if (!this.eventId || this.status() === 'verifying') return;
    this.stopCamera();
    this.status.set('verifying');
    this.message.set('Verifying ticket and attendance permission...');
    const scope = this.selectedScope();
    this.operations.checkInQr(this.eventId, value, null, scope?.sessionId ?? null).subscribe({
      next: (response) => {
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
      error: (error) => {
        this.status.set('error');
        this.message.set('Ticket verification failed.');
        this.notify.error(error, this.message());
      }
    });
  }
}
