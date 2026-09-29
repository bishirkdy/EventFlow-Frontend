import { Component, input } from '@angular/core';

@Component({
  selector: 'app-registration-status',
  standalone: true,
  templateUrl: './registration-status.html',
  styleUrl: './registration-status.css',
})
export class RegistrationStatusComponent {
  readonly label = input('Pending');
}
