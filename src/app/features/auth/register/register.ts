import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/ui/notification.service';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth/auth.service';
import { getApiErrorMessage } from '../../../core/api/api-error';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(NotificationService);

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  confirmPassword = '';

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  loading = signal(false);

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  register(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }

    this.loading.set(true);

    this.authService
      .register({userName: this.username, email: this.email, password: this.password, firstName: this.firstName, lastName: this.lastName})
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.toastr.success('Account created successfully.');
          this.router.navigate(['/login']);
        },

        error: (err: unknown) => {
          console.error('Registration failed:', err);
          this.toastr.error(getApiErrorMessage(err, 'Registration failed. Please try again.'));
        },
      });
  }
}
