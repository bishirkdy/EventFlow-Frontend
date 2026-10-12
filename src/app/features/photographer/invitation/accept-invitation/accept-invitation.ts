import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/ui/notification.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserProfile } from '../../../../core/models/common/user-profile';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './accept-invitation.html',
  styleUrl: './accept-invitation.css'
})

export class AcceptInvitation implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly token = signal<string>('');
  readonly invitation = signal<InvitationData | null>(null);
  readonly loading = signal(true);
  readonly accepting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly authUser = signal<UserProfile | null>(null);
  readonly step = signal<'validate' | 'register' | 'complete'>('validate');

  readonly registerForm = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]]
  });

  constructor() {
    effect(() => {
      const token = this.route.snapshot.paramMap.get('token');
      if (token) {
        this.token.set(token);
        this.validateInvitation(token);
      }
    });
  }

  ngOnInit() {
    this.authUser.set(this.authService.currentUser());
    if (!this.authUser()) {
      this.authService.loadCurrentUser().subscribe((user) => {
        this.authUser.set(user);
      });
    }
  }

  emailsMatch(): boolean {
    const user = this.authUser();
    const invitation = this.invitation();
    return !!user && !!invitation && user.email.toLowerCase() === invitation.email.toLowerCase();
  }

  private validateInvitation(token: string) {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.http.get<ApiResponse<InvitationData>>(`${environment.apiUrl}/v1/invitations/${token}`)
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          const data = response.data;

          if (!response.isSuccess || !data || !data.email || !data.eventId) {
            this.errorMessage.set('Invalid invitation link. Please use the link from your email.');
            return;
          }

          // Keep data so login can deep-link back to the event dashboard.
          this.invitation.set(data);

          if (data.status === 1) {
            this.errorMessage.set('This invitation has already been accepted. Please log in to continue.');
            return;
          }

          if (data.status === 2) {
            this.errorMessage.set('This invitation has been revoked. Please contact the event organizer.');
            return;
          }

          // Pending = 0 is the only state that can be accepted.
          if (data.status !== 0) {
            this.errorMessage.set('This invitation is no longer active.');
            return;
          }

          if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
            this.errorMessage.set('This invitation has expired. Please ask the event organizer for a new one.');
            return;
          }
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Invalid invitation link. Please use the link from your email.');
        }
      });
  }

  goToLogin() {
    const invitation = this.invitation();
    const returnUrl =
      invitation && invitation.status === 1
        ? `/photographer/${invitation.eventId}/photos`
        : this.router.url;
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl,
        email: invitation?.email ?? undefined,
      },
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  onExistingAccount() {
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.router.url,
        email: this.invitation()?.email ?? undefined,
      },
    });
  }

  acceptForExistingUser() {
    const user = this.authUser();
    const invitation = this.invitation();
    if (!user || !invitation || !this.emailsMatch()) {
      return;
    }

    this.accepting.set(true);

    this.http.post<ApiResponse<AcceptInvitationResponse>>(
      `${environment.apiUrl}/v1/invitations/${this.token()}/accept`,
      {
        password: 'invitation-accept',
        userName: user.userName,
        firstName: user.firstName || user.userName,
        lastName: user.lastName || 'User'
      }
    ).subscribe({
      next: (response) => {
        this.accepting.set(false);
        if (response.isSuccess) {
          this.notification.success('Invitation accepted! You are now a photographer for this event.');
          this.navigateToDashboard();
        } else {
          this.notification.error(response.message || 'Failed to accept invitation.');
        }
      },
      error: (error) => {
        this.accepting.set(false);
        this.notification.error(error.error?.message || 'Failed to accept invitation.');
      }
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.accepting.set(true);
    const formValue = this.registerForm.getRawValue();

    this.http.post<ApiResponse<AcceptInvitationResponse>>(
      `${environment.apiUrl}/v1/invitations/${this.token()}/accept`,
      {
        password: formValue.password,
        userName: formValue.userName,
        firstName: formValue.firstName,
        lastName: formValue.lastName
      }
    ).subscribe({
      next: (response) => {
        this.accepting.set(false);
        if (response.isSuccess) {
          this.step.set('complete');
          this.notification.success('Account created successfully! You are now a photographer for this event.');
        } else {
          this.notification.error(response.message || 'Failed to accept invitation.');
        }
      },
      error: (error) => {
        this.accepting.set(false);
        this.notification.error(error.error?.message || 'Failed to accept invitation.');
      }
    });
  }

  navigateToDashboard() {
    const invitation = this.invitation();
    if (invitation) {
      this.router.navigate(['/photographer', invitation.eventId, 'photos']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

interface InvitationData {
  invitationId: string;
  eventId: string;
  eventName: string;
  email: string;
  roleName: string;
  expiresAt: string;
  status: number;
}

interface AcceptInvitationResponse {
  userId: string;
  invitationId: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}