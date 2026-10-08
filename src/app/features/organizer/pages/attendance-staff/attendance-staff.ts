import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrganizerEventStateService } from '../../services/organizer-event-state.service';

import { OperationsService } from '../../../../core/services/operations/operations.service';
import { AttendanceStaffModel } from '../../../../core/models/operations/operations.model';

import { SectionService } from '../../../../core/services/section/section.service';
import { SessionService } from '../../../../core/services/session/session.service';

import { SectionModel } from '../../../../core/models/section/section.model';
import { SessionModel } from '../../../../core/models/session/session.model';

import { NotificationService } from '../../../../core/services/ui/notification.service';
import { EmailValidator } from '../../../../core/validators/email.validator';
import { HttpErrorResponse } from '@angular/common/http';

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

  readonly loadingStaff = signal(false);
  readonly loadingScopes = signal(false);
  readonly assigning = signal(false);

  email = '';
  scopeType = 1;
  scopeId = '';

  constructor() {
    const eventId = this.state.eventId();

    if (eventId) {
      this.load(eventId);
    }
  }

  load(eventId: string): void {
    this.loadingStaff.set(true);

    this.ops.getStaff(eventId).subscribe({
      next: (response) => {
        this.staff.set(response.data ?? []);
        this.loadingStaff.set(false);
      },
      error: () => {
        this.loadingStaff.set(false);
        this.toast.error('Unable to load attendance staff.');
      },
    });
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
    this.loadingScopes.set(true);

    this.sectionService.getSections(eventId).subscribe({
      next: (response) => {
        this.sections.set(response.data ?? []);
        this.loadingScopes.set(false);
      },
      error: (error) => {
        console.error('Sections error:', error);

        this.sections.set([]);
        this.loadingScopes.set(false);

        this.toast.error('Unable to load sections.');
      },
    });
  }

  private loadSessions(eventId: string): void {
    this.loadingScopes.set(true);

    this.sessionService.getSessions(eventId).subscribe({
      next: (response) => {
        this.sessions.set(response.data ?? []);
        this.loadingScopes.set(false);
      },
      error: (error) => {
        console.error('Sessions error:', error);

        this.sessions.set([]);
        this.loadingScopes.set(false);

        this.toast.error('Unable to load sessions.');
      },
    });
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

    this.assigning.set(true);

    this.ops
      .assignStaff(eventId, {
        email,
        scopeType: this.scopeType,
        scopeId,
      })
      .subscribe({
        next: (response) => {
          this.assigning.set(false);

          if (!response.isSuccess) {
            this.toast.error(response.message || 'Assignment failed.');
            return;
          }

          this.toast.success('Attendance staff assigned.');

          this.resetForm();
          this.load(eventId);
        },

        error: (error: HttpErrorResponse) => {
          this.assigning.set(false);

          console.error('Assign staff error:', error);

          const message = error.error?.message || error.error?.errors?.[0] || 'Assignment failed.';

          this.toast.error(message);
        },
      });
  }

  revoke(x: AttendanceStaffModel): void {
    const eventId = this.state.eventId();

    if (!eventId) {
      this.toast.error('Event could not be identified.');
      return;
    }

    this.ops.revokeStaff(eventId, x.id).subscribe({
      next: (response) => {
        if (!response.isSuccess) {
          this.toast.error(response.message || 'Unable to revoke.');
          return;
        }

        this.toast.success('Attendance staff revoked.');
        this.load(eventId);
      },

      error: (error: HttpErrorResponse) => {
        console.error('Revoke staff error:', error);
        const message = error.error?.message || error.error?.errors?.[0] || 'Unable to revoke.';
        this.toast.error(message);
      },
    });
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
