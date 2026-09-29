import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration-form-page',
  standalone: true,
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css',
})
export class RegistrationFormPageComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly eventId = signal(this.route.snapshot.paramMap.get('eventId'));

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
}
