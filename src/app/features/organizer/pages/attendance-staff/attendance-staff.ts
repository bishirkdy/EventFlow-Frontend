import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';

import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

import { OperationsService } from '../../../../core/services/operations/operations.service';
import { AttendanceStaffModel } from '../../../../core/models/operations';

import { SectionService } from '../../../../core/services/section/section.service';
import { SessionService } from '../../../../core/services/session/session.service';

import { SectionModel } from '../../../../core/models/section';
import { SessionModel } from '../../../../core/models/session';

import { NotificationService } from '../../../../core/services/ui/notification.service';
import { EmailValidator } from '../../../../core/validators/email.validator';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-attendance-staff',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './attendance-staff.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceStaffComponent {
  private readonly emailValidator = inject(EmailValidator);
  private readonly state = inject(OrganizerEventStateService);

  private readonly ops = inject(OperationsService);
  private readonly sectionService = inject(SectionService);
  private readonly sessionService = inject(SessionService);

  private readonly toast = inject(NotificationService);

  readonly staff = signal<AttendanceStaffModel[]>([]);
  readonly sections = signal<SectionModel[]>([]);
  readonly sessions = signal<SessionModel[]>([]);

  readonly scopePopupOpen = signal(false);
  readonly selectedScopeName = signal('');

  email = '';
  scopeType = 1;
  scopeId = '';

  private readonly staffAction = createAsyncAction(
    (eventId: string) => this.ops.getStaff(eventId),
    {
      errorFallback: 'Unable to load attendance staff.',
      onError: () => this.toast.error('Unable to load attendance staff.'),
      onSuccess: (response) => this.staff.set(response.data ?? []),
    },
  );

  private readonly sectionsAction = createAsyncAction(
    (eventId: string) => this.sectionService.getSections(eventId),
    {
      errorFallback: 'Unable to load sections.',
      onError: (error) => {
        console.error('Sections error:', error);

        this.sections.set([]);

        this.toast.error('Unable to load sections.');
      },
      onSuccess: (response) => this.sections.set(response.data ?? []),
    },
  );

  private readonly sessionsAction = createAsyncAction(
    (eventId: string) => this.sessionService.getSessions(eventId),
    {
      errorFallback: 'Unable to load sessions.',
      onError: (error) => {
        console.error('Sessions error:', error);

        this.sessions.set([]);

        this.toast.error('Unable to load sessions.');
      },
      onSuccess: (response) => this.sessions.set(response.data ?? []),
    },
  );

  private readonly assignAction = createAsyncAction(
    (eventId: string, payload: { email: string; scopeType: number; scopeId: string | null }) =>
      this.ops.assignStaff(eventId, payload).pipe(
        map((response) => ({ eventId, response })),
      ),
    {
      errorFallback: 'Assignment failed.',
      onError: (error) => {
        console.error('Assign staff error:', error);
      },
      onSuccess: ({ eventId, response }) => {
        if (!response.isSuccess) {
          this.toast.error(response.message || 'Assignment failed.');
          return;
        }

        this.toast.success('Attendance staff assigned.');

        this.resetForm();
        this.load(eventId);
      },
    },
  );

  private readonly revokeAction = createAsyncAction(
    (eventId: string, staffId: string) => this.ops.revokeStaff(eventId, staffId).pipe(
      map((response) => ({ eventId, response })),
    ),
    {
      errorFallback: 'Unable to revoke.',
      onError: (error) => {
        console.error('Revoke staff error:', error);
      },
      onSuccess: ({ eventId, response }) => {
        if (!response.isSuccess) {
          this.toast.error(response.message || 'Unable to revoke.');
          return;
        }

        this.toast.success('Attendance staff revoked.');
        this.load(eventId);
      },
    },
  );

  readonly loadingStaff = this.staffAction.pending;
  readonly loadingScopes = computed(
    () => this.sectionsAction.pending() || this.sessionsAction.pending(),
  );
  readonly assigning = this.assignAction.pending;

  constructor() {
    const eventId = this.state.eventId();

    if (eventId) {
      this.load(eventId);
    }
  }

  load(eventId: string): void {
    this.staffAction.run(eventId);
  }

  onScopeTypeChange(): void {
    this.scopeId = '';
    this.selectedScopeName.set('');
    this.scopePopupOpen.set(false);

    if (this.scopeType === 1) {
      return;
    }
  }

  openScopePopup(): void {
    const eventId = this.state.eventId();

    if (!eventId) {
      this.toast.error('Event could not be identified.');
      return;
    }

    if (this.scopeType === 1) {
      return;
    }

    this.scopePopupOpen.set(true);

    if (this.scopeType === 2) {
      this.loadSections(eventId);
      return;
    }

    if (this.scopeType === 3) {
      this.loadSessions(eventId);
    }
  }

  closeScopePopup(): void {
    this.scopePopupOpen.set(false);
  }

  selectSection(section: SectionModel): void {
    this.scopeId = section.id;
    this.selectedScopeName.set(section.name);
    this.scopePopupOpen.set(false);
  }

  selectSession(session: SessionModel): void {
    this.scopeId = session.id;
    this.selectedScopeName.set(session.title);
    this.scopePopupOpen.set(false);
  }

  private loadSections(eventId: string): void {
    this.sectionsAction.run(eventId);
  }

  private loadSessions(eventId: string): void {
    this.sessionsAction.run(eventId);
  }

  assign(): void {
    const eventId = this.state.eventId();

    if (!eventId) {
      this.toast.error('Event could not be identified.');
      return;
    }

    const email = this.email.trim();

    if (!email) {
      this.toast.error('Please enter a staff email address.');
      return;
    }

    if (!this.emailValidator.isValid(email)) {
      this.toast.error('Please enter a valid email address.');
      return;
    }

    if (this.scopeType !== 1 && !this.scopeId) {
      this.toast.error(
        this.scopeType === 2 ? 'Please select a section.' : 'Please select a session.',
      );
      return;
    }

    const scopeId = this.scopeType === 1 ? null : this.scopeId;

    this.assignAction.run(eventId, {
      email,
      scopeType: this.scopeType,
      scopeId,
    });
  }

  revoke(x: AttendanceStaffModel): void {
    const eventId = this.state.eventId();

    if (!eventId) {
      this.toast.error('Event could not be identified.');
      return;
    }

    this.revokeAction.run(eventId, x.id);
  }

  scopeLabel(scopeType: number): string {
    switch (scopeType) {
      case 1:
        return 'Event';

      case 2:
        return 'Section';

      case 3:
        return 'Session';

      default:
        return 'Unknown';
    }
  }

  private resetForm(): void {
    this.email = '';
    this.scopeType = 1;
    this.scopeId = '';
    this.selectedScopeName.set('');
    this.scopePopupOpen.set(false);
  }
}
