import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth/auth.service';
import { getApiErrorMessage } from '../../../core/api/api-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(NotificationService);

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  email = '';
  password = '';

  readonly showPassword = signal(false);
  readonly loading = signal(false);

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  login(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastr.success('Login successful.');
        this.router.navigateByUrl(this.returnTarget());
      },

      error: (err: unknown) => {
        console.error('Login failed:', err);
        this.loading.set(false);
        this.toastr.error(getApiErrorMessage(err, 'Login failed.'));
      },
    });
  }

  private returnTarget(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    // Only accept same-origin absolute paths to avoid open redirects.
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      return returnUrl;
    }
    return '/';
  }
}
