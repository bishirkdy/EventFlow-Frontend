import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RegistrationStatus } from '../../../../../core/models/registration/registration.enums';


@Component({
  selector: 'app-registration-status',
  standalone: true,
  templateUrl: './registration-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationStatusComponent {
  readonly status = input.required<RegistrationStatus>();

  protected readonly label = computed(() => {
    switch (this.status()) {
      case RegistrationStatus.Pending:
        return 'Pending';

      case RegistrationStatus.Approved:
        return 'Approved';

      case RegistrationStatus.Rejected:
        return 'Rejected';

      case RegistrationStatus.Cancelled:
        return 'Cancelled';

      case RegistrationStatus.Waitlisted:
        return 'Waitlisted';

      default:
        return 'Unknown';
    }
  });

  protected readonly description = computed(() => {
    switch (this.status()) {
      case RegistrationStatus.Pending:
        return 'Your registration is waiting for approval.';

      case RegistrationStatus.Approved:
        return 'Your registration has been approved.';

      case RegistrationStatus.Rejected:
        return 'Your registration was rejected.';

      case RegistrationStatus.Cancelled:
        return 'This registration has been cancelled.';

      case RegistrationStatus.Waitlisted:
        return 'You are currently on the event waitlist.';

      default:
        return 'Registration status is unavailable.';
    }
  });
}