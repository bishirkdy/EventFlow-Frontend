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
        return 'Pending review';
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
        return 'Your registration is awaiting approval.';
      case RegistrationStatus.Approved:
        return 'Your place at the event is confirmed.';
      case RegistrationStatus.Rejected:
        return 'This registration was not approved.';
      case RegistrationStatus.Cancelled:
        return 'This registration is no longer active.';
      case RegistrationStatus.Waitlisted:
        return 'You are in the event waitlist.';
      default:
        return 'Registration status is unavailable.';
    }
  });

  protected readonly tone = computed(() => {
    switch (this.status()) {
      case RegistrationStatus.Approved:
        return {
          color: 'var(--color-success)',
          background: '#f0fdf4',
          border: '#bbf7d0',
        };
      case RegistrationStatus.Rejected:
        return {
          color: 'var(--color-error)',
          background: '#fef2f2',
          border: '#fecaca',
        };
      case RegistrationStatus.Cancelled:
        return {
          color: 'var(--color-text-secondary)',
          background: 'var(--color-surface-soft)',
          border: 'var(--color-border)',
        };
      case RegistrationStatus.Waitlisted:
        return {
          color: 'var(--color-warning)',
          background: '#fffbeb',
          border: '#fde68a',
        };
      default:
        return {
          color: 'var(--color-info)',
          background: '#eff6ff',
          border: '#bfdbfe',
        };
    }
  });
}
