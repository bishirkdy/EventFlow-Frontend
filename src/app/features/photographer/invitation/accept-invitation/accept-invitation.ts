import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/ui/notification.service';
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

  readonly token = signal<string>('');
  readonly invitation = signal<InvitationData | null>(null);
  readonly loading = signal(true);
  readonly accepting = signal(false);
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

  ngOnInit() {}

  private validateInvitation(token: string) {
    this.loading.set(true);
    this.http.get<ApiResponse<InvitationData>>(`${environment.apiUrl}/invitations/${token}`)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.invitation.set(response.data);
            this.loading.set(false);
          } else {
            this.loading.set(false);
            this.notification.error('Invalid or expired invitation link.');
            this.router.navigate(['/']);
          }
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Invalid or expired invitation link.');
          this.router.navigate(['/']);
        }
      });
  }

  onExistingAccount() {
    this.step.set('register');
    // Pre-fill email from invitation
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.accepting.set(true);
    const formValue = this.registerForm.getRawValue();

    this.http.post<ApiResponse<AcceptInvitationResponse>>(
      `${environment.apiUrl}/invitations/${this.token()}/accept`,
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