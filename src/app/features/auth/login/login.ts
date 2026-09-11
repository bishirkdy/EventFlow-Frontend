import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }
}
