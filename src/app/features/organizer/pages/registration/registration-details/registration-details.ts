import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration-details',
  standalone: true,
  templateUrl: './registration-details.html',
  styleUrl: './registration-details.css',
})
export class RegistrationDetailsComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly eventId = signal(this.route.snapshot.paramMap.get('eventId'));

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
}
