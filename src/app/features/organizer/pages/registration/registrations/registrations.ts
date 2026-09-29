import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registrations',
  standalone: true,
  templateUrl: './registrations.html',
  styleUrl: './registrations.css',
})
export class RegistrationsComponent {
  protected readonly route = inject(ActivatedRoute);
  protected readonly eventId = signal(this.route.snapshot.paramMap.get('eventId'));

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
}
