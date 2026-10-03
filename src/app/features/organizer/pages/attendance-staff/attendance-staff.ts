import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrganizerEventStateService } from '../../services/organizer-event-state.service';
import { OperationsService } from '../../../../core/services/operations/operations.service';
import { AttendanceStaffModel } from '../../../../core/models/operations/operations.model';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { EmailValidator } from '../../../../core/validators/email.validator';

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
  private readonly toast = inject(NotificationService);

  readonly staff = signal<AttendanceStaffModel[]>([]);
  email = '';
  scopeType = 1;
  scopeId = '';

  constructor() {
    const id = this.state.eventId();
    if (id) this.load(id);
  }

  load(id: string) {
    this.ops.getStaff(id).subscribe(r => this.staff.set(r.data ?? []));
  }

  assign() {
    const id = this.state.eventId();
    if (!id || !this.email) return;

    if (!this.emailValidator.isValid(this.email)) {
      this.toast.error('Please enter a valid email address');
      return;
    }

    const scopeValue = this.scopeType === 1 ? null : this.scopeId || null;
    this.ops.assignStaff(id, {
      email: this.email,
      scopeType: this.scopeType,
      scopeId: scopeValue,
    }).subscribe({
      next: r => {
        if (r.isSuccess) {
          this.toast.success('Attendance staff assigned');
          this.email = '';
          this.scopeId = '';
          this.load(id);
        } else {
          this.toast.error(r.message || 'Assignment failed');
        }
      },
      error: () => this.toast.error('Assignment failed'),
    });
  }

  revoke(x: AttendanceStaffModel) {
    const id = this.state.eventId();
    if (!id) return;
    this.ops.revokeStaff(id, x.id).subscribe({
      next: r => {
        if (r.isSuccess) this.load(id);
        else this.toast.error(r.message || 'Unable to revoke');
      },
      error: () => this.toast.error('Unable to revoke'),
    });
  }
}