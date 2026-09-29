import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration-settings',
  standalone: true,
  templateUrl: './registration-settings.html',
  styleUrl: './registration-settings.css',
})
export class RegistrationSettingsComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly eventId = signal(this.route.snapshot.paramMap.get('eventId'));

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
}
