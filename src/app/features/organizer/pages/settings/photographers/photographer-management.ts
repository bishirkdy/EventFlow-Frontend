import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OrganizerEventStateService } from '@/features/organizer/services/organizer-event-state.service';

import { NotificationService } from 'core/services/ui/notification.service';
import { EmailValidator } from 'core/validators/email.validator';
import { PhotographerService } from '@/core/services/photographer/photographer.service';
import { PhotographerInvitationModel } from '@/core/models/photographer/photographer.model';


@Component({
  selector: 'app-photographer-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './photographer-management.html',
  styleUrl: './photographer-management.css',
})
export class PhotographerManagement implements OnInit {
  private readonly eventState = inject(OrganizerEventStateService);
  private readonly photographerService = inject(PhotographerService);
  private readonly notification = inject(NotificationService);
  private readonly emailValidator = inject(EmailValidator);

  readonly eventId = signal('');
  readonly invitations = signal<PhotographerInvitationModel[]>([]);
  readonly loading = signal(true);
  readonly inviting = signal(false);
  readonly newEmail = signal('');

  ngOnInit(): void {
    const eventId = this.eventState.eventId();

    if (!eventId) {
      this.loading.set(false);
      this.notification.error('Event could not be identified');
      return;
    }

    this.eventId.set(eventId);
    this.loadInvitations();
  }

  loadInvitations(): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    this.photographerService.getInvitations(eventId).subscribe({
      next: (response) => {
        this.invitations.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  invitePhotographer(): void {
    const eventId = this.eventId();
    const email = this.newEmail().trim();

    if (!eventId) {
      this.notification.error('Event could not be identified.');
      return;
    }

    if (!email) {
      this.notification.error('Please enter an email address.');
      return;
    }

    if (!this.emailValidator.isValid(email)) {
      this.notification.error('Please enter a valid email address.');
      return;
    }

    this.inviting.set(true);

    this.photographerService.invite(eventId, email).subscribe({
      next: (response) => {
        this.inviting.set(false);

        if (!response.isSuccess) {
          this.notification.error(
            response.message || 'Failed to send invitation.',
          );
          return;
        }

        this.notification.success(
          'Photographer invitation sent successfully.',
        );

        this.newEmail.set('');
        this.loadInvitations();
      },
      error: () => {
        this.inviting.set(false);
      },
    });
  }

  revokeInvitation(invitationId: string): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.notification.error('Event could not be identified.');
      return;
    }

    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }

    this.photographerService
      .revoke(eventId, invitationId)
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.notification.error(
              response.message || 'Failed to revoke invitation.',
            );
            return;
          }

          this.notification.success(
            'Invitation revoked successfully.',
          );

          this.loadInvitations();
        },
        error: () => {},
      });
  }

  // resendInvitation(invitation: PhotographerInvitationModel): void {
  //   const eventId = this.eventId();

  //   if (!eventId) {
  //     this.notification.error('Event could not be identified.');
  //     return;
  //   }

  //   this.photographerService
  //     .resend(eventId, invitation.invitationId)
  //     .subscribe({
  //       next: (response) => {
  //         if (!response.isSuccess) {
  //           this.notification.error(
  //             response.message || 'Failed to resend invitation.',
  //           );
  //           return;
  //         }

  //         this.notification.success(
  //           'Invitation resent successfully.',
  //         );

  //         this.loadInvitations();
  //       },
  //       error: () => {},
  //     });
  // }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Accepted';
      case 2:
        return 'Revoked';
      case 3:
        return 'Expired';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'border-amber-500 text-amber-600';
      case 1:
        return 'border-green-500 text-green-600';
      case 2:
        return 'border-red-500 text-red-600';
      case 3:
        return 'border-border text-text-muted';
      default:
        return 'border-border text-text-muted';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}