import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from 'core/services/ui/notification.service';
import { environment } from 'environments/environment';

interface InvitationResponse {
  invitationId: string;
  eventId: string;
  email: string;
  roleName: string;
  status: number;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  acceptedByUserId?: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

@Component({
  selector: 'app-photographer-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './photographer-management.html',
  styleUrl: './photographer-management.css'
})
export class PhotographerManagement implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  readonly eventId = signal<string>('');
  readonly invitations = signal<InvitationResponse[]>([]);
  readonly loading = signal(true);
  readonly inviting = signal(false);
  readonly newEmail = signal('');

  ngOnInit() {
    const eventId = this.route.parent?.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
      this.loadInvitations();
    }
  }

  loadInvitations() {
    this.loading.set(true);
    this.http.get<any>(
      `${environment.apiUrl}/events/${this.eventId()}/photographers`
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.invitations.set(response.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load photographer invitations.');
      }
    });
  }

  invitePhotographer() {
    const email = this.newEmail().trim();
    if (!email) {
      this.notification.error('Please enter an email address.');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.notification.error('Please enter a valid email address.');
      return;
    }

    this.inviting.set(true);
    this.http.post<any>(
      `${environment.apiUrl}/events/${this.eventId()}/photographers/invite`,
      { email }
    ).subscribe({
      next: (response) => {
        this.inviting.set(false);
        if (response.isSuccess) {
          this.notification.success('Photographer invitation sent successfully.');
          this.newEmail.set('');
          this.loadInvitations();
        } else {
          this.notification.error(response.message || 'Failed to send invitation.');
        }
      },
      error: (error) => {
        this.inviting.set(false);
        this.notification.error(error.error?.message || 'Failed to send invitation.');
      }
    });
  }

  revokeInvitation(invitationId: string) {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }

    this.http.delete<any>(
      `${environment.apiUrl}/events/${this.eventId()}/photographers/${invitationId}`
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.notification.success('Invitation revoked successfully.');
          this.loadInvitations();
        } else {
          this.notification.error(response.message || 'Failed to revoke invitation.');
        }
      },
      error: () => {
        this.notification.error('Failed to revoke invitation.');
      }
    });
  }

  resendInvitation(invitation: InvitationResponse) {
    this.http.post<any>(
      `${environment.apiUrl}/events/${this.eventId()}/photographers/${invitation.invitationId}/resend`,
      {}
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.notification.success('Invitation resent successfully.');
        } else {
          this.notification.error(response.message || 'Failed to resend invitation.');
        }
      },
      error: () => {
        this.notification.error('Failed to resend invitation.');
      }
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Accepted';
      case 2: return 'Revoked';
      case 3: return 'Expired';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 1: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 2: return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 3: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}