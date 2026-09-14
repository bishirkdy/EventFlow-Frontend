import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);


  email = '';
  password = '';

  login() {
    this.authService
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.toastr.success('Login successful');
          this.authService.loadCurrentUser();
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.toastr.error('Invalid email or password');
          console.error('Login failed', err);
        },
      });
  }
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

}
