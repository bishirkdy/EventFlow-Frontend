import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { SectionService } from '../../../../core/services/section/section.service';
import { SessionService } from '../../../../core/services/session/session.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { AttendanceScopeType } from '../../../../core/models/operations/operations.model';

type ScannerStatus = 'ready' | 'starting' | 'scanning' | 'verifying' | 'success' | 'error';

type BarcodeDetectorLike = {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorConstructorLike = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

export type StaffScope = {
  key: string;
  label: string;
  sectionId: string | null;
  sessionId: string | null;
};

@Component({
  selector: 'app-attendance-qr-scanner',
  standalone: true,
  templateUrl: './scanner.html',
})
export class AttendanceQrScanner implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly operations = inject(OperationsService);
  private readonly sections = inject(SectionService);
  private readonly sessions = inject(SessionService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;

  readonly status = signal<ScannerStatus>('ready');
  readonly manualQr = signal('');
  readonly message = signal('Point the camera at a participant QR code.');
  readonly scopes = signal<StaffScope[]>([]);
  readonly scopesLoaded = signal(false);
  readonly selectedScope = signal<StaffScope | null>(null);
  readonly eventId = this.route.parent?.parent?.snapshot.paramMap.get('eventId') ?? this.route.parent?.snapshot.paramMap.get('eventId');
  private stream: MediaStream | null = null;
  private frame = 0;

  constructor() {
    const existing = this.auth.currentUser();
    if (existing?.id) {
      this.loadScopes(existing.id);
    } else {
      // On hard reload the session restores asynchronously; wait for it so a
      // staff member's real assignments are used instead of a fallback scope.
      this.auth.loadCurrentUser().subscribe(user => {
        if (user?.id) this.loadScopes(user.id);
        else this.scopesLoaded.set(true);
      });
    }
  }

  ngAfterViewInit(): void { void this.start(); }

  ngOnDestroy(): void { this.stop(); }

  selectScope(key: string): void {
    const scope = this.scopes().find(x => x.key === key);
    if (scope) this.selectedScope.set(scope);
  }

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

  private loadScopes(me: string): void {
    if (!this.eventId) {
      this.scopesLoaded.set(true);
      return;
    }
    forkJoin({
      staff: this.operations.getStaff(this.eventId).pipe(catchError(() => of(null))),
      sections: this.sections.getSections(this.eventId).pipe(catchError(() => of(null))),
      sessions: this.sessions.getSessions(this.eventId).pipe(catchError(() => of(null))),
    }).subscribe(({ staff, sections, sessions }) => {
      const mine = (staff?.data ?? []).filter(x => x.isActive && x.userId === me);
      const sectionNames = new Map((sections?.data ?? []).map(s => [s.id, s.name]));
      const sessionNames = new Map((sessions?.data ?? []).map(s => [s.id, s.title]));
      const sessionSections = new Map((sessions?.data ?? []).map(s => [s.id, s.sectionId]));
      const options: StaffScope[] = [];
      for (const assignment of mine) {
        if (assignment.scopeType === AttendanceScopeType.Event) {
          options.push({ key: 'event', label: 'Event-wide', sectionId: null, sessionId: null });
        } else if (assignment.scopeType === AttendanceScopeType.Section && assignment.scopeId) {
          options.push({
            key: `section:${assignment.scopeId}`,
            label: sectionNames.get(assignment.scopeId) ?? 'Section',
            sectionId: assignment.scopeId,
            sessionId: null,
          });
        } else if (assignment.scopeType === AttendanceScopeType.Session && assignment.scopeId) {
          options.push({
            key: `session:${assignment.scopeId}`,
            label: sessionNames.get(assignment.scopeId) ?? 'Session',
            sectionId: sessionSections.get(assignment.scopeId) ?? null,
            sessionId: assignment.scopeId,
          });
        }
      }
      const unique = options.filter((option, index) => options.findIndex(x => x.key === option.key) === index);
      if (unique.length === 0) {
        // Owners and organizers hold event.team.manage and legitimately scan
        // event-wide without an assignment row; the server still authorizes
        // every scan, so unassigned users are rejected there with a clear error.
        unique.push({ key: 'event', label: 'Event-wide', sectionId: null, sessionId: null });
      }
      this.scopes.set(unique);
      this.selectedScope.update(scope => scope && unique.some(x => x.key === scope.key) ? scope : unique[0]);
      this.scopesLoaded.set(true);
    });
  }

  private async verify(value: string): Promise<void> {
    if (!this.eventId || this.status() === 'verifying') return;
    this.stop();
    this.status.set('verifying');
    this.message.set('Verifying ticket and attendance permission...');
    const scope = this.selectedScope();
    this.operations.checkInQr(this.eventId, value, scope?.sectionId ?? null, scope?.sessionId ?? null).subscribe({
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
