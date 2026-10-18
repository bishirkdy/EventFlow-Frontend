import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Eye, EyeOff, LucideAngularModule, X } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginRequest } from '../../../core/models/auth';
import { LoginDialogService } from '../../../core/services/ui/login-dialog.service';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { createAsyncAction } from '@/core/state';

@Component({
  selector: 'app-login-dialog',
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login-dialog.html'
})
export class LoginDialog {
  readonly service = inject(LoginDialogService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(NotificationService);
  private readonly router = inject(Router);

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly CloseIcon = X;

  email = '';
  password = '';

  private readonly loginAction = createAsyncAction(
    (credentials: LoginRequest) => this.authService.login(credentials),
    {
      onSuccess: (user) => {
        if (user) {
          this.toastr.success('Login successful.');
          const returnUrl = this.service.takeReturnUrl();
          this.service.close();
          if (returnUrl) {
            void this.router.navigateByUrl(returnUrl);
          }
        } else {
          this.toastr.error('Login failed.');
        }
      },
      errorFallback: 'Login failed.'
    }
  );

  readonly showPassword = signal(false);
  readonly loading = this.loginAction.pending;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.service.isOpen()) {
      this.service.close();
    }
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  submit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.loginAction.run({ email: this.email, password: this.password });
  }
}
