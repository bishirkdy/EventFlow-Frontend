import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router , RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  confirmPassword = '';

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

register(): void {
  this.authService.register({
    userName: this.username,
    email: this.email,
    password: this.password,
    firstName: this.firstName,
    lastName: this.lastName,
  }).subscribe({
    next: () => {
      this.router.navigate(['/login']);
    },

    error: (err) => {
      console.error('Registration failed:', err);
    },
  });
}
}
