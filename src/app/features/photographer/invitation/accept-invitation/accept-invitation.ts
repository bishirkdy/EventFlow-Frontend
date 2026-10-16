import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '@/core/services/auth/auth.service';
import { NotificationService } from '@/core/services/ui/notification.service';
import { InvitationService } from '@/core/services/invitation/invitation.service';

import { UserProfile } from '@/core/models/auth';
import { InvitationData, InvitationType } from '@/core/models/invitation';
import { CapitalizePipe } from '@/shared/components/pipes/capitalize.pipe';
import { createAsyncAction } from 'core/state';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CapitalizePipe],
  templateUrl: './accept-invitation.html',
  styleUrl: './accept-invitation.css',
})
export class AcceptInvitation implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly invitationService = inject(InvitationService);

  readonly token = signal('');
  readonly invitation = signal<InvitationData | null>(null);
  readonly authUser = signal<UserProfile | null>(null);

  readonly errorMessage = signal<string | null>(null);

  readonly step = signal<'validate' | 'register' | 'complete'>(
    'validate',
  );

  private readonly userAction = createAsyncAction(
    () => this.authService.loadCurrentUser(),
    {
      errorFallback: 'Unable to load the current user.',
      onSuccess: (user) => this.authUser.set(user),
      onError: () => this.authUser.set(null),
      onSettled: () => {
        this.authenticationChecked = true;
        this.handleInvitationAfterAuthentication();
      },
    },
  );

  private readonly validateAction = createAsyncAction(
    (token: string) => this.invitationService.getByToken(token),
    {
      errorFallback: 'Unable to validate this invitation. It may be invalid or expired.',
      onError: () =>
        this.errorMessage.set(
          'Unable to validate this invitation. It may be invalid or expired.',
        ),
      onSuccess: (response) => {
        const invitation = response.data;

        if (!response.isSuccess || !invitation) {
          this.errorMessage.set(
            response.message || 'Invalid invitation link.',
          );
          return;
        }

        this.invitation.set(invitation);
        this.invitationValidated = true;

        // Revoked invitation.
        if (invitation.status === 2) {
          this.errorMessage.set(
            'This invitation has been revoked. Please contact the event organizer.',
          );
          return;
        }

        // Only pending and accepted invitations can continue.
        if (invitation.status !== 0 && invitation.status !== 1) {
          this.errorMessage.set(
            'This invitation is no longer active.',
          );
          return;
        }

        // Expiration applies to pending invitations.
        if (
          invitation.status === 0 &&
          invitation.expiresAt &&
          new Date(invitation.expiresAt).getTime() < Date.now()
        ) {
          this.errorMessage.set(
            'This invitation has expired. Please ask the event organizer for a new one.',
          );
          return;
        }

        this.handleInvitationAfterAuthentication();
      },
    },
  );

  private readonly acceptExistingAction = createAsyncAction(
    () => this.invitationService.acceptForExistingUser(this.token()),
    {
      errorFallback: 'Failed to accept invitation.',
      onSuccess: (response) => {
        if (!response.isSuccess) {
          this.notification.error(
            response.message || 'Failed to accept invitation.',
          );
          return;
        }

        this.notification.success(
          'Invitation accepted successfully.',
        );

        this.navigateToDashboard();
      },
    },
  );

  private readonly acceptNewAccountAction = createAsyncAction(
    () =>
      this.invitationService.acceptWithNewAccount(
        this.token(),
        this.registerForm.getRawValue(),
      ),
    {
      errorFallback: 'Failed to accept invitation.',
      onSuccess: (response) => {
        if (!response.isSuccess) {
          this.notification.error(
            response.message || 'Failed to accept invitation.',
          );
          return;
        }

        this.step.set('complete');

        this.notification.success(
          'Account created successfully!',
        );
      },
    },
  );

  loading = this.validateAction.pending;
  accepting = computed(
    () => this.acceptExistingAction.pending() || this.acceptNewAccountAction.pending(),
  );

  readonly registerForm = this.fb.nonNullable.group({
    userName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
  });

  private invitationValidated = false;
  private authenticationChecked = false;
  private redirectStarted = false;

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.errorMessage.set(
        'The invitation link is missing its token.',
      );
      return;
    }

    this.token.set(token);

    // Both operations can complete in either order.
    this.loadCurrentUser();
    this.validateInvitation(token);
  }

  private loadCurrentUser(): void {
    const currentUser = this.authService.currentUser();

    if (currentUser) {
      this.authUser.set(currentUser);
      this.authenticationChecked = true;
      this.handleInvitationAfterAuthentication();
      return;
    }

    this.userAction.run();
  }

  private validateInvitation(token: string): void {
    this.errorMessage.set(null);

    this.validateAction.run(token);
  }

  private handleInvitationAfterAuthentication(): void {
    if (
      !this.invitationValidated ||
      !this.authenticationChecked ||
      this.redirectStarted
    ) {
      return;
    }

    const invitation = this.invitation();

    // Only accepted invitations use this automatic redirect.
    if (!invitation || invitation.status !== 1) {
      return;
    }

    if (!invitation.eventId) {
      this.errorMessage.set(
        'Event ID is missing from the invitation.',
      );
      return;
    }

    const returnUrl = this.dashboardUrl(
      invitation.eventId,
      invitation.type,
    );

    const user = this.authUser();

    if (user) {
      if (!this.emailsMatch()) {
        this.errorMessage.set(
          'Please log in with the email address that received this invitation.',
        );
        return;
      }

      this.redirectStarted = true;
      void this.router.navigateByUrl(returnUrl);
      return;
    }

    // Preserve the destination before navigating away to login.
    this.redirectStarted = true;

    void this.router.navigate(['/login'], {
      queryParams: {
        returnUrl,
        email: invitation.email,
      },
    });
  }

  private isInvitationEmailMatchingUser(): boolean {
    const userEmail = this.authUser()?.email;
    const invitationEmail = this.invitation()?.email;

    return (
      !!userEmail &&
      !!invitationEmail &&
      userEmail.trim().toLowerCase() ===
        invitationEmail.trim().toLowerCase()
    );
  }

  emailsMatch(): boolean {
    return this.isInvitationEmailMatchingUser();
  }

  onExistingAccount(): void {
    this.goToLogin();
  }

  goToLogin(): void {
    const invitation = this.invitation();

    if (!invitation?.eventId) {
      this.errorMessage.set(
        'Event ID is missing from the invitation.',
      );
      return;
    }

    void this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.dashboardUrl(invitation.eventId, invitation.type),
        email: invitation.email,
      },
    });
  }

  acceptForExistingUser(): void {
    const user = this.authUser();
    const invitation = this.invitation();

    if (
      !user ||
      !invitation ||
      !this.emailsMatch() ||
      this.accepting()
    ) {
      return;
    }

    this.acceptExistingAction.run();
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.accepting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.acceptNewAccountAction.run();
  }

  navigateToDashboard(): void {
    const invitation = this.invitation();

    if (invitation?.eventId) {
      void this.router.navigateByUrl(
        this.dashboardUrl(invitation.eventId, invitation.type),
      );
      return;
    }

    this.goHome();
  }

  goHome(): void {
    void this.router.navigate(['/']);
  }

  private dashboardUrl(eventId: string, type: InvitationType): string {
    switch (type) {
      case InvitationType.Organizer:
        return `/organizer/${eventId}/overview`;

      case InvitationType.AttendanceStaff:
        return `/attendance-staff/${eventId}`;

      case InvitationType.Photographer:
      default:
        return `/photographer/${eventId}/photos`;
    }
  }
}
