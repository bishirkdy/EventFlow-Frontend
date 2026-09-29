import { Component, input } from '@angular/core';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css',
})
export class RegistrationFormComponent {
  readonly label = input('Registration Form');
}
