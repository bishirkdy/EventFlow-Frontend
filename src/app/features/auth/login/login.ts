import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../core/services/auth/auth.service';

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
  private readonly toastr = inject(ToastrService);

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

    this.authService
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);

          this.toastr.success('Login successful.');

          this.router.navigate(['/']);
        },

        error: (err: unknown) => {
          console.error('Login failed:', err);

          this.loading.set(false);

          this.toastr.error(
            'Invalid email or password.'
          );
        },
      });
  }
}