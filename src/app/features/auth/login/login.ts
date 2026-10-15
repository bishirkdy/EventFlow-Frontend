import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginRequest } from '../../../core/models/auth';
import { createAsyncAction } from 'core/state';

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

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  email = '';
  password = '';

  private readonly loginAction = createAsyncAction(
    (credentials: LoginRequest) => this.authService.login(credentials),
    {
      successMessage: 'Login successful.',
      onSuccess: () => this.router.navigateByUrl(this.returnTarget()),
      errorFallback: 'Login failed.',
    },
  );

  ngOnInit(): void {
    const loginEmail = this.route.snapshot.queryParamMap.get('email');
    if (loginEmail) {
      this.email = loginEmail;
    }
  }

  readonly showPassword = signal(false);
  readonly loading = this.loginAction.pending;

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  login(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.loginAction.run({ email: this.email, password: this.password });
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
