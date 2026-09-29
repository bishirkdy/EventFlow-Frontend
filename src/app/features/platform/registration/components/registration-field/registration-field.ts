import { Component, input } from '@angular/core';

@Component({
  selector: 'app-registration-field',
  standalone: true,
  templateUrl: './registration-field.html',
  styleUrl: './registration-field.css',
})
export class RegistrationFieldComponent {
  readonly label = input('Registration Field');
}
